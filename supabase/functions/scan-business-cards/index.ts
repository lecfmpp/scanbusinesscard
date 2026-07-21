import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') || '';
  const isAllowed = origin === 'https://scanbusinesscard.com' || origin.endsWith('.scanbusinesscard.com') || origin.endsWith('.netlify.app') || origin.endsWith('.lovable.app') || origin.startsWith('http://localhost:');
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : 'https://scanbusinesscard.com',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  };
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid user' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { images } = await req.json();

    // Input validation
    if (!Array.isArray(images) || images.length === 0 || images.length > 10) {
      return new Response(
        JSON.stringify({ error: 'Please provide between 1 and 10 images.' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    for (const img of images) {
      if (typeof img !== 'string' || img.length > 14000000) {
        return new Response(
          JSON.stringify({ error: 'One or more images exceed the size limit.' }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (!img.match(/^data:image\/(jpeg|png|webp|gif|bmp|heic);base64,/)) {
        return new Response(
          JSON.stringify({ error: 'Invalid image format. Please use JPEG, PNG, or WebP.' }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // ---- Scan quota -------------------------------------------------------
    // Enforced here because this is the only place that cannot be bypassed; the
    // client gate exists purely to show the paywall before the camera opens.
    // One image is one scan, so a batch of 10 costs 10 — otherwise the whole
    // allowance could be spent in a single request.
    const admin = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    );

    const TRIAL_SCANS = 1;
    const PAID_SCANS = 30;

    const { data: sub } = await admin
      .from('subscriptions')
      .select('status, current_period_end')
      .eq('user_id', user.id)
      .maybeSingle();

    const subscriptionActive =
      sub?.status === 'active' &&
      (!sub.current_period_end || new Date(sub.current_period_end) > new Date());
    const scansLimit = subscriptionActive ? PAID_SCANS : TRIAL_SCANS;

    const now = new Date();
    const { data: usageRow } = await admin
      .from('scan_usage')
      .select('id, scan_count, period_end')
      .eq('user_id', user.id)
      .order('period_start', { ascending: false })
      .limit(1)
      .maybeSingle();

    let usageId: string | null = usageRow?.id ?? null;
    let scansUsed: number = usageRow?.scan_count ?? 0;

    // Roll the window over once it lapses, so each period starts from zero
    // instead of accumulating for the life of the account.
    const windowExpired = usageRow?.period_end
      ? new Date(usageRow.period_end) <= now
      : false;

    if (!usageRow || windowExpired) {
      const periodEnd = new Date(now);
      periodEnd.setMonth(periodEnd.getMonth() + 1);
      const { data: created, error: usageInsertError } = await admin
        .from('scan_usage')
        .insert({
          user_id: user.id,
          scan_count: 0,
          period_start: now.toISOString(),
          period_end: periodEnd.toISOString(),
        })
        .select('id')
        .single();
      if (usageInsertError) console.error('Failed to open usage window:', usageInsertError);
      usageId = created?.id ?? null;
      scansUsed = 0;
    }

    if (scansUsed + images.length > scansLimit) {
      return new Response(
        JSON.stringify({
          error: subscriptionActive
            ? 'You have used all your scans for this period.'
            : 'Your free scan has been used. Subscribe to keep scanning.',
          code: 'quota_exceeded',
          scansUsed,
          scansLimit,
        }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // AI provider selection.
    // Prefers Google Gemini direct. Falls back to the Lovable gateway when
    // GEMINI_API_KEY is absent, so this function keeps working on the old
    // project during the migration cutover. Both are OpenAI-compatible, so
    // the request/response shape below is identical either way.
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const useGemini = Boolean(GEMINI_API_KEY);

    const AI_API_KEY = GEMINI_API_KEY ?? LOVABLE_API_KEY;
    const AI_ENDPOINT = useGemini
      ? "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions"
      : "https://ai.gateway.lovable.dev/v1/chat/completions";
    // Gemini direct uses a bare model id; the Lovable gateway namespaces it.
    const AI_MODEL = useGemini ? "gemini-2.5-flash" : "google/gemini-2.5-flash";

    if (!AI_API_KEY) {
      console.error("No AI key configured. Set GEMINI_API_KEY (or LOVABLE_API_KEY).");
      return new Response(
        JSON.stringify({ error: 'Service configuration error. Please try again later.' }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    console.log(`AI provider: ${useGemini ? "gemini-direct" : "lovable-gateway"}`);

    const extractedCards = [];

    for (const base64Image of images) {
      console.log("Processing image for user:", user.id);
      
      const response = await fetch(AI_ENDPOINT, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${AI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: AI_MODEL,
          messages: [
            {
              role: "system",
              content: "You are a business card OCR system that excels at identifying and extracting information from MULTIPLE business cards in a single image. You can detect multiple distinct business cards even when they're placed side by side or in a grid layout."
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Analyze this image and identify ALL business cards present. There may be multiple cards in this single image.

For EACH business card you find, extract the contact information.

Return ONLY a valid JSON array where each element represents one business card with these exact fields:
- fullName (string)
- jobTitle (string)
- company (string)
- email (string)
- phone (string) - MUST be in international E.164 format with country code (e.g., "+1234567890" for US numbers, "+442071234567" for UK numbers). Include the + symbol and country code.
- website (string)

If any field is not found on a card, use an empty string "".

CRITICAL PHONE FORMATTING RULES:
- Always format phone numbers in E.164 international format: +[country code][number]
- Remove all spaces, dashes, parentheses, and other formatting characters
- Include the + symbol at the start
- Detect the country from the business card context (address, company location, area code)
- Common country codes: US/Canada +1, UK +44, Australia +61, Germany +49, France +33, Japan +81, China +86
- Examples: "+12125551234" (US), "+442071234567" (UK), "+61298765432" (Australia)

IMPORTANT: 
- Look for multiple cards in the image - they may be arranged side by side, in a grid, or overlapping
- Each distinct business card should be a separate object in the array
- Return an array even if you only find one card: [{"fullName": "...", ...}]
- Do not include any markdown formatting, explanations, or additional text
- Return ONLY the JSON array

Example format:
[
  {"fullName": "John Doe", "jobTitle": "CEO", "company": "Acme Inc", "email": "john@acme.com", "phone": "+12125551234", "website": "acme.com"},
  {"fullName": "Jane Smith", "jobTitle": "CTO", "company": "Tech Corp", "email": "jane@tech.com", "phone": "+442071234567", "website": "techcorp.com"}
]`
                },
                {
                  type: "image_url",
                  image_url: {
                    url: base64Image
                  }
                }
              ]
            }
          ],
          temperature: 0.1,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (response.status === 402) {
          return new Response(
            JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        console.error("AI gateway error:", response.status);
        return new Response(
          JSON.stringify({ error: "Failed to process image. Please try again." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      if (content) {
        try {
          let jsonStr = content.trim();
          if (jsonStr.startsWith("```json")) jsonStr = jsonStr.slice(7);
          if (jsonStr.startsWith("```")) jsonStr = jsonStr.slice(3);
          if (jsonStr.endsWith("```")) jsonStr = jsonStr.slice(0, -3);
          jsonStr = jsonStr.trim();
          
          const cardsArray = JSON.parse(jsonStr);
          
          if (Array.isArray(cardsArray)) {
            cardsArray.forEach((cardData: any) => {
              extractedCards.push({
                id: crypto.randomUUID(),
                fullName: String(cardData.fullName || "").slice(0, 200),
                jobTitle: String(cardData.jobTitle || "").slice(0, 200),
                company: String(cardData.company || "").slice(0, 200),
                email: String(cardData.email || "").slice(0, 300),
                phone: String(cardData.phone || "").slice(0, 50),
                website: String(cardData.website || "").slice(0, 500),
              });
            });
          } else if (cardsArray && typeof cardsArray === 'object') {
            extractedCards.push({
              id: crypto.randomUUID(),
              fullName: String(cardsArray.fullName || "").slice(0, 200),
              jobTitle: String(cardsArray.jobTitle || "").slice(0, 200),
              company: String(cardsArray.company || "").slice(0, 200),
              email: String(cardsArray.email || "").slice(0, 300),
              phone: String(cardsArray.phone || "").slice(0, 50),
              website: String(cardsArray.website || "").slice(0, 500),
            });
          }
        } catch (parseError) {
          console.error("Failed to parse card data from AI response");
        }
      }
    }
    
    console.log(`Total cards extracted: ${extractedCards.length} for user: ${user.id}`);

    // Charge the quota only once the AI actually ran. Billing on entry would
    // burn a scan on an upstream failure the user had no control over.
    if (usageId) {
      const { error: usageUpdateError } = await admin
        .from('scan_usage')
        .update({ scan_count: scansUsed + images.length, updated_at: new Date().toISOString() })
        .eq('id', usageId);
      if (usageUpdateError) console.error('Failed to record usage:', usageUpdateError);
    }

    return new Response(
      JSON.stringify({
        cards: extractedCards,
        scansUsed: scansUsed + images.length,
        scansLimit,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in scan-business-cards:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred while processing your request. Please try again." }),
      { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );
  }
});

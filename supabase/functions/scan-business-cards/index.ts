import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { images } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const extractedCards = [];

    // Process each image with Gemini
    for (const base64Image of images) {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: "You are a business card OCR system. Extract contact information from business card images and return it in JSON format."
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Extract all contact information from this business card. Return ONLY valid JSON with these exact fields: fullName, jobTitle, company, email, phone, website. If any field is not found, use empty string. Do not include any markdown formatting or additional text."
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
        const errorText = await response.text();
        console.error("AI gateway error:", response.status, errorText);
        throw new Error("AI gateway error");
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      if (content) {
        try {
          // Clean the response - remove markdown code blocks if present
          let jsonStr = content.trim();
          if (jsonStr.startsWith("```json")) {
            jsonStr = jsonStr.slice(7);
          }
          if (jsonStr.startsWith("```")) {
            jsonStr = jsonStr.slice(3);
          }
          if (jsonStr.endsWith("```")) {
            jsonStr = jsonStr.slice(0, -3);
          }
          jsonStr = jsonStr.trim();
          
          const cardData = JSON.parse(jsonStr);
          extractedCards.push({
            id: crypto.randomUUID(),
            fullName: cardData.fullName || "",
            jobTitle: cardData.jobTitle || "",
            company: cardData.company || "",
            email: cardData.email || "",
            phone: cardData.phone || "",
            website: cardData.website || "",
          });
        } catch (parseError) {
          console.error("Failed to parse card data:", content, parseError);
          // Add a card with empty data if parsing fails
          extractedCards.push({
            id: crypto.randomUUID(),
            fullName: "",
            jobTitle: "",
            company: "",
            email: "",
            phone: "",
            website: "",
          });
        }
      }
    }

    return new Response(
      JSON.stringify({ cards: extractedCards }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in scan-business-cards:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

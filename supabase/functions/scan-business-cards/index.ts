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

    // Process each image with Gemini - each image may contain MULTIPLE cards
    for (const base64Image of images) {
      console.log("Processing image for multiple business cards...");
      
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
        const errorText = await response.text();
        console.error("AI gateway error:", response.status, errorText);
        throw new Error("AI gateway error");
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      console.log("AI Response content:", content);
      
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
          
          console.log("Cleaned JSON string:", jsonStr);
          
          // Parse the response - expecting an array of cards
          const cardsArray = JSON.parse(jsonStr);
          
          // Ensure we have an array
          if (Array.isArray(cardsArray)) {
            console.log(`Found ${cardsArray.length} card(s) in this image`);
            
            // Add each card from this image to our results
            cardsArray.forEach((cardData: any) => {
              extractedCards.push({
                id: crypto.randomUUID(),
                fullName: cardData.fullName || "",
                jobTitle: cardData.jobTitle || "",
                company: cardData.company || "",
                email: cardData.email || "",
                phone: cardData.phone || "",
                website: cardData.website || "",
              });
            });
          } else {
            // If not an array, treat as single card
            console.log("Response was not an array, treating as single card");
            extractedCards.push({
              id: crypto.randomUUID(),
              fullName: cardsArray.fullName || "",
              jobTitle: cardsArray.jobTitle || "",
              company: cardsArray.company || "",
              email: cardsArray.email || "",
              phone: cardsArray.phone || "",
              website: cardsArray.website || "",
            });
          }
        } catch (parseError) {
          console.error("Failed to parse card data:", content, parseError);
          console.error("Parse error details:", parseError);
          // Don't add empty card on error - just skip this image
        }
      } else {
        console.log("No content in AI response");
      }
    }
    
    console.log(`Total cards extracted: ${extractedCards.length}`);

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

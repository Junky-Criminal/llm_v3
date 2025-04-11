
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in the environment variables');
    }

    const { messages, systemPrompt } = await req.json();

    console.log("Processing request with:", { 
      messageCount: messages.length, 
      systemPromptLength: systemPrompt.length 
    });

    // Build the complete message history with the system prompt
    const promptMessages = [
      { role: "user", parts: [{ text: systemPrompt }] },
      { role: "model", parts: [{ text: "I'll help extract task details as instructed." }] },
      ...messages.map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }]
      }))
    ];

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: promptMessages,
        generationConfig: {
          temperature: 0.4,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API Error:', errorData);
      throw new Error(`Gemini API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    console.log("Received response from Gemini API", { status: response.status });
    
    if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content) {
      throw new Error('Invalid response from Gemini API');
    }

    const generatedText = data.candidates[0].content.parts[0].text;
    console.log("Generated text length:", generatedText.length);

    // Parse task details if the response contains a structured task summary
    let taskSummary = null;
    try {
      // Look for structured data in the response
      const titleMatch = generatedText.match(/Title:\s*([^\n]+)/);
      const descriptionMatch = generatedText.match(/Description:\s*([^\n]+)/);
      const priorityMatch = generatedText.match(/Priority:\s*(high|medium|low)/i);
      const tagsMatch = generatedText.match(/Tags?:\s*([^\n]+)/);
      const timeSlotMatch = generatedText.match(/Time(\s*Slot)?:\s*([^\n]+)/);
      const durationMatch = generatedText.match(/Duration:\s*([^\n]+)/);
      const deadlineMatch = generatedText.match(/Deadline:\s*([^\n]+)/);
      const scheduledDateMatch = generatedText.match(/Scheduled(\s*Date)?:\s*([^\n]+)/);
      
      if (titleMatch) {
        taskSummary = {
          title: titleMatch[1].trim(),
          description: descriptionMatch ? descriptionMatch[1].trim() : "",
          priority: priorityMatch ? priorityMatch[1].toLowerCase() : "medium",
          tags: tagsMatch ? 
            tagsMatch[1].trim().toLowerCase().split(/,\s*/).map(tag => tag.trim()) : 
            ["personal"],
          timeSlot: timeSlotMatch ? timeSlotMatch[2].trim() : "",
          duration: durationMatch ? durationMatch[1].trim() : "",
          deadline: deadlineMatch ? deadlineMatch[1].trim() : "",
          scheduledDate: scheduledDateMatch ? scheduledDateMatch[2].trim() : ""
        };
        console.log("Successfully parsed task summary:", JSON.stringify(taskSummary));
      } else {
        console.log("No structured task data found in response");
      }
    } catch (error) {
      console.error('Error parsing task summary:', error);
      // If parsing fails, continue without task summary
    }

    return new Response(
      JSON.stringify({
        generatedText,
        taskSummary
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Function error:', error.message);
    return new Response(
      JSON.stringify({
        error: error.message
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

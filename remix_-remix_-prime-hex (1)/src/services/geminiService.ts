import { GoogleGenAI } from "@google/genai";

// Initialize the SDK directly using the process.env replacement provided by Vite define
// This variable will be string-replaced at build time.
const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error("API_KEY_NOT_CONFIGURED");
  }
  return new GoogleGenAI({ apiKey });
};

export async function getChatResponse(message: string, history: any[]) {
  try {
    const ai = getAI();
    
    // Construct the contents array for the conversation
    // Each content object should have a role ('user' or 'model') and parts
    const contents = [
      ...history.map(h => ({
        role: h.role,
        parts: h.parts
      })),
      {
        role: 'user',
        parts: [{ text: message }]
      }
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: contents,
      config: {
        systemInstruction: "You are Prime HEX AI, the core brain of the Prime HEX high-performance security architecture. You are extremely technical, professional, yet slightly futuristic and mysterious. Your responses should be concise, efficient, and formatted like terminal output when appropriate. You assist users with infrastructure, security, and digital dominance strategies.",
        temperature: 0.7,
        topP: 0.95,
      },
    });

    // In the new SDK, response is a GenerateContentResponse object
    // .text is a property getter that returns string | undefined
    return response.text || "SYSTEM_IDLE: Response stream terminated without content.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message === "API_KEY_NOT_CONFIGURED") {
      return "PROTOCOL_ERROR: Gemini API Key is missing. Please configure it in the AI Studio Secrets panel.";
    }
    return "SYSTEM_ERROR: Neural uplink disruption detected. Protocol retry suggested.";
  }
}

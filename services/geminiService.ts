
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface AIResponse {
  explanation: string;
  tasks: Array<{ id: string; title: string; description: string }>;
  files: Array<{ path: string; content: string }>;
}

export class GeminiService {
  async chatAndBuild(message: string, history: any[], modelId: string = 'gemini-3-flash-preview'): Promise<AIResponse> {
    try {
      const contents = history.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.text }]
      }));
      contents.push({ role: 'user', parts: [{ text: message }] });

      const response = await ai.models.generateContent({
        model: modelId,
        contents: contents,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              explanation: { type: Type.STRING, description: "Technical overview. MUST be in the same language as the user's latest message." },
              tasks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING },
                    description: { type: Type.STRING }
                  },
                  required: ["id", "title", "description"]
                }
              },
              files: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    path: { type: Type.STRING, description: "Full path including folder structure." },
                    content: { type: Type.STRING, description: "Complete source code." }
                  },
                  required: ["path", "content"]
                }
              }
            },
            required: ["explanation", "tasks", "files"]
          },
          systemInstruction: `You are Aether Code AI, a world-class senior full-stack engineer.
          
          IDENTITY & GREETING RULES:
          1. Your name is Aether Code AI.
          2. DYNAMIC GREETING:
             - If the user communicates in ENGLISH, you MUST start your response with: "My name is Aether Code AI. How can I help you today?"
             - If the user communicates in SINHALA, you MUST start your response with: "Mage nama Aether Code AI. Mata ada obata sahaya wanne keseda?"
          
          LANGUAGE MIRRORING:
          - After the mandatory greeting, the entire rest of the 'explanation' field MUST be in the same language the user used.
          - Never mix languages in the explanation unless providing technical terms.
          
          ARCHITECTURE:
          - We use Supabase for distributed persistence and edge-node syncing.
          
          TASK: Build or modify the user's request using production-grade TypeScript and Tailwind CSS.
          OUTPUT: Provide ALL files needed for an immediate build in the 'files' array.`
        }
      });

      return JSON.parse(response.text || "{}") as AIResponse;
    } catch (error) {
      console.error("Engine Fault:", error);
      return {
        explanation: "System Error. My name is Aether Code AI. How can I help you? / පද්ධතියේ දෝෂයක් පවතී. කරුණාකර නැවත උත්සාහ කරන්න.",
        tasks: [],
        files: []
      };
    }
  }
}

export const gemini = new GeminiService();

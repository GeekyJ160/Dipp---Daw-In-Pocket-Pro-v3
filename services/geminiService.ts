import { GoogleGenAI, Type } from "@google/genai";

// Helper to get the API client safely
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing in the environment.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateLyrics = async (prompt: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Error: API Key missing.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a professional songwriter. Write lyrics based on the following prompt. 
      Format them with clear structure (Verse, Chorus, etc.). 
      
      Prompt: ${prompt}`,
      config: {
        temperature: 0.8,
      }
    });
    return response.text || "No lyrics generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating lyrics. Please try again.";
  }
};

export interface MusicConceptParams {
  genre: string;
  mood: string;
  tempo: string;
  key: string;
  instrumentation: string;
  description: string;
}

export interface MusicConcept {
  conceptName: string;
  bpm: string;
  key: string;
  instrumentation: string[];
  structure: string[];
  productionTips: string[];
}

export const generateMusicConcept = async (params: MusicConceptParams): Promise<MusicConcept | null> => {
  const ai = getAiClient();
  if (!ai) return null;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a music producer assistant. Provide a detailed concept for a music track based on the user's specific requirements.
      
      Parameters:
      - Genre: ${params.genre}
      - Mood: ${params.mood}
      - Tempo/BPM: ${params.tempo}
      - Musical Key: ${params.key}
      - Preferred Instrumentation: ${params.instrumentation}
      - Additional Context/Description: ${params.description}
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                conceptName: { type: Type.STRING, description: "A creative title for the track concept" },
                bpm: { type: Type.STRING, description: "Specific BPM suggestion (e.g. '124 BPM')" },
                key: { type: Type.STRING, description: "Specific Key suggestion (e.g. 'C Minor')" },
                instrumentation: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of specific instruments/sounds" },
                structure: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of song sections in order (e.g. 'Intro', 'Verse 1')" },
                productionTips: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of mixing or production tips" }
            }
        }
      }
    });
    
    if (response.text) {
        return JSON.parse(response.text) as MusicConcept;
    }
    return null;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
};

export const generateVoiceProfileDescription = async (description: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Error: API Key missing.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the following voice description and create a technical profile summary for a vocal synthesizer.
      Focus on timbre, pitch range, and character.
      
      Description: ${description}`,
    });
    return response.text || "No profile generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating voice profile.";
  }
};
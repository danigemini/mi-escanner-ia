import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ScannedBookData } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: "El título completo del libro tal como aparece en el lomo o inferido.",
      },
      author: {
        type: Type.STRING,
        description: "El nombre del autor. Si no es visible, el nombre más probable.",
      },
    },
    required: ["title", "author"],
  },
};

export const analyzeBooksImage = async (base64Image: string): Promise<ScannedBookData[]> => {
  try {
    // Clean base64 string if it contains headers
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: cleanBase64,
            },
          },
          {
            text: `Analiza esta imagen de libros apilados (lomos visibles). 
            Identifica cada libro individualmente.
            Extrae el TÍTULO y el AUTOR del lomo.
            SI EL AUTOR NO ES VISIBLE: Usa tus conocimientos o busca en internet para encontrar el autor más probable basado en el título y el diseño.
            Devuelve una lista JSON limpia.`,
          },
        ],
      },
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        thinkingConfig: {
          thinkingBudget: 32768, // High budget for complex OCR and deduction
        },
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text) as ScannedBookData[];
      return data;
    }
    
    throw new Error("No se pudo analizar la imagen. Intenta nuevamente.");

  } catch (error) {
    console.error("Error analyzing books:", error);
    throw error;
  }
};

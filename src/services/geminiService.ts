import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

export const generateStudentList = async (topic: string = "diverse international names"): Promise<string[]> => {
  if (!apiKey) {
    console.warn("API Key missing");
    return [];
  }
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a list of 20 ${topic} for a classroom. Return ONLY the names, separated by commas. No numbering.`,
    });
    const text = response.text || "";
    return text.split(',').map(name => name.trim()).filter(name => name.length > 0);
  } catch (error) {
    console.error("AI Error", error);
    return [];
  }
};

export const generateChatResponse = async (message: string): Promise<string> => {
  if (!apiKey) return "API Key missing. Please configure the environment.";
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message,
    });
    return response.text || "No response generated.";
  } catch (error) {
    console.error("Gemini Chat Error", error);
    return "I'm having trouble thinking right now.";
  }
};

export const translateText = async (text: string, targetLanguage: string): Promise<string> => {
  if (!apiKey) return "API Key missing.";
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Translate the following text to ${targetLanguage}: "${text}"`,
    });
    return response.text || "";
  } catch (error) {
    console.error("Translation Error", error);
    return "Translation failed.";
  }
};
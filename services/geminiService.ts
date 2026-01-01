
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getStrategyAudit = async (marketData: any) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Audit the following market data for arbitrage opportunities: ${JSON.stringify(marketData)}. Focus on crash detection and two-leg hedging logic.`,
      config: {
        systemInstruction: "You are a Senior Quant Developer specialized in high-frequency trading and Polymarket CLOB. Provide concise, technical auditing feedback on the bot's logic.",
      }
    });
    return response.text;
  } catch (error) {
    console.error("AI Audit failed:", error);
    return "Audit system offline.";
  }
};

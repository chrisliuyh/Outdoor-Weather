import { GoogleGenAI, Type } from "@google/genai";
import { WeatherMetrics, GroundingSource } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_ID = "gemini-2.5-flash";

export const fetchWeatherForLocation = async (
  query: string, 
  lat?: number, 
  lng?: number
): Promise<{ 
  metrics: WeatherMetrics | null, 
  summary: string, 
  groundingLinks: GroundingSource[] 
}> => {
  
  let promptContext = "";
  if (lat !== undefined && lng !== undefined) {
    promptContext = `The user clicked on the map at Latitude: ${lat}, Longitude: ${lng}. Find the nearest specific place name/city first.`;
  } else {
    promptContext = `The user is searching for: "${query}".`;
  }

  const prompt = `
    ${promptContext}
    
    I need a comprehensive outdoor and astronomy weather report (similar to Meteoblue style data).
    
    Step 1: Use Google Maps to identify the precise location and its ELEVATION (altitude).
    Step 2: Use Google Search to find the REAL-TIME weather and a 3-Day Forecast.
    
    Specific Data Points Required:
    - Elevation (in meters).
    - Current temperature.
    - Cloud Cover (%) and Cloud Ceiling/Base (height in meters/feet). This is crucial for hikers.
    - Rainfall probability/amount.
    - Wind speed (km/h).
    - Visibility (km).
    - Star visibility potential (1-10 score for stargazing).
    - 3-Day Forecast (High/Low temps, condition, rain chance).
    
    Output Requirements:
    1. Provide a helpful natural language summary for an outdoor enthusiast (hiker/photographer). Mention if it's good for stargazing tonight.
    2. At the END, include a JSON block wrapped in \`\`\`json code fences:
    
    JSON Structure:
    {
      "locationName": "string",
      "latitude": number,
      "longitude": number,
      "elevation": number,
      "temperature": number,
      "cloudCover": number,
      "cloudCeiling": "string (e.g., '2000m', 'Low', 'Clear')",
      "windSpeed": number,
      "visibility": number,
      "rainfall": number,
      "isSunny": boolean,
      "starVisibilityScore": number (1-10),
      "description": "Short current condition",
      "forecast": [
        {
          "day": "Short Day Name (e.g. Mon)",
          "date": "Short Date (e.g. Oct 24)",
          "maxTemp": number,
          "minTemp": number,
          "condition": "string",
          "rainChance": number
        }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_ID,
      contents: prompt,
      config: {
        // We use both tools: Maps for location grounding, Search for live weather data
        tools: [
          { googleMaps: {} },
          { googleSearch: {} }
        ],
        temperature: 0.5, 
      },
    });

    const text = response.text || "";
    
    // Extract Grounding Metadata (Maps and Search)
    const groundingLinks: GroundingSource[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    chunks.forEach(chunk => {
      if (chunk.web?.uri) {
        groundingLinks.push({ title: chunk.web.title || "Web Source", uri: chunk.web.uri });
      }
      if (chunk.maps?.uri) { 
         groundingLinks.push({ title: chunk.maps.title || "Google Maps", uri: chunk.maps.uri });
      }
    });

    // Extract JSON block
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
    let metrics: WeatherMetrics | null = null;

    if (jsonMatch && jsonMatch[1]) {
      try {
        metrics = JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.error("Failed to parse weather JSON:", e);
      }
    }

    // Remove the JSON block from the summary for display
    const summary = text.replace(/```json[\s\S]*?```|```[\s\S]*?```/g, '').trim();

    return {
      metrics,
      summary,
      groundingLinks
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
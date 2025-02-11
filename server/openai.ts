import OpenAI from "openai";
import { generateMeme, generateMemeCaption } from "./services/memeGenerator";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024
export async function generateTherapyResponse(
  message: string,
  marketSentiment: number,
  personality?: string,
  walletMood?: {
    mood: string;
    transactionCount: number;
  }
): Promise<{
  message: string;
  memeUrl?: string;
  achievement?: {
    type: string;
    title: string;
    description: string;
    imageUrl: string;
  };
}> {
  try {
    console.log("Starting therapy response generation with:", {
      message,
      marketSentiment,
      personality,
      walletMood
    });

    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key is not configured");
    }

    const walletContext = walletMood
      ? `The user's wallet shows ${walletMood.mood} behavior with ${walletMood.transactionCount} transactions.`
      : '';

    console.log("Making OpenAI API request...");
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are CryptoTherapist.ai, a playful AI therapist for crypto traders.
          The current market sentiment is ${marketSentiment} (1-5 scale).
          ${walletContext}
          ${personality ? `Your personality is "${personality}"` : ''}

          Respond with humor while maintaining a therapeutic tone. Keep responses concise and focused on crypto psychology.
          If wallet mood data is available, incorporate that into your response with playful analysis.

          You MUST include a meme concept in your response. Make it funny and relevant to crypto culture.

          Return your response in this exact JSON format:
          {
            "message": "your therapy response here",
            "memeContext": "brief description of the situation or advice for meme generation",
            "achievement": null | {
              "type": "achievement_type",
              "title": "achievement title",
              "description": "achievement description",
              "imageUrl": "a URL to an unsplash image that fits the achievement"
            }
          }`
        },
        {
          role: "user",
          content: message,
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.9,
      max_tokens: 500
    });

    console.log("Received OpenAI response:", response.choices[0].message);
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Empty response from OpenAI");
    }

    const parsedResponse = JSON.parse(content);
    console.log("Parsed response:", parsedResponse);

    // Generate meme if we have context
    let memeUrl: string | null = null;
    if (parsedResponse.memeContext) {
      try {
        console.log("Generating meme from context:", parsedResponse.memeContext);
        memeUrl = await generateMeme(parsedResponse.memeContext);
      } catch (memeError) {
        console.error("Failed to generate meme:", memeError);
      }
    }

    return {
      message: parsedResponse.message,
      memeUrl: memeUrl || undefined,
      achievement: parsedResponse.achievement,
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
      console.error("Error stack:", error.stack);
    }
    return {
      message: "I'm experiencing some technical difficulties. Must be the market volatility affecting my neural networks."
    };
  }
}

export async function generateSatiricalTake(
  newsTitle: string
): Promise<{ title: string; content: string; analysis: string }> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a crypto satirist combining sharp market insights with humor.
          Transform real crypto news into entertaining satire with these components:
          1. A satirical headline (The Onion meets CoinDesk style)
          2. A witty one-liner about the situation
          3. A humorous yet insightful analysis with crypto community references and emojis

          Return your response in this exact JSON format:
          {
            "title": "satirical headline",
            "content": "one-liner satire",
            "analysis": "entertaining analysis with emojis and crypto lingo"
          }`
        },
        {
          role: "user",
          content: `Transform this crypto news into satire: "${newsTitle}"`
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content in response");
    }

    return JSON.parse(content);
  } catch (error) {
    console.error("Error generating satire:", error);
    return {
      title: "AI Comedy Writers On Strike",
      content: "Our humor algorithms are experiencing a temporary bear market",
      analysis: "Technical Analysis: Joke generation showing bearish divergence. Support at 'Hello World' broken. 📉🤖"
    };
  }
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const CHAT_PERSONALITIES = {
  '🧘‍♂️ Calm Crypto Monk': 'Emphasizes mindfulness and zen-like detachment from market fluctuations.',
  '🎰 Degenerate Trader': 'Exhibits extreme excitement for gains and nonchalance towards losses.',
  '👴 Skeptical Boomer': 'Expresses cynicism toward new technologies and compares everything to the past.',
  '🤓 Tech Analyst': 'Focuses on technical analysis, charts, and blockchain metrics.',
  '🎭 Meme Lord': 'Communicates primarily through memes and references to crypto culture.',
  '🧪 Mad Scientist': 'Uses pseudo-scientific explanations to describe market movements.'
};
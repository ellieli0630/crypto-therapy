import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateTherapyResponse, generateSatiricalTake } from "./openai";
import { getMarketSentiment } from "./coingecko";
import { getLatestNews, type NewsItem } from "./news"; // Added back type NewsItem import
import { insertChatSchema } from "@shared/schema";
import { ZodError } from "zod";
import { getCryptoFiguresAnalysis } from "./twitter";
import { analyzeCustomHandle } from "./twitter";

export function registerRoutes(app: Express): Server {
  app.get("/api/market-sentiment", async (_req, res) => {
    try {
      const sentiment = await getMarketSentiment();
      res.json(sentiment);
    } catch (error) {
      console.error("Market sentiment error:", error);
      res.status(500).json({ error: "Failed to fetch market sentiment" });
    }
  });

app.post("/api/chat", async (req, res) => {
  try {
    console.log("Received chat request:", req.body);
    const { message, userId, personality, walletMood } = insertChatSchema.parse(req.body);

    // Store user message
    await storage.createChat({
      userId,
      message,
      isBot: false,
      personality,
    });

    // Get market sentiment for context
    const { sentiment } = await getMarketSentiment();

    console.log("Generating therapy response...");
    // Generate AI response with meme
    const response = await generateTherapyResponse(message, sentiment, personality, walletMood);
    console.log("Generated response:", response);

    // Store bot response with meme URL
    const botChat = await storage.createChat({
      userId,
      message: response.message,
      isBot: true,
      personality,
      memeUrl: response.memeUrl || null,
    });

    console.log("Saved bot chat:", botChat);

    // Create achievement if generated
    let achievement = null;
    if (response.achievement) {
      achievement = await storage.createAchievement({
        userId,
        ...response.achievement,
      });
    }

    res.json({
      chat: {
        ...botChat,
        memeUrl: response.memeUrl // Explicitly include memeUrl in response
      },
      achievement,
    });
  } catch (error) {
    console.error("Chat error:", error);
    if (error instanceof ZodError) {
      res.status(400).json({ error: "Invalid request data" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

  app.get("/api/achievements/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const achievements = await storage.getAchievements(userId);
      res.json(achievements);
    } catch (error) {
      console.error("Achievements error:", error);
      res.status(500).json({ error: "Failed to fetch achievements" });
    }
  });

  app.get("/api/chats/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const chats = await storage.getChats(userId);
      res.json(chats);
    } catch (error) {
      console.error("Chats error:", error);
      res.status(500).json({ error: "Failed to fetch chats" });
    }
  });

  app.get("/api/news/satire", async (req, res) => {
    try {
      const forceFresh = req.query.fresh === 'true';
      const news = await getLatestNews(forceFresh);

      // Transform into satirical takes
      const satiricalNews = await Promise.all(
        news.map(async (item) => {
          const satireTake = await generateSatiricalTake(item.title);
          return {
            ...item,
            satiricalTitle: satireTake.title,
            satire: satireTake.content,
            analysis: satireTake.analysis,
          };
        })
      );

      res.json(satiricalNews);
    } catch (error) {
      console.error("News API error:", error);
      res.status(500).json({ error: "Failed to fetch news" });
    }
  });

  app.get("/api/crypto-figures", async (_req, res) => {
    try {
      const analysis = await getCryptoFiguresAnalysis();
      res.json(analysis);
    } catch (error) {
      console.error("Crypto figures analysis error:", error);
      res.status(500).json({ error: "Failed to analyze crypto figures" });
    }
  });

  app.post("/api/analyze-handle", async (req, res) => {
    try {
      const { handle } = req.body;
      if (!handle) {
        return res.status(400).json({ error: "Twitter handle is required" });
      }

      const analysis = await analyzeCustomHandle(handle.replace('@', ''));
      res.json(analysis);
    } catch (error) {
      console.error("Custom handle analysis error:", error);
      res.status(500).json({ error: "Failed to analyze Twitter handle" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
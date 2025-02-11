import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const CHAT_PERSONALITIES = {
  "🧘‍♂️ Calm Crypto Monk": "Take a deep breath. The market is transient, like the wind.",
  "🎰 Degenerate Trader": "SEND IT! WHO CARES ABOUT FUNDAMENTALS?! 🚀",
  "👴 Skeptical Boomer": "Back in my day, we used cash. Not these internet magic beans.",
  "🤓 Tech Analyst": "Let's analyze the technical patterns and on-chain metrics.",
  "🎭 Meme Lord": "Everything is a meme, even this financial advice!",
  "🧪 Mad Scientist": "According to my quantum blockchain calculations..."
} as const;

export type ChatPersonality = keyof typeof CHAT_PERSONALITIES;

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  type: text("type").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  earnedAt: timestamp("earned_at").notNull().defaultNow(),
});

export const chats = pgTable("chats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  message: text("message").notNull(),
  isBot: boolean("is_bot").notNull(),
  personality: text("personality"),
  memeUrl: text("meme_url"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).pick({
  userId: true,
  type: true,
  title: true,
  description: true,
  imageUrl: true,
});

// Updated chat schema to make isBot optional in the request
export const insertChatSchema = createInsertSchema(chats)
  .omit({ isBot: true, timestamp: true })
  .extend({
    userId: z.number(),
    message: z.string(),
    personality: z.enum([...Object.keys(CHAT_PERSONALITIES)] as [string, ...string[]]).optional(),
    memeUrl: z.string().nullable().optional(),
    walletMood: z.object({
      mood: z.string(),
      transactionCount: z.number()
    }).optional()
  });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type InsertChat = z.infer<typeof insertChatSchema>;
export type User = typeof users.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
export type Chat = typeof chats.$inferSelect;
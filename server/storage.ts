import { users, type User, type InsertUser, type Achievement, type InsertAchievement, type Chat, type InsertChat } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAchievements(userId: number): Promise<Achievement[]>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  getChats(userId: number): Promise<Chat[]>;
  createChat(chat: InsertChat): Promise<Chat>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private achievements: Map<number, Achievement>;
  private chats: Map<number, Chat>;
  private currentId: { users: number; achievements: number; chats: number };

  constructor() {
    this.users = new Map();
    this.achievements = new Map();
    this.chats = new Map();
    this.currentId = { users: 1, achievements: 1, chats: 1 };
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAchievements(userId: number): Promise<Achievement[]> {
    return Array.from(this.achievements.values()).filter(
      (achievement) => achievement.userId === userId,
    );
  }

  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    const id = this.currentId.achievements++;
    const newAchievement: Achievement = {
      id,
      earnedAt: new Date(),
      title: achievement.title,
      description: achievement.description,
      imageUrl: achievement.imageUrl,
      type: achievement.type,
      userId: achievement.userId ?? null,
    };
    this.achievements.set(id, newAchievement);
    return newAchievement;
  }

  async getChats(userId: number): Promise<Chat[]> {
    return Array.from(this.chats.values())
      .filter((chat) => chat.userId === userId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async createChat(chat: InsertChat): Promise<Chat> {
    const id = this.currentId.chats++;
    const newChat: Chat = {
      id,
      timestamp: new Date(),
      message: chat.message,
      isBot: chat.isBot,
      userId: chat.userId ?? null,
    };
    this.chats.set(id, newChat);
    return newChat;
  }
}

export const storage = new MemStorage();
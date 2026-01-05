import { type User, type InsertUser } from "@shared/schema";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";

// Pro users storage file
const PRO_USERS_FILE = path.join(process.cwd(), "data", "pro_users.json");

// Ensure data directory exists
if (!fs.existsSync(path.join(process.cwd(), "data"))) {
  fs.mkdirSync(path.join(process.cwd(), "data"), { recursive: true });
}

// Pro users management
export interface ProUser {
  githubUsername: string;
  addedAt: string;
  addedBy: string; // 'admin' or 'patreon'
  notes?: string;
}

export class ProUserStorage {
  private proUsers: Map<string, ProUser>;

  constructor() {
    this.proUsers = new Map();
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(PRO_USERS_FILE)) {
        const data = fs.readFileSync(PRO_USERS_FILE, "utf-8");
        const users: ProUser[] = JSON.parse(data);
        users.forEach((user) => {
          this.proUsers.set(user.githubUsername.toLowerCase(), user);
        });
      }
    } catch (error) {
      console.error("Error loading pro users:", error);
    }
  }

  private save() {
    try {
      const users = Array.from(this.proUsers.values());
      fs.writeFileSync(PRO_USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
    } catch (error) {
      console.error("Error saving pro users:", error);
    }
  }

  isPro(githubUsername: string): boolean {
    return this.proUsers.has(githubUsername.toLowerCase());
  }

  addProUser(githubUsername: string, addedBy: string = "admin", notes?: string): ProUser {
    const proUser: ProUser = {
      githubUsername: githubUsername.toLowerCase(),
      addedAt: new Date().toISOString(),
      addedBy,
      notes,
    };
    this.proUsers.set(githubUsername.toLowerCase(), proUser);
    this.save();
    return proUser;
  }

  removeProUser(githubUsername: string): boolean {
    const result = this.proUsers.delete(githubUsername.toLowerCase());
    if (result) {
      this.save();
    }
    return result;
  }

  getAllProUsers(): ProUser[] {
    return Array.from(this.proUsers.values());
  }
}

export const proUserStorage = new ProUserStorage();

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;

  constructor() {
    this.users = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
}

export const storage = new MemStorage();

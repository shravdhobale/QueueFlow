import { type Business, type InsertBusiness, type Queue, type InsertQueue, type User, type InsertUser } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Business methods
  getBusiness(id: string): Promise<Business | undefined>;
  getAllBusinesses(): Promise<Business[]>;
  createBusiness(business: InsertBusiness): Promise<Business>;
  updateBusiness(id: string, updates: Partial<Business>): Promise<Business | undefined>;

  // Queue methods
  getQueueByBusiness(businessId: string): Promise<Queue[]>;
  getQueueItem(id: string): Promise<Queue | undefined>;
  addToQueue(item: InsertQueue): Promise<Queue>;
  updateQueueItem(id: string, updates: Partial<Queue>): Promise<Queue | undefined>;
  removeFromQueue(id: string): Promise<boolean>;
  reorderQueue(businessId: string): Promise<void>;

  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

export class MemStorage implements IStorage {
  private businesses: Map<string, Business>;
  private queues: Map<string, Queue>;
  private users: Map<string, User>;

  constructor() {
    this.businesses = new Map();
    this.queues = new Map();
    this.users = new Map();

    // Initialize with some sample businesses
    this.initializeSampleData();
  }

  private async initializeSampleData() {
    const sampleBusinesses = [
      {
        name: "Elite Hair Salon",
        type: "Hair Salon",
        phone: "+1 (555) 123-4567",
        address: "123 Main Street, Downtown",
        averageServiceTime: 25,
        isActive: true,
      },
      {
        name: "Wellness Clinic",
        type: "Medical Clinic", 
        phone: "+1 (555) 987-6543",
        address: "456 Health Ave, Medical District",
        averageServiceTime: 30,
        isActive: true,
      },
      {
        name: "Quick Fix Auto",
        type: "Auto Repair",
        phone: "+1 (555) 456-7890", 
        address: "789 Service Road, Industrial Zone",
        averageServiceTime: 45,
        isActive: true,
      }
    ];

    for (const business of sampleBusinesses) {
      await this.createBusiness(business);
    }
  }

  // Business methods
  async getBusiness(id: string): Promise<Business | undefined> {
    return this.businesses.get(id);
  }

  async getAllBusinesses(): Promise<Business[]> {
    return Array.from(this.businesses.values()).filter(b => b.isActive);
  }

  async createBusiness(business: InsertBusiness): Promise<Business> {
    const id = randomUUID();
    const newBusiness: Business = {
      ...business,
      id,
      address: business.address || null,
      phone: business.phone || null,
      averageServiceTime: business.averageServiceTime || 25,
      isActive: business.isActive ?? true,
      createdAt: new Date().toISOString(),
    };
    this.businesses.set(id, newBusiness);
    return newBusiness;
  }

  async updateBusiness(id: string, updates: Partial<Business>): Promise<Business | undefined> {
    const business = this.businesses.get(id);
    if (!business) return undefined;
    
    const updated = { ...business, ...updates };
    this.businesses.set(id, updated);
    return updated;
  }

  // Queue methods
  async getQueueByBusiness(businessId: string): Promise<Queue[]> {
    return Array.from(this.queues.values())
      .filter(q => q.businessId === businessId && q.status === "waiting")
      .sort((a, b) => a.position - b.position);
  }

  async getQueueItem(id: string): Promise<Queue | undefined> {
    return this.queues.get(id);
  }

  async addToQueue(item: InsertQueue): Promise<Queue> {
    const id = randomUUID();
    
    // Get current queue length to determine position
    const currentQueue = await this.getQueueByBusiness(item.businessId);
    const position = currentQueue.length + 1;
    
    // Calculate estimated wait time
    const business = await this.getBusiness(item.businessId);
    const estimatedWait = business ? (position - 1) * (business.averageServiceTime || 25) : 0;
    
    const newQueueItem: Queue = {
      ...item,
      id,
      serviceType: item.serviceType || null,
      notes: item.notes || null,
      position,
      estimatedWait,
      status: item.status || "waiting",
      joinedAt: new Date().toISOString(),
      servedAt: null,
    };
    
    this.queues.set(id, newQueueItem);
    return newQueueItem;
  }

  async updateQueueItem(id: string, updates: Partial<Queue>): Promise<Queue | undefined> {
    const item = this.queues.get(id);
    if (!item) return undefined;
    
    const updated = { ...item, ...updates };
    this.queues.set(id, updated);
    return updated;
  }

  async removeFromQueue(id: string): Promise<boolean> {
    const item = this.queues.get(id);
    if (!item) return false;
    
    this.queues.delete(id);
    
    // Reorder remaining queue items
    await this.reorderQueue(item.businessId);
    return true;
  }

  async reorderQueue(businessId: string): Promise<void> {
    const queueItems = await this.getQueueByBusiness(businessId);
    const business = await this.getBusiness(businessId);
    
    queueItems.forEach(async (item, index) => {
      const newPosition = index + 1;
      const estimatedWait = business ? index * (business.averageServiceTime || 25) : 0;
      
      await this.updateQueueItem(item.id, {
        position: newPosition,
        estimatedWait,
      });
    });
  }

  // User methods
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
    const user: User = { 
      ...insertUser, 
      id,
      businessId: insertUser.businessId || null
    };
    this.users.set(id, user);
    return user;
  }
}

export const storage = new MemStorage();

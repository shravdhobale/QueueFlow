import { type Business, type InsertBusiness, type Queue, type InsertQueue, type User, type InsertUser, type Customer, type InsertCustomer, type Category, type InsertCategory } from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

export interface IStorage {
  // Category methods
  getAllCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Customer methods
  getCustomer(id: string): Promise<Customer | undefined>;
  getCustomerByEmail(email: string): Promise<Customer | undefined>;
  getCustomerByPhone(phone: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  
  // Business methods
  getBusiness(id: string): Promise<Business | undefined>;
  getAllBusinesses(): Promise<Business[]>;
  getBusinessesByCategory(categoryId: string): Promise<Business[]>;
  createBusiness(business: InsertBusiness): Promise<Business>;
  updateBusiness(id: string, updates: Partial<Business>): Promise<Business | undefined>;

  // Queue methods
  getQueueByBusiness(businessId: string): Promise<Queue[]>;
  getPendingQueueByBusiness(businessId: string): Promise<Queue[]>;
  getQueueItem(id: string): Promise<Queue | undefined>;
  addToQueue(item: InsertQueue): Promise<Queue>;
  updateQueueItem(id: string, updates: Partial<Queue>): Promise<Queue | undefined>;
  approveQueueItem(id: string, estimatedServiceTime?: number): Promise<Queue | undefined>;
  removeFromQueue(id: string): Promise<boolean>;
  reorderQueue(businessId: string): Promise<void>;

  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

export class MemStorage implements IStorage {
  private categories: Map<string, Category>;
  private customers: Map<string, Customer>;
  private businesses: Map<string, Business>;
  private queues: Map<string, Queue>;
  private users: Map<string, User>;

  constructor() {
    this.categories = new Map();
    this.customers = new Map();
    this.businesses = new Map();
    this.queues = new Map();
    this.users = new Map();

    // Initialize with some sample data
    this.initializeSampleData();
  }

  private async initializeSampleData() {
    // Create categories first
    const sampleCategories = [
      {
        name: "Beauty & Wellness",
        icon: "Scissors",
        description: "Salons, spas, barbershops, and beauty services"
      },
      {
        name: "Healthcare",
        icon: "Stethoscope",
        description: "Clinics, dental offices, physiotherapy"
      },
      {
        name: "Automotive",
        icon: "Wrench",
        description: "Car service centers, repair shops"
      },
      {
        name: "Restaurants & Food",
        icon: "UtensilsCrossed",
        description: "Restaurants, cafes, food services"
      },
      {
        name: "Professional Services",
        icon: "Briefcase",
        description: "Banks, government offices, consulting"
      },
      {
        name: "Retail & Shopping",
        icon: "ShoppingBag",
        description: "Stores with service counters"
      }
    ];

    const createdCategories: Category[] = [];
    for (const category of sampleCategories) {
      const created = await this.createCategory(category);
      createdCategories.push(created);
    }

    const sampleBusinesses = [
      {
        name: "Elite Hair Salon",
        type: "Hair Salon",
        phone: "+1 (555) 123-4567",
        address: "123 Main Street, Downtown",
        categoryId: createdCategories[0].id, // Beauty & Wellness
        rating: "4.8",
        description: "Premium hair styling and treatment services",
        averageServiceTime: 25,
        isActive: true,
      },
      {
        name: "Wellness Clinic",
        type: "Medical Clinic", 
        phone: "+1 (555) 987-6543",
        address: "456 Health Ave, Medical District",
        categoryId: createdCategories[1].id, // Healthcare
        rating: "4.6",
        description: "General healthcare and wellness services",
        averageServiceTime: 30,
        isActive: true,
      },
      {
        name: "Quick Fix Auto",
        type: "Auto Repair",
        phone: "+1 (555) 456-7890", 
        address: "789 Service Road, Industrial Zone",
        categoryId: createdCategories[2].id, // Automotive
        rating: "4.5",
        description: "Fast and reliable automotive repair services",
        averageServiceTime: 45,
        isActive: true,
      }
    ];

    const createdBusinesses: Business[] = [];
    for (const business of sampleBusinesses) {
      const created = await this.createBusiness(business);
      createdBusinesses.push(created);
    }

    // Create sample users for each business
    const sampleUsers = [
      {
        username: "salon_admin",
        password: bcrypt.hashSync("password123", 10),
        businessId: createdBusinesses[0].id, // Elite Hair Salon
      },
      {
        username: "clinic_admin", 
        password: bcrypt.hashSync("password123", 10),
        businessId: createdBusinesses[1].id, // Wellness Clinic
      },
      {
        username: "auto_admin",
        password: bcrypt.hashSync("password123", 10),
        businessId: createdBusinesses[2].id, // Quick Fix Auto
      }
    ];

    for (const user of sampleUsers) {
      await this.createUser(user);
    }
  }

  // Category methods
  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: string): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = randomUUID();
    const newCategory: Category = {
      ...category,
      id,
      icon: category.icon || null,
      description: category.description || null,
      createdAt: new Date().toISOString(),
    };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  // Customer methods
  async getCustomer(id: string): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async getCustomerByEmail(email: string): Promise<Customer | undefined> {
    return Array.from(this.customers.values()).find(
      (customer) => customer.email === email,
    );
  }

  async getCustomerByPhone(phone: string): Promise<Customer | undefined> {
    return Array.from(this.customers.values()).find(
      (customer) => customer.phone === phone,
    );
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const id = randomUUID();
    const customer: Customer = { 
      ...insertCustomer, 
      id,
      email: insertCustomer.email || null,
      phone: insertCustomer.phone || null,
      passwordHash: insertCustomer.passwordHash || null,
      createdAt: new Date().toISOString(),
    };
    this.customers.set(id, customer);
    return customer;
  }

  // Business methods
  async getBusiness(id: string): Promise<Business | undefined> {
    return this.businesses.get(id);
  }

  async getAllBusinesses(): Promise<Business[]> {
    return Array.from(this.businesses.values()).filter(b => b.isActive);
  }

  async getBusinessesByCategory(categoryId: string): Promise<Business[]> {
    return Array.from(this.businesses.values())
      .filter(b => b.isActive && b.categoryId === categoryId);
  }

  async createBusiness(business: InsertBusiness): Promise<Business> {
    const id = randomUUID();
    const newBusiness: Business = {
      ...business,
      id,
      address: business.address || null,
      phone: business.phone || null,
      categoryId: business.categoryId || null,
      rating: business.rating || "0.0",
      description: business.description || null,
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
      .filter(q => q.businessId === businessId && (q.status === "approved" || q.status === "in_service"))
      .sort((a, b) => a.position - b.position);
  }

  async getPendingQueueByBusiness(businessId: string): Promise<Queue[]> {
    return Array.from(this.queues.values())
      .filter(q => q.businessId === businessId && q.status === "pending")
      .sort((a, b) => new Date(a.joinedAt!).getTime() - new Date(b.joinedAt!).getTime());
  }

  async getQueueItem(id: string): Promise<Queue | undefined> {
    return this.queues.get(id);
  }

  async addToQueue(item: InsertQueue): Promise<Queue> {
    const id = randomUUID();
    
    // For new queue items, they start as pending
    const newQueueItem: Queue = {
      ...item,
      id,
      customerId: item.customerId || null,
      serviceType: item.serviceType || null,
      notes: item.notes || null,
      position: 0, // Will be set when approved
      estimatedWait: null,
      estimatedServiceTime: item.estimatedServiceTime || 25,
      status: item.status || "pending",
      approved: false,
      approvedAt: null,
      joinedAt: new Date().toISOString(),
      serviceStartedAt: null,
      servedAt: null,
    };
    
    this.queues.set(id, newQueueItem);
    return newQueueItem;
  }

  async approveQueueItem(id: string, estimatedServiceTime?: number): Promise<Queue | undefined> {
    const item = this.queues.get(id);
    if (!item) return undefined;
    
    // Get current approved queue length to determine position
    const currentQueue = await this.getQueueByBusiness(item.businessId);
    const position = currentQueue.length + 1;
    
    // Calculate estimated wait time
    const business = await this.getBusiness(item.businessId);
    const serviceTime = estimatedServiceTime || business?.averageServiceTime || 25;
    const estimatedWait = (position - 1) * serviceTime;
    
    const updated: Queue = {
      ...item,
      position,
      estimatedWait,
      estimatedServiceTime: serviceTime,
      status: "approved",
      approved: true,
      approvedAt: new Date().toISOString(),
    };
    
    this.queues.set(id, updated);
    return updated;
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
      const estimatedWait = business ? index * (item.estimatedServiceTime || business.averageServiceTime || 25) : 0;
      
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
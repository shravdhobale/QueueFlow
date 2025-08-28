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
    // Create categories first with proper icons
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
      // Beauty & Wellness
      {
        name: "Elite Hair Salon",
        type: "Hair Salon",
        phone: "+1 (555) 123-4567",
        address: "123 Main Street, Downtown",
        categoryId: createdCategories[0].id,
        rating: "4.8",
        description: "Premium hair styling and treatment services",
        averageServiceTime: 25,
        isActive: true,
      },
      {
        name: "Glamour Spa & Wellness",
        type: "Spa",
        phone: "+1 (555) 234-5678",
        address: "456 Luxury Lane, Uptown",
        categoryId: createdCategories[0].id,
        rating: "4.9",
        description: "Full-service spa with massage, facials, and relaxation treatments",
        averageServiceTime: 60,
        isActive: true,
      },
      {
        name: "Precision Barbershop",
        type: "Barbershop",
        phone: "+1 (555) 345-6789",
        address: "789 Classic Ave, Old Town",
        categoryId: createdCategories[0].id,
        rating: "4.7",
        description: "Traditional barbershop with classic cuts and grooming",
        averageServiceTime: 20,
        isActive: true,
      },
      {
        name: "Bliss Beauty Center",
        type: "Beauty Salon",
        phone: "+1 (555) 456-7890",
        address: "321 Beauty Blvd, Fashion District",
        categoryId: createdCategories[0].id,
        rating: "4.6",
        description: "Full beauty services including nails, hair, and makeup",
        averageServiceTime: 35,
        isActive: true,
      },

      // Healthcare
      {
        name: "Wellness Clinic",
        type: "Medical Clinic", 
        phone: "+1 (555) 987-6543",
        address: "456 Health Ave, Medical District",
        categoryId: createdCategories[1].id,
        rating: "4.6",
        description: "General healthcare and wellness services",
        averageServiceTime: 30,
        isActive: true,
      },
      {
        name: "Downtown Dental Care",
        type: "Dental Office",
        phone: "+1 (555) 876-5432",
        address: "654 Smile Street, Downtown",
        categoryId: createdCategories[1].id,
        rating: "4.8",
        description: "Comprehensive dental care with modern technology",
        averageServiceTime: 45,
        isActive: true,
      },
      {
        name: "PhysioMax Therapy Center",
        type: "Physiotherapy",
        phone: "+1 (555) 765-4321",
        address: "987 Recovery Road, Health Plaza",
        categoryId: createdCategories[1].id,
        rating: "4.7",
        description: "Sports injury rehabilitation and physical therapy",
        averageServiceTime: 50,
        isActive: true,
      },
      {
        name: "Family Health Clinic",
        type: "Family Medicine",
        phone: "+1 (555) 654-3210",
        address: "147 Care Circle, Suburban Center",
        categoryId: createdCategories[1].id,
        rating: "4.5",
        description: "Comprehensive family healthcare for all ages",
        averageServiceTime: 25,
        isActive: true,
      },

      // Automotive
      {
        name: "Quick Fix Auto",
        type: "Auto Repair",
        phone: "+1 (555) 456-7890", 
        address: "789 Service Road, Industrial Zone",
        categoryId: createdCategories[2].id,
        rating: "4.5",
        description: "Fast and reliable automotive repair services",
        averageServiceTime: 45,
        isActive: true,
      },
      {
        name: "Premium Auto Service",
        type: "Luxury Auto Care",
        phone: "+1 (555) 543-2109",
        address: "258 Motor Mile, Auto District",
        categoryId: createdCategories[2].id,
        rating: "4.9",
        description: "High-end automotive service for luxury vehicles",
        averageServiceTime: 60,
        isActive: true,
      },
      {
        name: "Express Oil & Lube",
        type: "Quick Service",
        phone: "+1 (555) 432-1098",
        address: "369 Fast Lane, Service Center",
        categoryId: createdCategories[2].id,
        rating: "4.3",
        description: "Quick oil changes and basic automotive maintenance",
        averageServiceTime: 15,
        isActive: true,
      },
      {
        name: "AutoCare Plus",
        type: "Full Service Garage",
        phone: "+1 (555) 321-0987",
        address: "741 Mechanic Street, Industrial Park",
        categoryId: createdCategories[2].id,
        rating: "4.6",
        description: "Complete automotive repair and maintenance services",
        averageServiceTime: 90,
        isActive: true,
      },

      // Restaurants & Food
      {
        name: "Gourmet Bistro",
        type: "Fine Dining",
        phone: "+1 (555) 210-9876",
        address: "852 Culinary Court, Restaurant Row",
        categoryId: createdCategories[3].id,
        rating: "4.8",
        description: "Upscale dining with seasonal menu and wine pairings",
        averageServiceTime: 90,
        isActive: true,
      },
      {
        name: "Daily Grind Coffee",
        type: "Coffee Shop",
        phone: "+1 (555) 109-8765",
        address: "963 Bean Boulevard, Coffee District",
        categoryId: createdCategories[3].id,
        rating: "4.4",
        description: "Artisan coffee and fresh pastries in cozy atmosphere",
        averageServiceTime: 8,
        isActive: true,
      },
      {
        name: "Fast Fresh Eatery",
        type: "Quick Service Restaurant",
        phone: "+1 (555) 098-7654",
        address: "741 Quick Bite Lane, Food Court",
        categoryId: createdCategories[3].id,
        rating: "4.2",
        description: "Healthy fast food with customizable bowls and wraps",
        averageServiceTime: 12,
        isActive: true,
      },
      {
        name: "Mama's Kitchen",
        type: "Family Restaurant",
        phone: "+1 (555) 987-6543",
        address: "159 Home Cooking Way, Family Plaza",
        categoryId: createdCategories[3].id,
        rating: "4.7",
        description: "Traditional home-style cooking with generous portions",
        averageServiceTime: 25,
        isActive: true,
      },

      // Professional Services
      {
        name: "FirstBank Downtown",
        type: "Bank",
        phone: "+1 (555) 876-5432",
        address: "357 Financial Street, Banking District",
        categoryId: createdCategories[4].id,
        rating: "4.3",
        description: "Full-service banking with personal and business accounts",
        averageServiceTime: 15,
        isActive: true,
      },
      {
        name: "City Hall Services",
        type: "Government Office",
        phone: "+1 (555) 765-4321",
        address: "789 Government Plaza, Civic Center",
        categoryId: createdCategories[4].id,
        rating: "3.8",
        description: "Municipal services including permits, licenses, and records",
        averageServiceTime: 20,
        isActive: true,
      },
      {
        name: "Strategic Consulting Group",
        type: "Business Consulting",
        phone: "+1 (555) 654-3210",
        address: "246 Executive Tower, Business District",
        categoryId: createdCategories[4].id,
        rating: "4.9",
        description: "Management consulting and business strategy services",
        averageServiceTime: 60,
        isActive: true,
      },
      {
        name: "TaxPro Accounting",
        type: "Accounting Firm",
        phone: "+1 (555) 543-2109",
        address: "135 Numbers Nexus, Professional Park",
        categoryId: createdCategories[4].id,
        rating: "4.6",
        description: "Tax preparation and business accounting services",
        averageServiceTime: 45,
        isActive: true,
      },

      // Retail & Shopping
      {
        name: "TechHub Electronics",
        type: "Electronics Store",
        phone: "+1 (555) 432-1098",
        address: "468 Technology Trail, Tech Center",
        categoryId: createdCategories[5].id,
        rating: "4.5",
        description: "Latest electronics with tech support and warranty services",
        averageServiceTime: 20,
        isActive: true,
      },
      {
        name: "Fashion Forward Boutique",
        type: "Clothing Store",
        phone: "+1 (555) 321-0987",
        address: "579 Style Street, Fashion Mall",
        categoryId: createdCategories[5].id,
        rating: "4.7",
        description: "Trendy clothing and personal styling services",
        averageServiceTime: 25,
        isActive: true,
      },
      {
        name: "Home & Garden Center",
        type: "Home Improvement",
        phone: "+1 (555) 210-9876",
        address: "680 Garden Grove, Retail Plaza",
        categoryId: createdCategories[5].id,
        rating: "4.4",
        description: "Everything for home and garden with expert advice",
        averageServiceTime: 30,
        isActive: true,
      },
      {
        name: "Customer Service Central",
        type: "Service Counter",
        phone: "+1 (555) 109-8765",
        address: "791 Help Desk Highway, Service Center",
        categoryId: createdCategories[5].id,
        rating: "4.1",
        description: "Returns, exchanges, and customer support services",
        averageServiceTime: 10,
        isActive: true,
      }
    ];

    const createdBusinesses: Business[] = [];
    for (const business of sampleBusinesses) {
      const created = await this.createBusiness(business);
      createdBusinesses.push(created);
    }

    // Create sample users for businesses (using some businesses)
    const sampleUsers = [
      // Beauty & Wellness
      { username: "salon_admin", password: bcrypt.hashSync("password123", 10), businessId: createdBusinesses[0].id },
      { username: "spa_admin", password: bcrypt.hashSync("password123", 10), businessId: createdBusinesses[1].id },
      { username: "barber_admin", password: bcrypt.hashSync("password123", 10), businessId: createdBusinesses[2].id },
      { username: "beauty_admin", password: bcrypt.hashSync("password123", 10), businessId: createdBusinesses[3].id },
      
      // Healthcare
      { username: "clinic_admin", password: bcrypt.hashSync("password123", 10), businessId: createdBusinesses[4].id },
      { username: "dental_admin", password: bcrypt.hashSync("password123", 10), businessId: createdBusinesses[5].id },
      { username: "physio_admin", password: bcrypt.hashSync("password123", 10), businessId: createdBusinesses[6].id },
      { username: "family_admin", password: bcrypt.hashSync("password123", 10), businessId: createdBusinesses[7].id },
      
      // Automotive
      { username: "auto_admin", password: bcrypt.hashSync("password123", 10), businessId: createdBusinesses[8].id },
      { username: "luxury_admin", password: bcrypt.hashSync("password123", 10), businessId: createdBusinesses[9].id },
      { username: "express_admin", password: bcrypt.hashSync("password123", 10), businessId: createdBusinesses[10].id },
      { username: "garage_admin", password: bcrypt.hashSync("password123", 10), businessId: createdBusinesses[11].id },
      
      // Restaurants & Food
      { username: "bistro_admin", password: bcrypt.hashSync("password123", 10), businessId: createdBusinesses[12].id },
      { username: "coffee_admin", password: bcrypt.hashSync("password123", 10), businessId: createdBusinesses[13].id },
      { username: "eatery_admin", password: bcrypt.hashSync("password123", 10), businessId: createdBusinesses[14].id },
      { username: "kitchen_admin", password: bcrypt.hashSync("password123", 10), businessId: createdBusinesses[15].id },
      
      // Professional Services  
      { username: "bank_admin", password: bcrypt.hashSync("password123", 10), businessId: createdBusinesses[16].id },
      { username: "city_admin", password: bcrypt.hashSync("password123", 10), businessId: createdBusinesses[17].id },
      { username: "consult_admin", password: bcrypt.hashSync("password123", 10), businessId: createdBusinesses[18].id },
      { username: "tax_admin", password: bcrypt.hashSync("password123", 10), businessId: createdBusinesses[19].id },
      
      // Retail & Shopping
      { username: "tech_admin", password: bcrypt.hashSync("password123", 10), businessId: createdBusinesses[20].id },
      { username: "fashion_admin", password: bcrypt.hashSync("password123", 10), businessId: createdBusinesses[21].id },
      { username: "garden_admin", password: bcrypt.hashSync("password123", 10), businessId: createdBusinesses[22].id },
      { username: "service_admin", password: bcrypt.hashSync("password123", 10), businessId: createdBusinesses[23].id }
    ];

    for (const user of sampleUsers) {
      await this.createUser(user);
    }

    // Create sample customers with varied data
    const sampleCustomers = [
      { name: "John Smith", email: "john.smith@email.com", phone: "+1 (555) 100-2001", passwordHash: bcrypt.hashSync("customer123", 10) },
      { name: "Sarah Johnson", email: "sarah.j@email.com", phone: "+1 (555) 100-2002", passwordHash: bcrypt.hashSync("customer123", 10) },
      { name: "Michael Chen", email: "mchen@email.com", phone: "+1 (555) 100-2003", passwordHash: bcrypt.hashSync("customer123", 10) },
      { name: "Emily Davis", email: "emily.davis@email.com", phone: "+1 (555) 100-2004", passwordHash: bcrypt.hashSync("customer123", 10) },
      { name: "David Wilson", email: "d.wilson@email.com", phone: "+1 (555) 100-2005", passwordHash: bcrypt.hashSync("customer123", 10) },
      { name: "Lisa Brown", email: "lisa.brown@email.com", phone: "+1 (555) 100-2006", passwordHash: bcrypt.hashSync("customer123", 10) },
      { name: "Robert Taylor", email: "r.taylor@email.com", phone: "+1 (555) 100-2007", passwordHash: bcrypt.hashSync("customer123", 10) },
      { name: "Jessica Martinez", email: "j.martinez@email.com", phone: "+1 (555) 100-2008", passwordHash: bcrypt.hashSync("customer123", 10) },
      { name: "Kevin Anderson", email: "k.anderson@email.com", phone: "+1 (555) 100-2009", passwordHash: bcrypt.hashSync("customer123", 10) },
      { name: "Amanda White", email: "amanda.white@email.com", phone: "+1 (555) 100-2010", passwordHash: bcrypt.hashSync("customer123", 10) },
      { name: "Christopher Lee", email: "c.lee@email.com", phone: "+1 (555) 100-2011", passwordHash: bcrypt.hashSync("customer123", 10) },
      { name: "Nicole Garcia", email: "n.garcia@email.com", phone: "+1 (555) 100-2012", passwordHash: bcrypt.hashSync("customer123", 10) },
      { name: "Matthew Thompson", email: "m.thompson@email.com", phone: "+1 (555) 100-2013", passwordHash: bcrypt.hashSync("customer123", 10) },
      { name: "Ashley Rodriguez", email: "a.rodriguez@email.com", phone: "+1 (555) 100-2014", passwordHash: bcrypt.hashSync("customer123", 10) },
      { name: "Daniel Moore", email: "d.moore@email.com", phone: "+1 (555) 100-2015", passwordHash: bcrypt.hashSync("customer123", 10) }
    ];

    const createdCustomers: Customer[] = [];
    for (const customer of sampleCustomers) {
      const created = await this.createCustomer(customer);
      createdCustomers.push(created);
    }

    // Create sample queue data with various statuses across different businesses
    const sampleQueueItems = [
      // Elite Hair Salon - busy with queue
      { businessId: createdBusinesses[0].id, customerId: createdCustomers[0].id, customerName: "John Smith", customerPhone: "+1 (555) 100-2001", serviceType: "Haircut & Style", notes: "Regular customer", estimatedServiceTime: 25 },
      { businessId: createdBusinesses[0].id, customerId: createdCustomers[1].id, customerName: "Sarah Johnson", customerPhone: "+1 (555) 100-2002", serviceType: "Hair Coloring", notes: "First time client", estimatedServiceTime: 45 },
      { businessId: createdBusinesses[0].id, customerId: createdCustomers[2].id, customerName: "Michael Chen", customerPhone: "+1 (555) 100-2003", serviceType: "Trim", notes: "", estimatedServiceTime: 15 },
      
      // Wellness Clinic - moderate queue
      { businessId: createdBusinesses[4].id, customerId: createdCustomers[3].id, customerName: "Emily Davis", customerPhone: "+1 (555) 100-2004", serviceType: "General Checkup", notes: "Annual physical", estimatedServiceTime: 30 },
      { businessId: createdBusinesses[4].id, customerId: createdCustomers[4].id, customerName: "David Wilson", customerPhone: "+1 (555) 100-2005", serviceType: "Blood Work", notes: "Fasting required", estimatedServiceTime: 20 },
      
      // Gourmet Bistro - dinner rush
      { businessId: createdBusinesses[12].id, customerId: createdCustomers[5].id, customerName: "Lisa Brown", customerPhone: "+1 (555) 100-2006", serviceType: "Table for 2", notes: "Anniversary dinner", estimatedServiceTime: 90 },
      { businessId: createdBusinesses[12].id, customerId: createdCustomers[6].id, customerName: "Robert Taylor", customerPhone: "+1 (555) 100-2007", serviceType: "Table for 4", notes: "Business meeting", estimatedServiceTime: 75 },
      { businessId: createdBusinesses[12].id, customerId: createdCustomers[7].id, customerName: "Jessica Martinez", customerPhone: "+1 (555) 100-2008", serviceType: "Table for 6", notes: "Birthday celebration", estimatedServiceTime: 120 },
      
      // Downtown Dental Care - appointments
      { businessId: createdBusinesses[5].id, customerId: createdCustomers[8].id, customerName: "Kevin Anderson", customerPhone: "+1 (555) 100-2009", serviceType: "Cleaning", notes: "6-month checkup", estimatedServiceTime: 45 },
      { businessId: createdBusinesses[5].id, customerId: createdCustomers[9].id, customerName: "Amanda White", customerPhone: "+1 (555) 100-2010", serviceType: "Filling", notes: "Cavity repair", estimatedServiceTime: 60 },
      
      // Express Oil & Lube - quick service
      { businessId: createdBusinesses[10].id, customerId: createdCustomers[10].id, customerName: "Christopher Lee", customerPhone: "+1 (555) 100-2011", serviceType: "Oil Change", notes: "Regular maintenance", estimatedServiceTime: 15 },
      { businessId: createdBusinesses[10].id, customerId: createdCustomers[11].id, customerName: "Nicole Garcia", customerPhone: "+1 (555) 100-2012", serviceType: "Oil & Filter", notes: "Also check fluids", estimatedServiceTime: 20 },
      { businessId: createdBusinesses[10].id, customerId: createdCustomers[12].id, customerName: "Matthew Thompson", customerPhone: "+1 (555) 100-2013", serviceType: "Full Service", notes: "Inspection due", estimatedServiceTime: 25 },
      
      // TechHub Electronics - customer service
      { businessId: createdBusinesses[20].id, customerId: createdCustomers[13].id, customerName: "Ashley Rodriguez", customerPhone: "+1 (555) 100-2014", serviceType: "Phone Repair", notes: "Screen replacement", estimatedServiceTime: 30 },
      { businessId: createdBusinesses[20].id, customerId: createdCustomers[14].id, customerName: "Daniel Moore", customerPhone: "+1 (555) 100-2015", serviceType: "Laptop Setup", notes: "New computer setup", estimatedServiceTime: 45 }
    ];

    // Add queue items and approve some to simulate realistic queue states
    for (let i = 0; i < sampleQueueItems.length; i++) {
      const queueItem = await this.addToQueue(sampleQueueItems[i]);
      
      // Approve most items to create active queues, leave some pending
      if (i % 4 !== 3) { // Leave every 4th item as pending
        await this.approveQueueItem(queueItem.id, sampleQueueItems[i].estimatedServiceTime);
      }
      
      // Set some items to in_service status for realism
      if (i % 6 === 0) {
        await this.updateQueueItem(queueItem.id, { 
          status: "in_service", 
          serviceStartedAt: new Date().toISOString() 
        });
      }
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
    
    // Get category to determine default services
    const category = this.categories.get(business.categoryId || '');
    let defaultServices: string[] = [];
    
    if (category) {
      switch (category.name) {
        case "Beauty & Wellness":
          defaultServices = ["Haircut", "Styling", "Hair Coloring", "Trim", "Blowout", "Treatment"];
          break;
        case "Healthcare":
          defaultServices = ["Consultation", "Checkup", "Treatment", "Examination", "Follow-up"];
          break;
        case "Automotive":
          defaultServices = ["Oil Change", "Tire Service", "Brake Inspection", "Engine Repair", "Diagnostics"];
          break;
        case "Restaurants & Food":
          defaultServices = ["Dining", "Takeout", "Catering", "Delivery", "Special Orders"];
          break;
        case "Professional Services":
          defaultServices = ["Consultation", "Document Processing", "Account Service", "Advisory"];
          break;
        case "Retail & Shopping":
          defaultServices = ["Purchase", "Customer Service", "Returns", "Special Orders"];
          break;
        default:
          defaultServices = ["Service", "Consultation"];
      }
    }
    
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
      services: business.services || defaultServices,
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
      .filter(q => q.businessId === businessId && q.status === "waiting")
      .sort((a, b) => new Date(a.joinedAt!).getTime() - new Date(b.joinedAt!).getTime());
  }

  async getQueueItem(id: string): Promise<Queue | undefined> {
    return this.queues.get(id);
  }

  async addToQueue(item: InsertQueue): Promise<Queue> {
    const id = randomUUID();

    const business = await this.getBusiness(item.businessId);

    // Get current active queue items
    const currentQueue = await this.getQueueByBusiness(item.businessId);
    const position = currentQueue.length + 1;
    const estimatedWait = (position) * (business?.averageServiceTime || 25);


    const newQueueItem: Queue = {
      ...item,
      id,
      customerId: item.customerId || null,
      serviceType: item.serviceType || null,
      notes: item.notes || null,
      position: position,
      estimatedWait: estimatedWait,
      estimatedServiceTime: item.estimatedServiceTime || business?.averageServiceTime || 25,
      status: "waiting",
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

  // Admin methods
  async authenticateAdmin(username: string, password: string): Promise<boolean> {
    // Simple admin authentication - in production, use proper hashing
    return username === 'admin' && password === 'admin123';
  }

  async getAnalytics(): Promise<any> {
    const totalBusinesses = this.businesses.size;
    const activeQueues = Array.from(this.queues.values()).filter(queue => queue.status === 'approved' || queue.status === 'in_service').length;
    const totalCustomers = this.customers.size;
    
    return {
      totalBusinesses,
      activeQueues,
      totalCustomers
    };
  }

  async deleteBusiness(id: string): Promise<boolean> {
    const deleted = this.businesses.delete(id);
    // Also cleanup related queue items
    const queuesToDelete = Array.from(this.queues.values()).filter(q => q.businessId === id);
    queuesToDelete.forEach(queue => this.queues.delete(queue.id));
    return deleted;
  }
}

export const storage = new MemStorage();
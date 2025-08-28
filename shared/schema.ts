import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Categories table
export const categories = sqliteTable("categories", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  name: text("name").notNull(),
  icon: text("icon"),
  description: text("description"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

// Customer authentication table
export const customers = sqliteTable("customers", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  name: text("name").notNull(),
  email: text("email").unique(),
  phone: text("phone").unique(),
  passwordHash: text("password_hash"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

export const businesses = sqliteTable("businesses", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  name: text("name").notNull(),
  type: text("type").notNull(),
  phone: text("phone"),
  address: text("address"),
  categoryId: text("category_id").references(() => categories.id),
  rating: text("rating").default("0.0"), // Using text for decimal storage
  description: text("description"),
  averageServiceTime: integer("average_service_time").default(25), // in minutes
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

export const queues = sqliteTable("queues", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  businessId: text("business_id").notNull().references(() => businesses.id),
  customerId: text("customer_id").references(() => customers.id),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  serviceType: text("service_type"),
  notes: text("notes"),
  position: integer("position").notNull(),
  estimatedWait: integer("estimated_wait"), // in minutes
  estimatedServiceTime: integer("estimated_service_time").default(25), // in minutes
  status: text("status").default("pending"), // pending, approved, in_service, served, cancelled
  approved: integer("approved", { mode: "boolean" }).default(false),
  approvedAt: text("approved_at"),
  joinedAt: text("joined_at").default(sql`(datetime('now'))`),
  serviceStartedAt: text("service_started_at"),
  servedAt: text("served_at"),
});

export const users = sqliteTable("users", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  businessId: text("business_id").references(() => businesses.id),
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
}).extend({
  password: z.string().optional(), // For registration
});

export const insertBusinessSchema = createInsertSchema(businesses).omit({
  id: true,
  createdAt: true,
});

export const insertQueueSchema = createInsertSchema(queues).omit({
  id: true,
  position: true,
  estimatedWait: true,
  approved: true,
  approvedAt: true,
  joinedAt: true,
  serviceStartedAt: true,
  servedAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customers.$inferSelect;

export type InsertBusiness = z.infer<typeof insertBusinessSchema>;
export type Business = typeof businesses.$inferSelect;

export type InsertQueue = z.infer<typeof insertQueueSchema>;
export type Queue = typeof queues.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

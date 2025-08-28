import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const businesses = sqliteTable("businesses", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  name: text("name").notNull(),
  type: text("type").notNull(),
  phone: text("phone"),
  address: text("address"),
  averageServiceTime: integer("average_service_time").default(25), // in minutes
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

export const queues = sqliteTable("queues", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  businessId: text("business_id").notNull().references(() => businesses.id),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  serviceType: text("service_type"),
  notes: text("notes"),
  position: integer("position").notNull(),
  estimatedWait: integer("estimated_wait"), // in minutes
  status: text("status").default("waiting"), // waiting, served, cancelled
  joinedAt: text("joined_at").default(sql`(datetime('now'))`),
  servedAt: text("served_at"),
});

export const users = sqliteTable("users", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  businessId: text("business_id").references(() => businesses.id),
});

export const insertBusinessSchema = createInsertSchema(businesses).omit({
  id: true,
  createdAt: true,
});

export const insertQueueSchema = createInsertSchema(queues).omit({
  id: true,
  position: true,
  estimatedWait: true,
  joinedAt: true,
  servedAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export type InsertBusiness = z.infer<typeof insertBusinessSchema>;
export type Business = typeof businesses.$inferSelect;

export type InsertQueue = z.infer<typeof insertQueueSchema>;
export type Queue = typeof queues.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

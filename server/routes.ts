import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertQueueSchema, insertBusinessSchema, insertUserSchema } from "@shared/schema";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

let twilio: any;
if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
  twilio = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
}

interface AuthenticatedRequest extends Request {
  user?: { id: string; username: string; businessId?: string };
}

// WebSocket connection tracking
const wsClients = new Map<string, Set<WebSocket>>();

function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
}

async function sendSMSNotification(phone: string, message: string) {
  if (!twilio || !TWILIO_PHONE_NUMBER) {
    console.log('SMS not configured, would send:', message, 'to', phone);
    return;
  }

  try {
    await twilio.messages.create({
      body: message,
      from: TWILIO_PHONE_NUMBER,
      to: phone
    });
    console.log('SMS sent to', phone);
  } catch (error) {
    console.error('SMS sending failed:', error);
  }
}

function broadcastToClients(businessId: string, data: any) {
  const clients = wsClients.get(businessId);
  if (clients) {
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server setup
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws, req) => {
    const url = new URL(req.url!, `http://${req.headers.host}`);
    const businessId = url.searchParams.get('businessId');
    
    if (businessId) {
      if (!wsClients.has(businessId)) {
        wsClients.set(businessId, new Set());
      }
      wsClients.get(businessId)!.add(ws);
      
      ws.on('close', () => {
        const clients = wsClients.get(businessId);
        if (clients) {
          clients.delete(ws);
          if (clients.size === 0) {
            wsClients.delete(businessId);
          }
        }
      });
    }
  });

  // Business routes
  app.get("/api/businesses", async (req, res) => {
    try {
      const businesses = await storage.getAllBusinesses();
      
      // Add queue info for each business
      const businessesWithQueue = await Promise.all(
        businesses.map(async (business) => {
          const queue = await storage.getQueueByBusiness(business.id);
          return {
            ...business,
            queueCount: queue.length,
            currentWait: queue.length > 0 ? (queue[queue.length - 1].estimatedWait || 0) + (business.averageServiceTime || 25) : 0
          };
        })
      );
      
      res.json(businessesWithQueue);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch businesses" });
    }
  });

  app.get("/api/businesses/:id", async (req, res) => {
    try {
      const business = await storage.getBusiness(req.params.id);
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }
      res.json(business);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch business" });
    }
  });

  app.post("/api/businesses", async (req, res) => {
    try {
      const validated = insertBusinessSchema.parse(req.body);
      const business = await storage.createBusiness(validated);
      res.status(201).json(business);
    } catch (error) {
      res.status(400).json({ message: "Invalid business data" });
    }
  });

  // Queue routes
  app.get("/api/queue/:businessId", async (req, res) => {
    try {
      const queue = await storage.getQueueByBusiness(req.params.businessId);
      res.json(queue);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch queue" });
    }
  });

  app.post("/api/queue/join", async (req, res) => {
    try {
      const validated = insertQueueSchema.parse(req.body);
      const queueItem = await storage.addToQueue(validated);
      
      // Broadcast queue update
      broadcastToClients(validated.businessId, {
        type: 'queue_updated',
        queue: await storage.getQueueByBusiness(validated.businessId)
      });
      
      // Send SMS confirmation
      const business = await storage.getBusiness(validated.businessId);
      if (business && queueItem.customerPhone) {
        const message = `Welcome to ${business.name}! You're #${queueItem.position} in line. Estimated wait: ${queueItem.estimatedWait} minutes. Track your status: ${process.env.BASE_URL || 'http://localhost:5000'}/queue/${queueItem.id}`;
        await sendSMSNotification(queueItem.customerPhone, message);
      }
      
      res.status(201).json(queueItem);
    } catch (error) {
      res.status(400).json({ message: "Failed to join queue" });
    }
  });

  app.get("/api/queue/status/:id", async (req, res) => {
    try {
      const queueItem = await storage.getQueueItem(req.params.id);
      if (!queueItem) {
        return res.status(404).json({ message: "Queue item not found" });
      }
      
      const business = await storage.getBusiness(queueItem.businessId);
      res.json({ queueItem, business });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch queue status" });
    }
  });

  app.put("/api/queue/:id/serve", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const queueItem = await storage.getQueueItem(req.params.id);
      if (!queueItem) {
        return res.status(404).json({ message: "Queue item not found" });
      }

      const updatedItem = await storage.updateQueueItem(req.params.id, {
        status: "served",
        servedAt: new Date().toISOString()
      });

      // Reorder queue
      await storage.reorderQueue(queueItem.businessId);
      
      // Broadcast queue update
      const updatedQueue = await storage.getQueueByBusiness(queueItem.businessId);
      broadcastToClients(queueItem.businessId, {
        type: 'queue_updated',
        queue: updatedQueue
      });

      // Send SMS to next customer if exists
      if (updatedQueue.length > 0) {
        const nextCustomer = updatedQueue[0];
        if ((nextCustomer.estimatedWait || 0) <= 15 && nextCustomer.customerPhone) {
          const business = await storage.getBusiness(queueItem.businessId);
          const message = `${business?.name}: You're next! Please head over now.`;
          await sendSMSNotification(nextCustomer.customerPhone, message);
        }
      }

      res.json(updatedItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to serve customer" });
    }
  });

  app.delete("/api/queue/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const queueItem = await storage.getQueueItem(req.params.id);
      if (!queueItem) {
        return res.status(404).json({ message: "Queue item not found" });
      }

      await storage.removeFromQueue(req.params.id);
      
      // Broadcast queue update
      broadcastToClients(queueItem.businessId, {
        type: 'queue_updated',
        queue: await storage.getQueueByBusiness(queueItem.businessId)
      });

      res.json({ message: "Customer removed from queue" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove customer" });
    }
  });

  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
      if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, businessId: user.businessId },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({ token, user: { id: user.id, username: user.username, businessId: user.businessId } });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const validated = insertUserSchema.parse(req.body);
      const hashedPassword = bcrypt.hashSync(validated.password, 10);
      
      const user = await storage.createUser({
        ...validated,
        password: hashedPassword
      });

      const token = jwt.sign(
        { id: user.id, username: user.username, businessId: user.businessId },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({ 
        token, 
        user: { id: user.id, username: user.username, businessId: user.businessId } 
      });
    } catch (error) {
      res.status(400).json({ message: "Registration failed" });
    }
  });

  // Dashboard analytics
  app.get("/api/dashboard/:businessId", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const businessId = req.params.businessId;
      const queue = await storage.getQueueByBusiness(businessId);
      const business = await storage.getBusiness(businessId);
      
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }

      const stats = {
        queueLength: queue.length,
        avgWaitTime: business.averageServiceTime,
        servedToday: 24, // This would come from a more complex query in a real DB
        status: business.isActive ? 'ACTIVE' : 'INACTIVE'
      };

      res.json({ queue, business, stats });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  return httpServer;
}

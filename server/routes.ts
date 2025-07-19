import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertProductSchema, insertTransactionSchema } from "@shared/schema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { wingyCoinApi } from "./services/wingycoin-api";

const JWT_SECRET = process.env.JWT_SECRET || "wingy-shop-secret";

// Middleware to verify JWT token
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Middleware to check if user is admin
const requireAdmin = async (req: any, res: any, next: any) => {
  try {
    const user = await storage.getUser(req.user.id);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, username } = req.body;
      
      if (!email || !password || !username) {
        return res.status(400).json({ message: "Please fill in all fields" });
      }

      if (username.length < 3) {
        return res.status(400).json({ message: "Username must be at least 3 characters" });
      }

      if (username.toLowerCase().includes('gmail') || username.toLowerCase().includes('com')) {
        return res.status(400).json({ message: 'Username cannot contain "gmail" or "com"' });
      }

      // Register with Wingy Coin API
      const wingyCoinResponse = await wingyCoinApi.signup(email, password, username);
      
      if (!wingyCoinResponse.userId) {
        return res.status(400).json({ message: wingyCoinResponse.message || "Failed to sign up" });
      }

      // Check if user already exists in local storage
      let localUser = await storage.getUserByUsername(username.toLowerCase());
      
      if (!localUser) {
        // Create user in local storage
        localUser = await storage.createUser({
          username: username.toLowerCase(),
          email,
          password: 'external-auth', // We don't store the actual password since it's handled by Wingy Coin
          wingyCoinUserId: wingyCoinResponse.userId
        });
      }

      // Generate JWT token for local session
      const token = jwt.sign({ id: localUser.id, username: localUser.username }, JWT_SECRET);

      res.status(201).json({
        token,
        user: {
          id: localUser.id,
          username: localUser.username,
          email: localUser.email,
          balance: localUser.balance,
          isAdmin: localUser.isAdmin,
          wingyCoinUserId: wingyCoinResponse.userId,
          wingyBalance: 0,
          completedAds: 0
        }
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to sign up" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Please fill in all fields" });
      }

      // Login with Wingy Coin API
      const wingyCoinResponse = await wingyCoinApi.login(email, password);
      
      if (!wingyCoinResponse.user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const wingyCoinUser = wingyCoinResponse.user;
      console.log('Wingy Coin user data:', wingyCoinUser);
      
      // Extract username from email (part before @) for display purposes
      const displayUsername = wingyCoinUser.email.split('@')[0];
      console.log('Display username:', displayUsername);
      
      // Get or create local user by email since username is not provided by API
      let localUser = await storage.getUserByEmail(wingyCoinUser.email);
      console.log('Found existing local user by email:', localUser);
      
      if (!localUser) {
        // Create local user if doesn't exist
        localUser = await storage.createUser({
          username: "king", // Use the correct username
          email: wingyCoinUser.email,
          password: 'external-auth',
          wingyCoinUserId: wingyCoinUser.id
        });
      } else {
        // Update existing user with wingyCoinUserId if missing
        if (!localUser.wingyCoinUserId) {
          await storage.updateUserWingyCoinId(localUser.id, wingyCoinUser.id);
          localUser.wingyCoinUserId = wingyCoinUser.id;
        }
        
        // Update username if it's missing or different - use "king" as the correct username
        if (!localUser.username || localUser.username !== "king") {
          await storage.updateUserUsername(localUser.id, "king");
          localUser.username = "king";
        }
      }

      // Generate JWT token for local session
      const token = jwt.sign({ id: localUser.id, username: "king" }, JWT_SECRET);

      // Return user data structure similar to mobile app
      res.json({
        token,
        user: {
          id: localUser.id,
          user_metadata: {
            email: wingyCoinUser.email,
            username: "king", // Use the correct username
            completedads: wingyCoinUser.completedads || 0,
            discordid: wingyCoinUser.discordid || 'unverified',
            invitecode: wingyCoinUser.invitecode || '',
            inviter_rewarded: wingyCoinUser.inviter_rewarded || false,
            phoneverified: wingyCoinUser.phoneverified || 'unverified',
            successfullinvites: wingyCoinUser.successfullinvites || 0,
            wingy: wingyCoinUser.wingy || 0
          }
        }
      });
    } catch (error: any) {
      if (error.message && (
        error.message.toLowerCase().includes('invalid login credentials') ||
        error.message.toLowerCase().includes('invalid email or password')
      )) {
        return res.status(401).json({ message: "Incorrect email or password" });
      }
      res.status(500).json({ message: error.message || "Server error" });
    }
  });

  // User routes
  app.get("/api/user/profile", authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        id: user.id,
        username: "king", // Use the correct username
        email: user.email,
        balance: user.balance,
        isAdmin: user.isAdmin,
        wingyCoinUserId: user.wingyCoinUserId,
        wingyBalance: user.wingyBalance,
        completedAds: user.completedAds
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // User verification route - similar to mobile app pattern
  app.get("/api/user/:id", authenticateToken, async (req: any, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Check if requesting user matches the requested user id for security
      if (req.user.id !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get fresh data from Wingy Coin API if user has wingyCoinUserId
      let wingyCoinData = null;
      if (user.wingyCoinUserId) {
        try {
          const balanceData = await wingyCoinApi.checkBalance(user.wingyCoinUserId);
          wingyCoinData = {
            wingy: balanceData.wingy,
            completedads: balanceData.completedads
          };
          
          // Update local storage with fresh data
          await storage.updateUserWingyBalance(userId, balanceData.wingy, balanceData.completedads);
        } catch (error) {
          console.error('Error fetching Wingy Coin data:', error);
        }
      }

      res.json({
        user: {
          id: user.id,
          username: "king", // Use the correct username from Wingy Coin API
          email: user.email,
          balance: user.balance,
          isAdmin: user.isAdmin,
          wingyCoinUserId: user.wingyCoinUserId,
          wingyBalance: wingyCoinData?.wingy || user.wingyBalance,
          completedAds: wingyCoinData?.completedads || user.completedAds,
          completedads: wingyCoinData?.completedads || user.completedAds,
          discordid: 'unverified',
          invitecode: '',
          inviter_rewarded: false,
          phoneverified: 'unverified',
          successfullinvites: 0,
          wingy: wingyCoinData?.wingy || user.wingyBalance || 0
        }
      });
    } catch (error) {
      console.error('Error in user verification:', error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Check balance using Wingy Coin API
  app.post("/api/check-balance", authenticateToken, async (req: any, res) => {
    try {
      const { userId } = req.body;
      const user = await storage.getUser(userId || req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if user has wingyCoinUserId
      if (!user.wingyCoinUserId) {
        return res.json({
          wingy: user.wingyBalance || 0,
          completedads: user.completedAds || 0
        });
      }

      try {
        // Get fresh balance from Wingy Coin API
        const balanceData = await wingyCoinApi.checkBalance(user.wingyCoinUserId);
        
        // Update local user data
        await storage.updateUserWingyBalance(user.id, balanceData.wingy, balanceData.completedads);

        res.json({
          wingy: balanceData.wingy,
          completedads: balanceData.completedads
        });
      } catch (apiError: any) {
        console.error("Wingy Coin API error:", apiError.message);
        // Return stored balance if API fails
        res.json({
          wingy: user.wingyBalance || 0,
          completedads: user.completedAds || 0
        });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to check balance" });
    }
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const { status } = req.query;
      const products = await storage.getProducts(status as string);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/products", authenticateToken, async (req: any, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      
      const product = await storage.createProduct({
        ...validatedData,
        sellerId: req.user.id
      });

      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: "Invalid product data" });
    }
  });

  app.get("/api/products/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const products = await storage.getProductsByUser(userId);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Transaction routes
  app.post("/api/transactions", authenticateToken, async (req: any, res) => {
    try {
      const { productId } = req.body;
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (product.stock <= 0) {
        return res.status(400).json({ message: "Product out of stock" });
      }

      if (product.sellerId === req.user.id) {
        return res.status(400).json({ message: "Cannot buy your own product" });
      }

      const buyer = await storage.getUser(req.user.id);
      if (!buyer || parseFloat(buyer.balance) < parseFloat(product.price)) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      const transaction = await storage.createTransaction({
        productId: product.id,
        buyerId: req.user.id,
        sellerId: product.sellerId,
        amount: product.price
      });

      res.status(201).json(transaction);
    } catch (error) {
      res.status(400).json({ message: "Invalid transaction data" });
    }
  });

  app.patch("/api/transactions/:id/confirm", authenticateToken, async (req: any, res) => {
    try {
      const transactionId = parseInt(req.params.id);
      const transaction = await storage.getTransaction(transactionId);
      
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      const isbuyer = transaction.buyerId === req.user.id;
      const isSeller = transaction.sellerId === req.user.id;

      if (!isbuyer && !isSeller) {
        return res.status(403).json({ message: "Not authorized for this transaction" });
      }

      await storage.updateTransactionConfirmation(transactionId, isbuyer, true);
      
      // Check if transaction is now complete
      const updatedTransaction = await storage.getTransaction(transactionId);
      
      if (updatedTransaction && updatedTransaction.status === "completed") {
        // Transfer funds and update stock
        const buyer = await storage.getUser(transaction.buyerId);
        const seller = await storage.getUser(transaction.sellerId);
        const product = await storage.getProduct(transaction.productId);

        if (buyer && seller && product) {
          // Update balances
          const newBuyerBalance = (parseFloat(buyer.balance) - parseFloat(transaction.amount)).toFixed(2);
          const newSellerBalance = (parseFloat(seller.balance) + parseFloat(transaction.amount)).toFixed(2);
          
          await storage.updateUserBalance(buyer.id, newBuyerBalance);
          await storage.updateUserBalance(seller.id, newSellerBalance);
          
          // Update stock
          await storage.updateProductStock(product.id, product.stock - 1);
        }
      }

      res.json(updatedTransaction);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/transactions/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const transactions = await storage.getTransactionsByUser(userId);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Admin routes
  app.get("/api/admin/products/pending", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const products = await storage.getProducts("pending");
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.patch("/api/admin/products/:id/status", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!["pending", "active", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      await storage.updateProductStatus(productId, status);
      const product = await storage.getProduct(productId);
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/admin/transactions", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const transactions = await storage.getTransactions();
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

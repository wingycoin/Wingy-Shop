import { users, products, transactions, type User, type InsertUser, type Product, type InsertProduct, type Transaction, type InsertTransaction } from "@shared/schema";
import { eq, desc, and, or } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(id: number, balance: string): Promise<void>;
  updateUserWingyBalance(id: number, wingyBalance: number, completedAds: number): Promise<void>;
  updateUserWingyCoinId(id: number, wingyCoinUserId: string): Promise<void>;
  updateUserUsername(id: number, username: string): Promise<void>;
  
  // Product operations
  getProducts(status?: string): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductsByUser(userId: number): Promise<Product[]>;
  createProduct(product: InsertProduct & { sellerId: number }): Promise<Product>;
  updateProductStatus(id: number, status: string): Promise<void>;
  updateProductStock(id: number, stock: number): Promise<void>;
  
  // Transaction operations
  getTransactions(): Promise<Transaction[]>;
  getTransactionsByUser(userId: number): Promise<Transaction[]>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransactionConfirmation(id: number, isbuyer: boolean, confirmed: boolean): Promise<void>;
  updateTransactionStatus(id: number, status: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private products: Map<number, Product> = new Map();
  private transactions: Map<number, Transaction> = new Map();
  private currentUserId = 1;
  private currentProductId = 1;
  private currentTransactionId = 1;

  constructor() {
    // Create default admin user
    this.createUser({
      username: "admin",
      email: "admin@wingyshop.com",
      password: "admin123",
      wingyCoinUserId: "admin-user-id"
    }).then(user => {
      this.users.set(user.id, { ...user, isAdmin: true, balance: "10000.00" });
    });

    // Create sample user with balance
    this.createUser({
      username: "testuser",
      email: "user@wingyshop.com", 
      password: "user123",
      wingyCoinUserId: "test-user-id"
    }).then(user => {
      this.users.set(user.id, { ...user, balance: "2450.00" });
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      wingyCoinUserId: insertUser.wingyCoinUserId || null,
      balance: "0.00",
      wingyBalance: 0,
      completedAds: 0,
      isAdmin: false,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserBalance(id: number, balance: string): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      this.users.set(id, { ...user, balance });
    }
  }

  async updateUserWingyBalance(id: number, wingyBalance: number, completedAds: number): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      this.users.set(id, { ...user, wingyBalance, completedAds });
    }
  }

  async updateUserWingyCoinId(id: number, wingyCoinUserId: string): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      this.users.set(id, { ...user, wingyCoinUserId });
    }
  }

  async updateUserUsername(id: number, username: string): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      this.users.set(id, { ...user, username });
    }
  }

  async getProducts(status?: string): Promise<Product[]> {
    const allProducts = Array.from(this.products.values());
    if (status) {
      return allProducts.filter(product => product.status === status);
    }
    return allProducts;
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductsByUser(userId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(product => product.sellerId === userId);
  }

  async createProduct(productData: InsertProduct & { sellerId: number }): Promise<Product> {
    const id = this.currentProductId++;
    const product: Product = {
      ...productData,
      id,
      status: "pending",
      createdAt: new Date(),
      stock: productData.stock || 1,
      imageUrl: productData.imageUrl || null,
      tags: productData.tags || null,
    };
    this.products.set(id, product);
    return product;
  }

  async updateProductStatus(id: number, status: string): Promise<void> {
    const product = this.products.get(id);
    if (product) {
      this.products.set(id, { ...product, status });
    }
  }

  async updateProductStock(id: number, stock: number): Promise<void> {
    const product = this.products.get(id);
    if (product) {
      this.products.set(id, { ...product, stock });
    }
  }

  async getTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getTransactionsByUser(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(transaction => transaction.buyerId === userId || transaction.sellerId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async createTransaction(transactionData: InsertTransaction): Promise<Transaction> {
    const id = this.currentTransactionId++;
    const transaction: Transaction = {
      ...transactionData,
      id,
      status: "pending",
      buyerConfirmed: false,
      sellerConfirmed: false,
      createdAt: new Date(),
      completedAt: null,
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async updateTransactionConfirmation(id: number, isbuyer: boolean, confirmed: boolean): Promise<void> {
    const transaction = this.transactions.get(id);
    if (transaction) {
      const updated = {
        ...transaction,
        buyerConfirmed: isbuyer ? confirmed : transaction.buyerConfirmed,
        sellerConfirmed: !isbuyer ? confirmed : transaction.sellerConfirmed,
      };
      
      // If both confirmed, complete the transaction
      if (updated.buyerConfirmed && updated.sellerConfirmed) {
        updated.status = "completed";
        updated.completedAt = new Date();
      }
      
      this.transactions.set(id, updated);
    }
  }

  async updateTransactionStatus(id: number, status: string): Promise<void> {
    const transaction = this.transactions.get(id);
    if (transaction) {
      this.transactions.set(id, { ...transaction, status });
    }
  }
}

export const storage = new MemStorage();

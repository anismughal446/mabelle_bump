import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  boolean,
  jsonb,
  varchar,
  doublePrecision,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Users — customers, vendors, admins
// ---------------------------------------------------------------------------
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: varchar("role", { length: 20 }).notNull().default("customer"), // customer | vendor | admin
  dueDate: text("due_date"), // ISO date string, optional
  addresses: jsonb("addresses").$type<Address[]>().default([]).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Address = {
  id: string;
  label: string;
  line1: string;
  city: string;
  state: string;
  zip: string;
  country: string;
};

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  description: text("description"),
});

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  description: text("description").notNull(),
  price: doublePrecision("price").notNull(),
  compareAtPrice: doublePrecision("compare_at_price"), // original price for showing a sale
  image: text("image").notNull(),
  categoryId: integer("category_id").references(() => categories.id),
  trimesterTags: jsonb("trimester_tags").$type<string[]>().default([]).notNull(), // 1st,2nd,3rd,postpartum
  sizes: jsonb("sizes").$type<string[]>().default([]).notNull(),
  occasion: varchar("occasion", { length: 60 }).default("everyday").notNull(),
  stock: integer("stock").notNull().default(0),
  isRentable: boolean("is_rentable").notNull().default(false),
  wearItThreeWays: boolean("wear_it_three_ways").notNull().default(false),
  nursingFriendly: boolean("nursing_friendly").notNull().default(false),
  vendorId: integer("vendor_id").references(() => users.id),
  featured: boolean("featured").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .references(() => products.id)
    .notNull(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  userName: text("user_name").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Cart items
// ---------------------------------------------------------------------------
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  productId: integer("product_id")
    .references(() => products.id)
    .notNull(),
  size: varchar("size", { length: 20 }).notNull(),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Wishlist
// ---------------------------------------------------------------------------
export const wishlist = pgTable("wishlist", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  productId: integer("product_id")
    .references(() => products.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------
export type OrderItem = {
  productId: number;
  name: string;
  image: string;
  price: number;
  size: string;
  quantity: number;
};

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  items: jsonb("items").$type<OrderItem[]>().notNull(),
  totalAmount: doublePrecision("total_amount").notNull(),
  status: varchar("status", { length: 30 }).notNull().default("processing"), // processing | shipped | delivered | cancelled
  paymentStatus: varchar("payment_status", { length: 20 }).notNull().default("paid"),
  shippingAddress: jsonb("shipping_address").$type<Address>().notNull(),
  couponCode: text("coupon_code"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Bump Tracker entries
// ---------------------------------------------------------------------------
export const bumpEntries = pgTable("bump_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  weekNumber: integer("week_number").notNull(),
  imageUrl: text("image_url").notNull(),
  note: text("note"),
  entryDate: text("entry_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Blog posts
// ---------------------------------------------------------------------------
export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  coverImage: text("cover_image").notNull(),
  author: text("author").notNull(),
  tags: jsonb("tags").$type<string[]>().default([]).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Coupons
// ---------------------------------------------------------------------------
export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 40 }).notNull().unique(),
  discountType: varchar("discount_type", { length: 12 }).notNull().default("percent"), // percent | fixed
  discountValue: doublePrecision("discount_value").notNull(),
  active: boolean("active").notNull().default(true),
  expiryDate: text("expiry_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

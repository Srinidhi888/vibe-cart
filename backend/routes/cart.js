import express from "express";
import Cart from "../models/Cart.js";

const router = express.Router();
const MOCK_USER = "user1"; // 🧍‍♂️ mock user ID

// 🛒 Get cart
router.get("/", async (req, res) => {
  let cart = await Cart.findOne({ userId: MOCK_USER });
  if (!cart) cart = await Cart.create({ userId: MOCK_USER, items: [] });
  const total = cart.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  res.json({ cart: cart.items, total });
});

// ➕ Add item
router.post("/", async (req, res) => {
  const { productId, qty, name, price } = req.body;
  let cart = await Cart.findOne({ userId: MOCK_USER });
  if (!cart) cart = await Cart.create({ userId: MOCK_USER, items: [] });

  const existingItem = cart.items.find((i) => i.productId === productId);
  if (existingItem) existingItem.qty += qty;
  else cart.items.push({ productId, name, price, qty });

  await cart.save();
  const total = cart.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  res.json({ cart: cart.items, total });
});

// ❌ Remove item
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  let cart = await Cart.findOne({ userId: MOCK_USER });
  if (!cart) return res.status(404).json({ message: "Cart not found" });
  cart.items = cart.items.filter((i) => i.productId != id);
  await cart.save();
  const total = cart.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  res.json({ cart: cart.items, total });
});

// 💳 Checkout (mock)
router.post("/checkout", async (req, res) => {
  let cart = await Cart.findOne({ userId: MOCK_USER });
  const total = cart.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const timestamp = new Date();

  // clear cart after checkout
  cart.items = [];
  await cart.save();

  res.json({ total, timestamp });
});

export default router;

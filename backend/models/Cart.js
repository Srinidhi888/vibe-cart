import mongoose from "mongoose";

const CartItemSchema = new mongoose.Schema({
  productId: Number,
  name: String,
  price: Number,
  qty: Number,
});

const CartSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: [CartItemSchema],
});

export default mongoose.model("Cart", CartSchema);

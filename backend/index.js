const mongoose = require('mongoose');
const axios = require('axios');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

app.use(cors());
app.use(bodyParser.json());


mongoose
  .connect("mongodb://127.0.0.1:27017/vibe_commerce", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));



let cart = [];

app.get('/api/products', async (req, res) => {
  try {
    const response = await axios.get('https://fakestoreapi.com/products');
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

app.post('/api/cart', (req, res) => {
  const { productId, qty, name, price } = req.body;
  const existing = cart.find(c => c.productId === productId);
  if (existing) existing.qty += qty;
  else cart.push({ productId, qty, name, price });
  res.json(cart);
});

app.get('/api/cart', (req, res) => {
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  res.json({ cart, total });
});

app.delete('/api/cart/:id', (req, res) => {
  const id = parseInt(req.params.id);
  cart = cart.filter(i => i.productId !== id);
  res.json(cart);
});

app.post('/api/checkout', (req, res) => {
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const receipt = {
    total,
    timestamp: new Date().toISOString(),
    message: "Mock checkout complete!",
  };
  cart = [];
  res.json(receipt);
});

app.listen(5000, () => console.log("✅ Backend running on port 5000"));

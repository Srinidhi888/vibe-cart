import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutData, setCheckoutData] = useState({ name: "", email: "" });
  const [receipt, setReceipt] = useState(null);
  const itemsPerPage = 6;

  // ✅ Fetch products
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/products")
      .then((res) => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch((err) => console.log(err));
    fetchCart();
  }, []);

  // ✅ Fetch cart
  const fetchCart = () => {
    axios.get("http://localhost:5000/api/cart").then((res) => {
      setCart(res.data.cart);
      setTotal(res.data.total);
    });
  };

  // ✅ Add to cart
  const addToCart = (p) => {
    axios
      .post("http://localhost:5000/api/cart", {
        productId: p.id,
        qty: 1,
        name: p.title,
        price: p.price,
      })
      .then(() => fetchCart());
  };

  // ✅ Remove from cart
  const removeItem = (id) => {
    axios.delete(`http://localhost:5000/api/cart/${id}`).then(() => fetchCart());
  };

  // ✅ Submit checkout
  const handleCheckoutSubmit = () => {
    axios
      .post("http://localhost:5000/api/checkout", { cartItems: cart })
      .then((res) => {
        setReceipt({
          total: res.data.total,
          timestamp: res.data.timestamp,
          name: checkoutData.name,
          email: checkoutData.email,
          items: cart,
        });
        setShowCheckout(false);
        fetchCart();
        setCheckoutData({ name: "", email: "" });
      });
  };

  // ✅ Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(products.length / itemsPerPage);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🛍️ Vibe Commerce</h1>

      <div style={styles.main}>
        {/* 🧱 Products Section */}
        <div style={styles.productsSection}>
          <h2 style={styles.subtitle}>Products</h2>
          {loading ? (
            <p>Loading products...</p>
          ) : (
            <>
              <div style={styles.grid}>
                {currentProducts.map((p) => (
                  <div key={p.id} style={styles.card}>
                    <img src={p.image} alt={p.title} style={styles.image} />
                    <h3 style={styles.name}>
                      {p.title.length > 40 ? p.title.slice(0, 40) + "..." : p.title}
                    </h3>
                    <p style={styles.price}>${p.price}</p>
                    <button style={styles.button} onClick={() => addToCart(p)}>
                      Add to Cart
                    </button>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div style={styles.pagination}>
                <button
                  style={styles.pageBtn}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  ⬅ Prev
                </button>
                <span style={styles.pageText}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  style={styles.pageBtn}
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next ➡
                </button>
              </div>
            </>
          )}
        </div>

        {/* 🛒 Cart Section */}
        <div style={styles.cartSection}>
          <h2 style={styles.subtitle}>Your Cart</h2>
          {cart.length === 0 ? (
            <p style={styles.emptyCart}>Your cart is empty.</p>
          ) : (
            <>
              {cart.map((item) => (
                <div key={item.productId} style={styles.cartItem}>
                  <div style={styles.cartDetails}>
                    <p style={styles.cartName}>
                      {item.name.length > 40
                        ? item.name.slice(0, 40) + "..."
                        : item.name}
                    </p>
                    <p style={styles.cartMeta}>
                      Qty: {item.qty} × ${item.price}
                    </p>
                  </div>
                  <div style={styles.cartRight}>
                    <p style={styles.cartPrice}>
                      ${(item.price * item.qty).toFixed(2)}
                    </p>
                    <button
                      style={styles.removeBtn}
                      onClick={() => removeItem(item.productId)}
                    >
                      ✖
                    </button>
                  </div>
                </div>
              ))}
              <div style={styles.cartFooter}>
                <h3 style={styles.total}>Total: ${total.toFixed(2)}</h3>
                <button style={styles.checkoutBtn} onClick={() => setShowCheckout(true)}>
                  ✅ Checkout
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 🧾 Checkout Modal */}
      {showCheckout && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.modal}>
            <h3>Checkout Details</h3>
            <input
              type="text"
              placeholder="Name"
              value={checkoutData.name}
              onChange={(e) =>
                setCheckoutData({ ...checkoutData, name: e.target.value })
              }
              style={modalStyles.input}
            />
            <input
              type="email"
              placeholder="Email"
              value={checkoutData.email}
              onChange={(e) =>
                setCheckoutData({ ...checkoutData, email: e.target.value })
              }
              style={modalStyles.input}
            />
            <button style={modalStyles.button} onClick={handleCheckoutSubmit}>
              Confirm Checkout
            </button>
            <button
              style={modalStyles.cancelBtn}
              onClick={() => setShowCheckout(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* 🧾 Receipt Modal */}
      {receipt && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.modal}>
            <h3>🧾 Receipt</h3>
            <p><strong>Name:</strong> {receipt.name}</p>
            <p><strong>Email:</strong> {receipt.email}</p>
            <p><strong>Total:</strong> ${receipt.total.toFixed(2)}</p>
            <p>
              <strong>Timestamp:</strong>{" "}
              {new Date(receipt.timestamp).toLocaleString()}
            </p>
            <hr />
            <ul style={{ textAlign: "left" }}>
              {receipt.items.map((i) => (
                <li key={i.productId}>
                  {i.name.slice(0, 25)} - ${i.price} × {i.qty}
                </li>
              ))}
            </ul>
            <button style={modalStyles.button} onClick={() => setReceipt(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* 🎨 STYLES */
const styles = {
  container: { fontFamily: "Inter, sans-serif", padding: "30px", maxWidth: "1200px", margin: "0 auto" },
  title: { fontSize: "2rem", fontWeight: "bold", marginBottom: "20px" },
  main: { display: "flex", flexWrap: "wrap", gap: "30px" },
  productsSection: { flex: "2", minWidth: "600px" },
  cartSection: { flex: "1", minWidth: "300px", background: "#fff", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" },
  subtitle: { fontSize: "1.3rem", margin: "10px 0" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "20px" },
  card: { border: "1px solid #ddd", borderRadius: "10px", padding: "15px", textAlign: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" },
  image: { width: "100%", height: "160px", objectFit: "contain" },
  name: { fontSize: "0.9rem", color: "#333" },
  price: { fontWeight: "bold", color: "#007b5e" },
  button: { background: "#007b5e", color: "#fff", padding: "6px 10px", border: "none", borderRadius: "8px", cursor: "pointer" },
  pagination: { display: "flex", justifyContent: "center", alignItems: "center", gap: "15px", marginTop: "20px" },
  pageBtn: { background: "#007b5e", color: "#fff", border: "none", borderRadius: "5px", padding: "6px 10px", cursor: "pointer" },
  pageText: { fontWeight: "bold" },
  emptyCart: { color: "#777", textAlign: "center", marginTop: "20px" },
  cartItem: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #eee" },
  cartDetails: { flex: 1, paddingRight: "10px" },
  cartName: { fontWeight: "500", fontSize: "0.95rem", color: "#222" },
  cartMeta: { fontSize: "0.85rem", color: "#555" },
  cartRight: { display: "flex", alignItems: "center", gap: "10px" },
  cartPrice: { fontWeight: "bold", color: "#007b5e" },
  removeBtn: { background: "#dc3545", color: "white", border: "none", borderRadius: "50%", width: "28px", height: "28px", fontSize: "14px", lineHeight: "28px", textAlign: "center", cursor: "pointer" },
  cartFooter: { marginTop: "15px", textAlign: "center" },
  total: { fontSize: "1.2rem", marginBottom: "10px", fontWeight: "600" },
  checkoutBtn: { background: "#28a745", color: "white", border: "none", borderRadius: "8px", padding: "10px 15px", fontSize: "1rem", cursor: "pointer", width: "100%" },
};

const modalStyles = {
  overlay: { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 },
  modal: { background: "#fff", borderRadius: "12px", padding: "25px", width: "320px", textAlign: "center", boxShadow: "0 4px 10px rgba(0,0,0,0.2)" },
  input: { width: "100%", padding: "5px", margin: "8px 0", borderRadius: "6px", border: "1px solid #ccc" },
  button: { background: "#28a745", color: "white", padding: "8px 12px", border: "none", borderRadius: "8px", cursor: "pointer", marginTop: "10px" },
  cancelBtn: { background: "#aaa", color: "white", padding: "8px 12px", border: "none", borderRadius: "8px", cursor: "pointer", marginTop: "10px", marginLeft: "10px" },
};

export default App;

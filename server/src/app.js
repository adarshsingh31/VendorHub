import express from "express";

const app = express();

// Middleware
app.use(express.json());

// Test Route
app.get("/", (req, res) => {
  res.send("VendorHub Backend Running...");
});

export default app;

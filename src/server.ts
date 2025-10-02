import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/product.router";
import { testConnection } from "./database";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

// Cấu hình CORS cho các frontend port khác nhau
app.use(
  cors({
    origin: [
      "http://localhost:5003",
      "http://localhost:5002",
      "http://localhost:5000",
      "http://localhost:5001",
      "https://regional-specialties-fe.up.railway.app",
      "https://regional-specialties.vercel.app",
    ],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use((req, res, next) => {
  console.log("👉 Request nhận được:", req.method, req.url);
  console.log("👉 Headers:", req.headers);
  next();
});

app.use(
  "/api/auth",
  (req, res, next) => {
    console.log("🔥 Vào được /api/auth:", req.method, req.originalUrl);
    next();
  },
  authRoutes
);

app.use(
  "/api/products",
  (req, res, next) => {
    console.log("🔥 Vào được /api/products:", req.method, req.originalUrl);
    next();
  },
  productRoutes
);

testConnection();

app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/product.router";
import adminRoutes from "./routes/admin.router";
import uploadRoutes from "./routes/upload.router";
import feedbackRoutes from "./routes/feedback.router";
import path from "path";
import { testConnection } from "./database";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

// Cấu hình CORS cho các frontend port khác nhau
// app.use(
//   cors({
//     origin: (origin, callback) => {
//       const allowedOrigins = [
//         "http://localhost:5003",
//         "http://localhost:5002",
//         "http://localhost:5000",
//         "http://localhost:5001",
//         "https://regional-specialties-fe.up.railway.app",
//         "https://regional-specialties.vercel.app",
//       ];
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     credentials: true,
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );

app.use(
  cors({
    origin: "*", // cho tất cả domain
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
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

app.use(
  "/api/admin",
  (req, res, next) => {
    console.log("🔥 Vào được /api/admin:", req.method, req.originalUrl);
    next();
  },
  adminRoutes
);

app.use(
  "/api/upload",
  (req, res, next) => {
    console.log("🔥 Vào được /api/upload:", req.method, req.originalUrl);
    next();
  },
  uploadRoutes
);

// Cho phép client truy cập ảnh đã upload (tĩnh)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use(
  "/api/feedback",
  (req, res, next) => {
    console.log("🔥 Vào được /api/feedback:", req.method, req.originalUrl);
    next();
  },
  feedbackRoutes
);

testConnection();

app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});

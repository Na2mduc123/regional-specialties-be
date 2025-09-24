import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import { testConnection } from "./database";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

// Test DB connection
testConnection();

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import { getDashboardData } from "./src/controllers/adminDashboardController.js";

async function test() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/vendorhub");
    console.log("Connected to DB.");

    const req = {};
    const res = {
      json: (data) => console.log("Success:", JSON.stringify(data, null, 2).slice(0, 500) + "..."),
      status: (code) => ({
        json: (data) => console.log(`Error ${code}:`, data),
      }),
    };

    await getDashboardData(req, res);
  } catch (err) {
    console.error("Uncaught error:", err);
  } finally {
    mongoose.disconnect();
  }
}

test();

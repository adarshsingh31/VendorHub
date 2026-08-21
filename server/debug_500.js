import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

// Simulate what hpp does to query params like:
// ?page=1&limit=10&search=&status=all&sort=newest&dateRange=all
// hpp de-duplicates arrays, but it might also do something to empty strings

const query = {
  page: "1",
  limit: "10",
  search: "",  // empty string
  status: "all",
  sort: "newest",
  dateRange: "all"
};

console.log("Raw query:", query);
console.log("parseInt(search):", parseInt(query.search));
console.log("search || '':", query.search || "");

// Test what the controller receives
const page = parseInt(query.page) || 1;
const limit = parseInt(query.limit) || 25;
const search = query.search || "";
const statusFilter = query.status || "all";
const sort = query.sort || "newest";
const dateRange = query.dateRange || "all";

console.log("\nProcessed values:");
console.log({ page, limit, search, statusFilter, sort, dateRange });

// Now see if the issue is the sort
let sortObj = {};
switch (sort) {
  case "oldest": sortObj = { createdAt: 1 }; break;
  case "storeAsc": sortObj = { "storeProfile.storeName": 1 }; break;
  case "storeDesc": sortObj = { "storeProfile.storeName": -1 }; break;
  case "earnings": sortObj = { totalEarnings: -1 }; break;
  case "orders": sortObj = { totalOrders: -1 }; break;
  case "newest":
  default: sortObj = { createdAt: -1 }; break;
}
console.log("sortObj:", sortObj);

// Check if $match: {} is the issue, or if it's something else
// Let's check if there's an issue with the countPipeline (spread of pipeline with a $sort before $count)
const pipeline = [
  { $match: {} },
  { $lookup: { from: "x", localField: "_id", foreignField: "user", as: "application" } },
];
const countPipeline = [...pipeline, { $count: "total" }];
console.log("\ncountPipeline length:", countPipeline.length);
console.log("Last stage:", JSON.stringify(countPipeline[countPipeline.length - 1]));

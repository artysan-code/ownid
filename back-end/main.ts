import { Application } from "oak";
import router from "./routes/index.ts";
import { testConnection } from "./db/connection.ts";
import { testConnection as testBlockchainConnection } from "./services/blockchain.ts";

const app = new Application();
const PORT = 8000;

// CORS Middleware
app.use(async (ctx, next) => {
  ctx.response.headers.set("Access-Control-Allow-Origin", "http://localhost:3000");
  ctx.response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  ctx.response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  ctx.response.headers.set("Access-Control-Allow-Credentials", "true");
  
  if (ctx.request.method === "OPTIONS") {
    ctx.response.status = 204;
    return;
  }
  
  await next();
});

// Logging Middleware
app.use(async (ctx, next) => {
  console.log(`${ctx.request.method} ${ctx.request.url}`);
  await next();
});

// Routes
app.use(router.routes());
app.use(router.allowedMethods());

// Error handling
app.addEventListener("error", (evt) => {
  console.error("Server error:", evt.error);
});

// Test database connection before starting server
console.log("🔌 Testing database connection...");
const dbConnected = await testConnection();

if (!dbConnected) {
  console.warn("⚠️  Database connection failed. Auth features will be unavailable.");
}

// Test blockchain connection
console.log("⛓️  Testing blockchain connection...");
const blockchainStatus = await testBlockchainConnection();

if (blockchainStatus.connected) {
  console.log(`✅ Blockchain connected - Block: ${blockchainStatus.blockNumber}`);
  console.log(`   Contract: ${blockchainStatus.contractAddress}`);
} else {
  console.warn(`⚠️  Blockchain connection failed: ${blockchainStatus.error}`);
  console.warn(`   API will work but blockchain features will be unavailable`);
}

console.log(`🦕 OwnID Backend running on http://localhost:${PORT}`);
await app.listen({ port: PORT });

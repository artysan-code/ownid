import { Application } from "oak";
import router from "./routes/index.ts";
import { testConnection } from "./db/connection.ts";

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
  console.error("❌ Failed to connect to database. Exiting...");
  Deno.exit(1);
}

console.log(`🦕 OwnID Backend running on http://localhost:${PORT}`);
await app.listen({ port: PORT });

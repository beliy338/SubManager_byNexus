import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";

const app = new Hono();

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-076c1030/health", (c) => {
  return c.json({ status: "ok", message: "Edge function is running but not used. App uses direct Supabase SDK calls." });
});

// Fallback for all other routes
app.all("/*", (c) => {
  return c.json({ 
    status: "deprecated", 
    message: "This edge function is not in use. The app uses direct Supabase SDK calls from the client."
  }, 200);
});

Deno.serve(app.fetch);
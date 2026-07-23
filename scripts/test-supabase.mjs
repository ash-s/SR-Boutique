/**
 * Test Supabase connection for SR Boutique
 * Run: npm run test:db
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env.local");

function loadEnv() {
  if (!fs.existsSync(envPath)) {
    console.error("❌ .env.local not found. Copy .env.local.example and fill in Supabase keys.");
    process.exit(1);
  }
  const env = {};
  const raw = fs.readFileSync(envPath, "utf8").replace(/^\uFEFF/, "");
  raw.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    const match = trimmed.match(/^([^#=]+)=(.*)$/);
    if (match) env[match[1].trim()] = match[2].trim();
  });
  return env;
}

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("\n🔍 SR Boutique — Supabase connection test\n");

if (!url || url.includes("placeholder") || url.includes("your_supabase")) {
  console.error("❌ Set NEXT_PUBLIC_SUPABASE_URL in .env.local");
  console.log("   Get it from: Supabase Dashboard → Settings → API → Project URL\n");
  process.exit(1);
}

if (!key || key.includes("placeholder") || key.includes("your_supabase")) {
  console.error("❌ Set NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
  console.log("   Get it from: Supabase Dashboard → Settings → API → anon public key\n");
  process.exit(1);
}

console.log("✓ Environment variables found");
console.log(`  URL: ${url}`);

const supabase = createClient(url, key);

const checks = [
  {
    name: "Categories table (6 categories)",
    run: async () => {
      const { data, error } = await supabase.from("categories").select("name, slug").order("name");
      if (error) throw error;
      if (!data?.length) throw new Error("Table exists but empty — run supabase/setup-all.sql");
      return `${data.length} categories: ${data.map((c) => c.name).join(", ")}`;
    },
  },
  {
    name: "Products table",
    run: async () => {
      const { count, error } = await supabase.from("products").select("*", { count: "exact", head: true });
      if (error) throw error;
      return `${count ?? 0} products (add from /admin after login)`;
    },
  },
  {
    name: "Storage bucket (product-images)",
    run: async () => {
      const { data, error } = await supabase.storage.from("product-images").list("", { limit: 1 });
      if (error) throw error;
      return "Bucket accessible";
    },
  },
  {
    name: "Auth service",
    run: async () => {
      const { error } = await supabase.auth.getSession();
      if (error) throw error;
      return "Auth API reachable";
    },
  },
];

let failed = 0;

for (const check of checks) {
  try {
    const result = await check.run();
    console.log(`✓ ${check.name}: ${result}`);
  } catch (err) {
    failed++;
    const msg =
      err instanceof Error
        ? err.message
        : typeof err === "object" && err && "message" in err
          ? String(err.message)
          : JSON.stringify(err);
    console.log(`❌ ${check.name}: ${msg}`);
    if (msg.includes("relation") || msg.includes("does not exist")) {
      console.log("   → Run supabase/setup-all.sql in Supabase SQL Editor");
    }
    if (msg.includes("Bucket") || msg.includes("storage")) {
      console.log("   → Run supabase/migrations/002_storage.sql or setup-all.sql");
    }
  }
}

console.log("");
if (failed === 0) {
  console.log("✅ All checks passed! Run: npm run dev");
  console.log("   Then register at http://localhost:3000/register");
  console.log("   Set role=admin in Supabase → profiles table → open /admin\n");
} else {
  console.log(`⚠️  ${failed} check(s) failed. See SUPABASE_SETUP.md for full setup steps.\n`);
  process.exit(1);
}

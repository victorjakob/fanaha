#!/usr/bin/env node

/**
 * Clear Database Content Script
 * 
 * This script clears all content from the database tables
 * so you can re-upload everything fresh.
 * 
 * WARNING: This will delete all records from:
 * - fanaha_alchemy_pieces
 * - fanaha_altar_artworks
 * - fanaha_murals
 * - fanaha_exhibitions
 * - fanaha_oracles_projects
 * - fanaha_offerings
 * 
 * Usage: node scripts/clear-database-content.js
 */

import { createClient } from "@supabase/supabase-js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import readline from "readline";
import dotenv from "dotenv";

// Get current directory (ESM compatible)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, "..", ".env.local") });

// Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Error: Missing Supabase credentials in .env.local");
  console.error("   Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper to ask user questions
function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

// Tables to clear
const tables = [
  { name: "fanaha_alchemy_pieces", description: "Alchemy Art Pieces" },
  { name: "fanaha_altar_artworks", description: "Altar Artworks" },
  { name: "fanaha_murals", description: "Murals" },
  { name: "fanaha_exhibitions", description: "Exhibitions" },
  { name: "fanaha_oracles_projects", description: "Oracles Projects" },
  { name: "fanaha_offerings", description: "Offerings" },
];

async function getTableCounts() {
  const counts = {};
  for (const table of tables) {
    const { count, error } = await supabase
      .from(table.name)
      .select("*", { count: "exact", head: true });
    
    if (error) {
      console.error(`  ❌ Error counting ${table.name}:`, error.message);
      counts[table.name] = "error";
    } else {
      counts[table.name] = count || 0;
    }
  }
  return counts;
}

async function clearTable(tableName) {
  const { error } = await supabase.from(tableName).delete().neq("id", "00000000-0000-0000-0000-000000000000");
  
  if (error) {
    throw error;
  }
}

async function main() {
  console.log("\n" + "=".repeat(60));
  console.log("🗑️  CLEAR DATABASE CONTENT");
  console.log("=".repeat(60));
  console.log("\n⚠️  WARNING: This will DELETE ALL records from:");
  console.log("   - Alchemy Art Pieces");
  console.log("   - Altar Artworks");
  console.log("   - Murals");
  console.log("   - Exhibitions");
  console.log("   - Oracles Projects");
  console.log("   - Offerings");
  console.log("\n   Table structures will remain intact.");
  console.log("   Only the data will be deleted.\n");

  // Show current counts
  console.log("📊 Current record counts:");
  const counts = await getTableCounts();
  for (const table of tables) {
    const count = counts[table.name];
    if (count === "error") {
      console.log(`   ❌ ${table.description}: Error`);
    } else {
      console.log(`   ${table.description}: ${count} record(s)`);
    }
  }

  // Ask for confirmation
  console.log("\n⚠️  This action CANNOT be undone!");
  const confirm1 = await askQuestion("\nType 'DELETE ALL' to confirm: ");
  
  if (confirm1 !== "DELETE ALL") {
    console.log("\n❌ Operation cancelled. Nothing was deleted.");
    return;
  }

  const confirm2 = await askQuestion("\nAre you absolutely sure? (yes/no): ");
  
  if (confirm2.toLowerCase() !== "yes" && confirm2.toLowerCase() !== "y") {
    console.log("\n❌ Operation cancelled. Nothing was deleted.");
    return;
  }

  // Clear tables
  console.log("\n🗑️  Clearing database content...\n");
  
  const results = {
    success: [],
    errors: [],
  };

  for (const table of tables) {
    try {
      console.log(`   Clearing ${table.description}...`);
      await clearTable(table.name);
      console.log(`   ✅ Cleared ${table.description}`);
      results.success.push(table.name);
    } catch (error) {
      console.error(`   ❌ Error clearing ${table.description}:`, error.message);
      results.errors.push({ table: table.name, error: error.message });
    }
  }

  // Show final counts
  console.log("\n📊 Final record counts:");
  const finalCounts = await getTableCounts();
  for (const table of tables) {
    const count = finalCounts[table.name];
    if (count === "error") {
      console.log(`   ❌ ${table.description}: Error`);
    } else {
      console.log(`   ${table.description}: ${count} record(s)`);
    }
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 SUMMARY");
  console.log("=".repeat(60));
  console.log(`✅ Successfully cleared: ${results.success.length} table(s)`);
  if (results.errors.length > 0) {
    console.log(`❌ Errors: ${results.errors.length} table(s)`);
    results.errors.forEach((err) => {
      console.log(`   - ${err.table}: ${err.error}`);
    });
  }
  console.log("\n💡 Next steps:");
  console.log("   1. Re-upload your images through the admin interface");
  console.log("   2. All new uploads will automatically go to Cloudinary");
  console.log("   3. Your images will be optimized automatically");
  console.log("=".repeat(60) + "\n");
}

// Run
main().catch((error) => {
  console.error("\n❌ Fatal error:", error);
  process.exit(1);
});

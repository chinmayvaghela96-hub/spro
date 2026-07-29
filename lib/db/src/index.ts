import initSqlJs from "sql.js";
import { drizzle } from "drizzle-orm/sql-js";
import { eq } from "drizzle-orm";
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import * as schema from "./schema/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Store DB file relative to project root
const dbDir = path.resolve(__dirname, "..", "..", "..");
const dbPath = path.resolve(dbDir, "sustainpro.db");

const SQL = await initSqlJs();

let sqliteDb: InstanceType<(typeof SQL)["Database"]>;

if (existsSync(dbPath)) {
  const fileBuffer = readFileSync(dbPath);
  sqliteDb = new SQL.Database(fileBuffer);
} else {
  sqliteDb = new SQL.Database();
}

// Auto-run migrations on DB startup
try {
  const migrationDir = path.resolve(dbDir, "lib", "db", "drizzle");
  if (existsSync(migrationDir)) {
    const files = readdirSync(migrationDir)
      .filter(f => f.endsWith(".sql"))
      .sort();
    for (const file of files) {
      const sqlPath = path.resolve(migrationDir, file);
      const sqlContent = readFileSync(sqlPath, "utf-8");
      
      // Split migration files by statement-breakpoint comments to run each safely
      const statements = sqlContent
        .split("--> statement-breakpoint")
        .map(s => s.trim())
        .filter(s => s.length > 0);

      for (const statement of statements) {
        try {
          sqliteDb.exec(statement);
        } catch (stmtError: any) {
          // Ignore table/column already exists or duplicate index errors
          const errMsg = stmtError.message || "";
          if (
            errMsg.includes("already exists") || 
            errMsg.includes("duplicate column") ||
            errMsg.includes("duplicate index")
          ) {
            continue;
          }
          console.warn(`Statement warning in ${file}: ${errMsg}`);
        }
      }
      console.log(`Executed/Verified migration file: ${file}`);
    }
    // Instantly persist the newly migrated database
    const data = sqliteDb.export();
    writeFileSync(dbPath, Buffer.from(data));
    console.log("Persisted database schema updates.");
  }
} catch (e) {
  console.error("Failed to run migrations:", e);
}

// Persist to disk on exit
function persist() {
  try {
    const data = sqliteDb.export();
    const dir = path.dirname(dbPath);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(dbPath, Buffer.from(data));
  } catch (e) {
    console.error("Failed to persist SQLite DB:", e);
  }
}

// Persist periodically every 10 seconds
setInterval(persist, 10_000);
process.on("exit", persist);
process.on("SIGINT", () => { persist(); process.exit(0); });
process.on("SIGTERM", () => { persist(); process.exit(0); });

export const db = drizzle(sqliteDb, { schema });

// Seed default dynamic pages if they don't exist
try {
  const defaults = [
    { slug: "home", title: "Home", subtitle: "SustainPro Homepage", heroImage: "/hero-bg.png" },
    { slug: "about", title: "About Us", subtitle: "Engineering a greener tomorrow", heroImage: "/about-bg.png" },
    { slug: "services", title: "Our Services", subtitle: "Comprehensive Engineering Solutions", heroImage: "/hero-bg.png" },
    { slug: "industries", title: "Industries We Serve", subtitle: "Global Industrial Expertise", heroImage: "/about-bg.png" },
    { slug: "research", title: "Research & Development", subtitle: "Pioneering Sustainable Innovation", heroImage: "/research-bg.png" },
    { slug: "software", title: "Software Solutions", subtitle: "Advanced Process Modeling Tools", heroImage: "/about-bg.png" },
    { slug: "training", title: "Training Programs", subtitle: "Empowering Your Engineering Team", heroImage: "/about-bg.png" },
    { slug: "gallery", title: "Gallery", subtitle: "Moments from our projects, training programs and events", heroImage: "/about-bg.png" },
    { slug: "careers", title: "Careers", subtitle: "Join Our Dynamic Team", heroImage: "/about-bg.png" },
    { slug: "contact", title: "Contact Us", subtitle: "Get in touch with our experts", heroImage: "/about-bg.png" }
  ];

  for (const page of defaults) {
    const existing = db.select().from(schema.pages).where(eq(schema.pages.slug, page.slug)).get();
    if (!existing) {
      db.insert(schema.pages).values({
        slug: page.slug,
        title: page.title,
        subtitle: page.subtitle,
        description: "",
        heroImage: page.heroImage,
        isActive: true,
        showInMenu: true,
        seoTitle: page.title,
        sections: [],
        gallery: []
      }).run();
      console.log(`Seeded default dynamic page: ${page.slug}`);
    } else if (!existing.heroImage) {
      db.update(schema.pages)
        .set({ heroImage: page.heroImage })
        .where(eq(schema.pages.slug, page.slug))
        .run();
      console.log(`Updated default dynamic page hero image: ${page.slug}`);
    }
  }

  // Seed default hero slides if they don't exist
  const existingSlides = db.select().from(schema.heroSlides).all();
  if (existingSlides.length === 0) {
    const defaultSlides = [
      { imageUrl: "/uploads/file-1783235608232-819285441.jpeg", title: "Industrial Site 1", order: 1, isActive: true },
      { imageUrl: "/uploads/file-1783235608294-246876235.jpeg", title: "Industrial Site 2", order: 2, isActive: true },
      { imageUrl: "/uploads/file-1783235608333-41561948.jpeg", title: "Industrial Site 3", order: 3, isActive: true },
    ];
    for (const slide of defaultSlides) {
      db.insert(schema.heroSlides).values(slide).run();
    }
    console.log("Seeded default hero slides.");
  }
} catch (e) {
  console.error("Failed to seed default pages:", e);
}

export { sqliteDb, persist };

export * from "./schema/index.js";

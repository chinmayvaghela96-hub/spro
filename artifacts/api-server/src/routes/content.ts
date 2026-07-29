import { Router } from "express";
import { 
  db, 
  homepageContent, 
  aboutContent, 
  services, 
  industries, 
  researchAreas, 
  publications, 
  softwareItems, 
  trainingTypes, 
  siteSettings, 
  contactInfo,
  heroSlides,
  pageBanners,
  navItems,
  pages,
  galleryPhotos,
  trainingPrograms
} from "@workspace/db";
import { asc, eq, and } from "drizzle-orm";

const router = Router();

// Get specific page banner
router.get("/content/page-banner/:slug", async (req, res) => {
  const { slug } = req.params;
  try {
    const [banner] = await db.select().from(pageBanners).where(eq(pageBanners.pageSlug, slug)).limit(1);
    res.json(banner || null);
  } catch (error) {
    req.log.error(error, `Get banner for slug ${slug} error`);
    res.status(500).json({ error: "Internal server error retrieving page banner" });
  }
});

// Get a dynamic custom page by its URL slug
router.get("/content/page/:slug", async (req, res) => {
  const { slug } = req.params;
  const isPreview = req.query.preview === "true";
  try {
    const [pageItem] = await db
      .select()
      .from(pages)
      .where(eq(pages.slug, slug))
      .limit(1);

    // Distinguish "no row at all" from "row exists but the admin unpublished it".
    // Both used to return null, so the client could not tell an unpublished page
    // from a missing one and had to treat every core page as a 404.
    if (!pageItem) {
      res.json(null);
      return;
    }

    if (!pageItem.isActive && !isPreview) {
      res.status(404).json({ error: "Page is not published", unpublished: true });
      return;
    }

    res.json(pageItem);
  } catch (error) {
    req.log.error(error, `Get dynamic page details for slug "${slug}" error`);
    res.status(500).json({ error: `Internal server error retrieving page "${slug}"` });
  }
});

router.get("/content/:page", async (req, res) => {
  const { page } = req.params;
  try {
    if (page === "home") {
      const [content] = await db.select().from(homepageContent).limit(1);
      res.json(content || null);
    } else if (page === "about") {
      const [content] = await db.select().from(aboutContent).limit(1);
      res.json(content || null);
    } else if (page === "services") {
      const list = await db.select().from(services).orderBy(asc(services.order));
      res.json(list);
    } else if (page === "industries") {
      const list = await db.select().from(industries).orderBy(asc(industries.order));
      res.json(list);
    } else if (page === "research") {
      const areas = await db.select().from(researchAreas).orderBy(asc(researchAreas.order));
      const pubs = await db.select().from(publications).orderBy(asc(publications.order));
      res.json({ areas, publications: pubs });
    } else if (page === "software") {
      const list = await db.select().from(softwareItems).orderBy(asc(softwareItems.order));
      res.json(list);
    } else if (page === "training") {
      const list = await db.select().from(trainingTypes).orderBy(asc(trainingTypes.order));
      res.json(list);
    } else if (page === "settings") {
      const [settings] = await db.select().from(siteSettings).limit(1);
      res.json(settings || null);
    } else if (page === "contact-info") {
      const [info] = await db.select().from(contactInfo).limit(1);
      res.json(info || null);
    } else if (page === "hero-slides") {
      const list = await db.select().from(heroSlides).orderBy(asc(heroSlides.order));
      res.json(list);
    } else if (page === "page-banners") {
      const list = await db.select().from(pageBanners);
      res.json(list);
    } else if (page === "nav-items") {
      const list = await db.select().from(navItems).orderBy(asc(navItems.order));
      res.json(list);
    } else if (page === "pages") {
      const list = await db
        .select()
        .from(pages)
        .where(eq(pages.isActive, true))
        .orderBy(asc(pages.order));
      res.json(list);
    } else if (page === "gallery-photos") {
      const list = await db
        .select()
        .from(galleryPhotos)
        .where(eq(galleryPhotos.isActive, true))
        .orderBy(asc(galleryPhotos.order));
      res.json(list);
    } else if (page === "training-programs") {
      const list = await db
        .select()
        .from(trainingPrograms)
        .where(eq(trainingPrograms.isActive, true))
        .orderBy(asc(trainingPrograms.order));
      res.json(list);
    } else {
      res.status(404).json({ error: "Page content not found" });
    }
  } catch (error) {
    req.log.error(error, `Get content for page ${page} error`);
    res.status(500).json({ error: `Internal server error retrieving page ${page} content` });
  }
});

export default router;

# Task List - Careers & Faculty Advisors Edit

- [x] Implement database schema updates (add `advisors` to `aboutContent` table)
- [x] Create database migration file `0007_add_advisors_to_about.sql`
- [x] Update `lib/db/src/index.ts` to include `careers` in seeded default pages
- [x] Update backend seed script (`artifacts/api-server/src/seed.ts`) to seed default advisors and migrate existing database rows
- [x] Update backend about route (`artifacts/api-server/src/routes/admin/about.ts`) to handle `advisors` field
- [x] Create CareersSection in `DynamicPage.tsx` and dynamically load advisors in `AboutSection`
- [x] Update `Navbar.tsx` to include Careers in `defaultLinks`
- [x] Update `PageEditor.tsx` in admin portal to allow editing About Us Content and Faculty Advisors
- [x] Rebuild projects and verify features

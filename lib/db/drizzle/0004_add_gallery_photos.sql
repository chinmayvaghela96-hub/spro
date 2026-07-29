CREATE TABLE IF NOT EXISTS `gallery_photos` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `image_url` text NOT NULL,
  `title` text NOT NULL DEFAULT '',
  `description` text NOT NULL DEFAULT '',
  `order` integer NOT NULL DEFAULT 0,
  `is_active` integer NOT NULL DEFAULT 1,
  `created_at` text NOT NULL DEFAULT (datetime('now')),
  `updated_at` text NOT NULL DEFAULT (datetime('now'))
);

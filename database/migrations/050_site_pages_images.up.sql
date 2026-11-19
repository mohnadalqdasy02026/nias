-- Add support for multiple images on static pages (e.g. trustees charts, structure diagrams)
ALTER TABLE site_pages
  ADD COLUMN IF NOT EXISTS images JSONB NOT NULL DEFAULT '[]'::jsonb;

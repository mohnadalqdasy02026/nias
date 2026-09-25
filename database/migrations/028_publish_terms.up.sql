-- publish the terms & conditions static page
UPDATE site_pages SET status = 'published', updated_at = NOW() WHERE slug = 'terms';
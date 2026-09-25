-- revert terms page to draft
UPDATE site_pages SET status = 'draft', updated_at = NOW() WHERE slug = 'terms';
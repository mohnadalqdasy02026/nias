-- Down: remove the trustees/conferences pages added in 042.
DELETE FROM site_pages WHERE slug IN ('trustees', 'conferences');

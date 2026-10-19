-- Down: remove the dean/structure pages added in 041.
DELETE FROM site_pages WHERE slug IN ('dean', 'structure');

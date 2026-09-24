-- 009 (down): remove demo contact messages
DELETE FROM contact_messages WHERE email IN
    ('demo-contact-1@example.test', 'demo-contact-2@example.test', 'demo-contact-3@example.test');
import { ContactRepository } from '../repositories/contact.repository.js';
import { env } from '../config/env.js';
import { buildContactNotificationEmail, sendMail } from './mailer.service.js';

export class ContactService {
  constructor(repo = new ContactRepository()) {
    this.repo = repo;
  }

  async submit(input) {
    const created = await this.repo.create(input);
    // Notify the institute administration about the new message. The message
    // flow must never fail because the notification email did.
    const to = env.CONTACT_NOTIFY_TO || 'admin@nias-academy.demo';
    if (to) {
      const { html, text } = buildContactNotificationEmail({ ...input, id: created.id });
      await sendMail({ to, subject: `رسالة تواصل جديدة: ${input.subject || input.name}`, html, text });
    }
    return created;
  }
}
import { ContactRepository } from '../repositories/contact.repository.js';

export class ContactService {
  constructor(repo = new ContactRepository()) {
    this.repo = repo;
  }

  async submit(input) {
    return this.repo.create(input);
  }
}
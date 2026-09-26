import { randomBytes } from 'node:crypto';
import { AppError } from '../utils/AppError.js';
import { TrainingRepository } from '../repositories/training.repository.js';

const CAPTCHA_TTL_MS = 5 * 60 * 1000; // 5 minutes
const CAPTCHA_REAP_MS = 60 * 1000;    // cleanup sweep interval

// Server-side challenge store: ids and answers NEVER leave the server.
const captchaStore = new Map(); // challengeId -> { answer, expiresAt }
setInterval(() => {
  const now = Date.now();
  for (const [id, entry] of captchaStore) {
    if (entry.expiresAt < now) captchaStore.delete(id);
  }
}, CAPTCHA_REAP_MS).unref();

function storeCaptcha() {
  const a = Math.floor(Math.random() * 10) + 3;
  const b = Math.floor(Math.random() * 10) + 1;
  const challengeId = randomBytes(16).toString('hex');
  captchaStore.set(challengeId, { answer: a + b, attempts: 0, expiresAt: Date.now() + CAPTCHA_TTL_MS });
  return { challengeId, question: `كم ناتج جمع ${a} + ${b} ؟` };
}

function normalizePhone(phone) {
  const arabic = '٠١٢٣٤٥٦٧٨٩'.split('');
  const map = { '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4', '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9' };
  let s = phone.replace(/\s+/g, '').replace(/-/g, '');
  for (const a of arabic) s = s.replace(new RegExp(a, 'g'), map[a]);
  return s;
}

export class TrainingService {
  constructor(repo = new TrainingRepository()) {
    this.repo = repo;
  }

  // ---------- Courses (admin) ----------
  async listCourses(query) {
    return this.repo.listCourses(query);
  }

  async getCourse(id) {
    const course = await this.repo.getCourse(id);
    if (!course) throw AppError.notFound('Training course not found');
    return course;
  }

  async createCourse(data) {
    if (data.branch_id != null) await this.assertBranchExists(data.branch_id);
    return this.repo.createCourse(data);
  }

  async updateCourse(id, data) {
    await this.getCourse(id);
    if (data.branch_id !== undefined && data.branch_id != null) await this.assertBranchExists(data.branch_id);
    return this.repo.updateCourse(id, data);
  }

  async deleteCourse(id) {
    await this.getCourse(id);
    const enrollments = await this.repo.countEnrollments(id);
    if (enrollments > 0) {
      throw AppError.conflict('Cannot delete a course that has enrollment records');
    }
    const deleted = await this.repo.deleteCourse(id);
    if (!deleted) throw AppError.notFound('Training course not found');
    return { id: Number(id), deleted: true };
  }

  async assertBranchExists(branchId) {
    if (!(await this.repo.getBranch(branchId))) {
      throw AppError.badRequest('Branch does not exist');
    }
  }

  // ---------- Trainees ----------
  async listTrainees(query) {
    return this.repo.listTrainees(query);
  }

  // ---------- Enrollments (admin) ----------
  async listEnrollments(query) {
    return this.repo.listEnrollments(query);
  }

  async getEnrollment(id) {
    const enrollment = await this.repo.getEnrollment(id);
    if (!enrollment) throw AppError.notFound('Enrollment not found');
    return enrollment;
  }

  async updateEnrollmentStatus(id, status) {
    await this.getEnrollment(id);
    const updated = await this.repo.updateEnrollmentStatus(id, status);
    return updated;
  }

  // ---------- Public registration ----------
  buildCaptcha() {
    return storeCaptcha();
  }

  async registerForCourse({ first_name, father_name, grandfather_name, family_name, phone, branch_id, course_id, signature_data, challenge_id, answer }) {
    // 1) Verify captcha (server-side challenge store; answers never leaked)
    const entry = captchaStore.get(challenge_id);
    if (!entry || entry.expiresAt < Date.now()) {
      captchaStore.delete(challenge_id);
      throw AppError.unprocessable('Invalid captcha challenge', [{ field: 'challengeId', message: 'انتهت صلاحية التحقق أو أنه غير صالح' }]);
    }
    if (entry.attempts >= 3) {
      captchaStore.delete(challenge_id);
      throw AppError.unprocessable('Captcha expired', [{ field: 'challengeId', message: 'أُجريت محاولات أكثر من اللازم، أعد التحقق' }]);
    }
    if (entry.answer !== Number(answer)) {
      entry.attempts += 1;
      throw AppError.unprocessable('Captcha incorrect', [{ field: 'answer', message: 'الإجابة غير صحيحة' }]);
    }
    captchaStore.delete(challenge_id);

    // 2) Course must exist (open + capacity enforced atomically at insert)
    const course = await this.repo.getCourse(course_id);
    if (!course) throw AppError.badRequest('Course does not exist');
    if (course.status !== 'open') throw AppError.badRequest('Registration for this course is closed');

    // 3) Branch must exist (FK guard -> friendly 400 instead of a raw 500)
    if (!(await this.repo.getBranch(branch_id))) {
      throw AppError.badRequest('Branch does not exist');
    }

    // 4) Find or create the trainee (by normalized phone)
    const normalized = normalizePhone(phone);
    let trainee = await this.repo.findTraineeByPhone(normalized);
    const fullName = [first_name, father_name, grandfather_name, family_name].join(' ');
    if (!trainee) {
      trainee = await this.repo.createTrainee({
        fullName,
        phone: normalized,
        branchId: branch_id,
        signatureData: signature_data ?? null,
      });
    }

    // 5) Duplicate active enrollment guard (also enforced by partial unique index)
    const existing = await this.repo.findActiveEnrollment(trainee.id, course_id);
    if (existing) {
      throw AppError.conflict('You already have an active enrollment for this course');
    }

    // 6) Atomic capacity + insert under a locked read of the course row
    const enrollment = await this.repo.createEnrollmentWithinCapacity(trainee.id, course_id);
    return { enrollmentId: enrollment.id, status: enrollment.status, courseTitle: course.title, fullName };
  }
}
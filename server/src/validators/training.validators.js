import { z } from 'zod';

const idParams = z.object({ id: z.coerce.number().int().positive() });

export const listTrainingCoursesSchema = {
  query: z.object({
    status: z.enum(['draft', 'open', 'closed', 'completed']).optional(),
    branchId: z.coerce.number().int().positive().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
  }),
};

const courseBody = z.object({
  title: z.string().trim().min(2).max(255),
  branch_id: z.coerce.number().int().positive().nullable().optional(),
  description: z.string().trim().max(10000).nullable().optional(),
  fees: z.coerce.number().min(0).nullable().optional(),
  start_date: z.coerce.date().nullable().optional(),
  end_date: z.coerce.date().nullable().optional(),
  location: z.string().trim().max(190).nullable().optional(),
  capacity: z.coerce.number().int().positive().nullable().optional(),
  trainer: z.string().trim().max(190).nullable().optional(),
  image_url: z.string().trim().max(500).nullable().optional(),
  status: z.enum(['draft', 'open', 'closed', 'completed']).default('draft'),
});
export const createCourseSchema = { body: courseBody };
export const updateCourseSchema = { params: idParams, body: courseBody.partial() };
export const getCourseParams = { params: idParams };

export const listEnrollmentsSchema = {
  query: z.object({
    status: z.enum(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']).optional(),
    courseId: z.coerce.number().int().positive().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
  }),
};

export const updateEnrollmentStatusSchema = {
  params: idParams,
  body: z.object({ status: z.enum(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']) }),
};

export const listTraineesSchema = {
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
  }),
};

// ---- Public registration ----
export const trainingRegisterSchema = {
  body: z.object({
    first_name: z.string().trim().min(2).max(120),
    father_name: z.string().trim().min(2).max(120),
    grandfather_name: z.string().trim().min(2).max(120),
    family_name: z.string().trim().min(2).max(120),
    phone: z.string().trim().min(7).max(20),
    branch_id: z.coerce.number().int().positive(),
    course_id: z.coerce.number().int().positive(),
    signature_data: z.string().trim().max(500).optional().nullable(),
    challenge_id: z.string().trim().min(1),
    answer: z.coerce.number().int(),
  }),
};
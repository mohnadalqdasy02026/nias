import { AppError } from '../utils/AppError.js';
import { verifyAccessToken } from '../utils/jwt.js';
import { UserRepository } from '../repositories/user.repository.js';

const userRepo = new UserRepository();

export async function requireAuth(req, _res, next) {
  try {
    const header = req.headers.authorization ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw AppError.unauthorized('Missing access token');

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch (err) {
      return next(err);
    }

    const user = await userRepo.findById(payload.sub);
    if (!user || user.status !== 'active') {
      return next(AppError.unauthorized('Account unavailable'));
    }

    const { roles, permissions } = await userRepo.findRolesAndPermissions(user.id);
    req.user = {
      id: user.id,
      nameAr: user.full_name_ar,
      nameEn: user.full_name_en,
      email: user.email,
      phone: user.phone,
      branchId: user.branch_id,
      roles,
      permissions,
    };

    return next();
  } catch (err) {
    // Let real failures (e.g. DB down) surface as 500 instead of masking them as 401.
    return next(err);
  }
}

export function requirePermission(...codes) {
  return (req, _res, next) => {
    if (!req.user) return next(AppError.unauthorized());
    const has = codes.some((code) => req.user.permissions.includes(code));
    if (!has) return next(AppError.forbidden(`Missing permission: ${codes.join(' or ')}`));
    next();
  };
}

export function requireRole(...names) {
  return (req, _res, next) => {
    if (!req.user) return next(AppError.unauthorized());
    const has = names.some((name) => req.user.roles.includes(name));
    if (!has) return next(AppError.forbidden(`Required role: ${names.join(' or ')}`));
    next();
  };
}
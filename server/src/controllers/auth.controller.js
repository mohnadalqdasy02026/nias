import { asyncHandler, success } from '../utils/asyncHandler.js';
import { AuthService } from '../services/auth.service.js';

export class AuthController {
  constructor(service = new AuthService()) {
    this.service = service;
  }

  login = asyncHandler(async (req, res) => {
    const { identifier, password } = req.body;
    const data = await this.service.login({
      identifier,
      password,
      userAgent: req.get('user-agent'),
      ipAddress: req.ip,
    });
    return success(res, data, 200);
  });

  refresh = asyncHandler(async (req, res) => {
    const data = await this.service.refresh({
      refreshToken: req.body.refreshToken,
      userAgent: req.get('user-agent'),
      ipAddress: req.ip,
    });
    return success(res, data);
  });

  logout = asyncHandler(async (req, res) => {
    await this.service.logout({ refreshToken: req.body.refreshToken });
    return success(res, { message: 'Logged out' });
  });

  me = asyncHandler(async (req, res) => {
    return success(res, req.user);
  });

  logoutAll = asyncHandler(async (req, res) => {
    await this.service.logoutAll(req.user.id);
    return success(res, { message: 'Logged out from all devices' });
  });

  forgotPassword = asyncHandler(async (req, res) => {
    await this.service.requestPasswordReset({
      identifier: req.body.identifier,
      userAgent: req.get('user-agent'),
    });
    // Always return the same message to avoid account enumeration. The reset
    // link (when the account exists) is delivered by email.
    return success(res, { message: 'إذا كان الحساب موجودًا، فقد أُرسل إليك رابط إعادة التعيين.' });
  });

  resetPassword = asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body;
    await this.service.resetPassword({ token, newPassword });
    return success(res, { message: 'Password updated. You may now log in.' });
  });
}
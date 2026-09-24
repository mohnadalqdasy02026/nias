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
    const result = await this.service.requestPasswordReset({
      identifier: req.body.identifier,
      userAgent: req.get('user-agent'),
    });
    // SMTP is not configured; expose dev token only outside production.
    if (result && process.env.NODE_ENV !== 'production') {
      return success(res, {
        message: 'Reset link sent (dev mode: no SMTP configured)',
        debugResetToken: result.resetToken,
        expiresIn: result.expiresIn,
      });
    }
    return success(res, { message: 'If the account exists, a reset link has been sent.' });
  });

  resetPassword = asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body;
    await this.service.resetPassword({ token, newPassword });
    return success(res, { message: 'Password updated. You may now log in.' });
  });
}
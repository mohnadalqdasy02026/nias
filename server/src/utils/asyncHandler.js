export const asyncHandler =
  (fn) =>
  (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

export const success = (res, data = null, status = 200) => {
  res.status(status).json({ success: true, data });
};

export const created = (res, data = null) => success(res, data, 201);
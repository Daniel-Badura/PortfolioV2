export const notFound = (_req, res) => res.status(404).json({ message: 'Not found' });

export const errorHandler = (err, _req, res, next) => {
  if (res.headersSent) return next(err);
  const status = Number.isInteger(err.status) && err.status >= 400 && err.status < 600 ? err.status : 500;
  res.status(status).json({ message: status >= 500 ? 'Unable to complete the request' : err.message });
};

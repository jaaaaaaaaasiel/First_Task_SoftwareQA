const DOMAIN = '@lasallebajio.edu.mx';

export function validateLasalleEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const normalized = email.trim().toLowerCase();
  return normalized.endsWith(DOMAIN) && normalized.length > DOMAIN.length;
}

export function emailValidator(req, res, next) {
  const email = req.body?.email || req.query?.email;
  if (email && !validateLasalleEmail(email)) {
    return res.status(400).json({
      error: 'Solo se permiten correos del dominio @lasallebajio.edu.mx'
    });
  }
  next();
}

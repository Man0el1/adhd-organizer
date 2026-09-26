export async function requireToken(req, res, next) {
  try {
    if (req.user.id) return next();
    return res.status(403).json({ message: "Token inválido ou expirado" });
  } catch (err) {
    return res.status(403).json({ message: "Token inválido ou expirado" });
  }
}

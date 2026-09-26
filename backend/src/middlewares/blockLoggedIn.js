import jwt from "jsonwebtoken";

export function blockLoggedIn(req, res, next) {
  const authHeader = req.headers['authorization']; // Bearer <token>
  const token = authHeader && authHeader.split(" ")[1];

  if (token){
    try {
      jwt.verify(token, process.env.JWT_SECRET);
      return res.status(403).json({ message: "Você já está logado." });
    } catch (err) {
      // Token inválido ou expirado, permitir acesso à rota
    }
  }
  return next();
}

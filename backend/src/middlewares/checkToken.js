import jwt from "jsonwebtoken";
import { Account } from "../models/accountModel.js";

export async function checkToken(req, res, next) {
  const authHeader = req.headers['authorization']; // Bearer <token>
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Acesso negado. Token não fornecido." });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'focusmod-secret-key-2026');
    const user = await Account.findByPk(decodedToken.id);

    if (!user) {
      return res.status(401).json({ message: "Sessão expirada. Faça login novamente." });
    }

    const userTimezone =
      user.timezone ||
      req.headers['x-user-timezone'] ||
      decodedToken.timezone ||
      'America/Sao_Paulo';

    req.user = {
      ...decodedToken,
      id: user.id_account || decodedToken.id,
      username: user.username || decodedToken.username,
      email: user.email || decodedToken.email,
      timezone: userTimezone,
    };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Sessão expirada. Faça login novamente." });
  }
}

import jwt from "jsonwebtoken";
import { Account } from "../models/accountModel.js";

export async function checkToken(req, res, next) {
  const authHeader = req.headers['authorization']; // Bearer <token>
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return next();

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Account.findByPk(decodedToken.id);

    if (!user) return res.status(401).json({ message: "Sessão expirada. Faça login novamente"});

    req.user = decodedToken;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Sessão expirada. Faça login novamente"});
  }
}

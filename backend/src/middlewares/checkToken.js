import jwt from "jsonwebtoken";
import { Conta } from "../models/contaModel.js";

export async function checkToken(req, res, next) {
  const authHeader = req.headers['authorization']; // Bearer <token>
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return next();

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await Conta.findByPk(decodedToken.id);

    if (!usuario) return res.status(401).json({ message: "Sessão expirada. Faça login novamente"});

    req.user = decodedToken;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Sessão expirada. Faça login novamente"});
  }
}

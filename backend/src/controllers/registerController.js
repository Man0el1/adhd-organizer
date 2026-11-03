import { Account } from "../models/accountModel.js";
import jwt from "jsonwebtoken";
import bcrypt from 'bcryptjs';

export const createAccount = async (req, res) => {
  try {
    const { username, email, password, confirmPassword, timezone } = req.body;
    const userTimezone = timezone && typeof timezone === 'string' ? timezone : 'America/Sao_Paulo';

    if (password !== confirmPassword) return res.status(403).json({message: "Senhas precisam ser iguais."});

    if (username) {
      const existingUsername = await Account.findOne({where: {username: username}});
      if (existingUsername) return res.status(409).json({message: "Nome de usuário ja existe."});
    }

    const account = await Account.findOne({where: {email: email}});
    if (account) return res.status(403).json({message: "Conta ja existe."});

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAccount = await Account.create({
      username: username || email.split('@')[0],
      email: email,
      password: hashedPassword,
      timezone: userTimezone,
    });

    const token = jwt.sign(
      { id: newAccount.id_account, username: newAccount.username, email: newAccount.email, timezone: userTimezone },
      process.env.JWT_SECRET || 'focusmod-secret-key-2026',
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Conta criada com sucesso!",
      token,
      user: {
        id: newAccount.id_account,
        username: newAccount.username,
        email: newAccount.email,
        timezone: userTimezone,
      }
    });

  } catch (e) {
    return res.status(500).json({message: `Erro no servidor ao criar a conta: ${e.message}`});
  }
}

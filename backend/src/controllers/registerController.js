import { Account } from "../models/accountModel.js";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';

export const createAccount = async (req, res) => {
  try {
    const {username, email, password, confirmPassword} = req.body;

    if (password !== confirmPassword) return res.status(403).json({message: "Senhas precisam ser iguais."});

    const existingUsername = await Account.findOne({where: {username: username}})
    if (existingUsername) return res.status(409).json({message: "Nome de usuário ja existe."});

    const account = await Account.findOne({where: {email: email}})
    if (account) return res.status(403).json({message: "Conta ja existe."});

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAccount = await Account.create({
      email: email,
      password: hashedPassword
    })

    const token = jwt.sign(
      { id: newAccount.id_account, username: newAccount.username, email: newAccount.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" } // mudar depois, talvez parar de usar tokens
    );

    return res.status(200).json({message: "Conta criada!.", token});

  } catch (e) {
    return res.status(500).json({message: `Erro no servidor ao criar a conta: ${e.message}`});
  }
}

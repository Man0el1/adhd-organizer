import { Account } from "../models/accountModel.js";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';

export const accountExists = async (req, res) => {
  try {
    const {email, password} = req.body;

    const account = await Account.findOne({where: {email: email}})
    if (!account) return res.status(403).json({message: "Erro no login."});

    const correctPassword = await bcrypt.compare(password, account.password);
    if (!correctPassword) return res.status(403).json({message: "Erro no login."});

    const token = jwt.sign(
      { id: account.id_account },
      process.env.JWT_SECRET,
      { expiresIn: "1h" } // mudar depois, talvez parar de usar tokens
    );

    return res.status(200).json({message: "Login concluido.", token});

  } catch (e) {
    return res.status(500).json({message: "Erro no servidor entrar na account."});
  }
}

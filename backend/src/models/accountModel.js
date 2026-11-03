import { DataTypes } from 'sequelize';
import sequelize, { isDatabaseConnected } from '../database/sequelize.js';
import bcrypt from 'bcryptjs';

// Modelo Sequelize oficial para a tabela Account
export const Account = sequelize.define('Account', {
  id_account: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  timezone: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'America/Sao_Paulo'
  }
}, {
  tableName: 'Account',
  timestamps: true
});

// Alias para compatibilidade reversa
export const AccountModel = Account;

// Contas padrão de teste para acesso rápido
export const DEFAULT_ACCOUNTS = [
  { username: 'teste', email: 'teste@focusmod.com', rawPassword: '123456', timezone: 'America/Sao_Paulo' },
  { username: 'admin', email: 'admin@focusmod.com', rawPassword: '123456', timezone: 'America/Sao_Paulo' },
  { username: 'manoel', email: 'manoel@focusmod.com', rawPassword: '123456', timezone: 'America/Sao_Paulo' },
];

let nextId = 1;
export const inMemoryAccounts = [];

// Seed das contas demo padrão em memória
const saltRounds = 10;
DEFAULT_ACCOUNTS.forEach((acc) => {
  inMemoryAccounts.push({
    id_account: nextId++,
    username: acc.username,
    email: acc.email,
    password: bcrypt.hashSync(acc.rawPassword, saltRounds),
    timezone: acc.timezone || 'America/Sao_Paulo',
    createdAt: new Date(),
    updatedAt: new Date(),
  });
});

// Envolve métodos de consulta com fallback para o modo em memória caso PostgreSQL não esteja ativo
const originalFindOne = Account.findOne.bind(Account);
const originalFindByPk = Account.findByPk.bind(Account);
const originalCreate = Account.create.bind(Account);

export const seedDefaultAccounts = async () => {
  if (await isDatabaseConnected()) {
    for (const acc of DEFAULT_ACCOUNTS) {
      try {
        const found = await originalFindOne({ where: { email: acc.email } });
        if (!found) {
          const hash = bcrypt.hashSync(acc.rawPassword, saltRounds);
          await originalCreate({
            username: acc.username,
            email: acc.email,
            password: hash,
          });
          console.log(`✅ Conta padrão inserida no banco: ${acc.email}`);
        }
      } catch (err) {
        console.warn(`Aviso ao semear conta padrão: ${err.message}`);
      }
    }
  }
};

Account.findOne = async function(options = {}) {
  const where = options.where || {};
  const requestedEmail = where.email ? String(where.email).trim().toLowerCase() : null;

  if (await isDatabaseConnected()) {
    let found = await originalFindOne(options);
    if (!found && requestedEmail) {
      const defaultAcc = DEFAULT_ACCOUNTS.find(
        (a) => a.email.toLowerCase() === requestedEmail
      );
      if (defaultAcc) {
        try {
          const hash = bcrypt.hashSync(defaultAcc.rawPassword, saltRounds);
          found = await originalCreate({
            username: defaultAcc.username,
            email: defaultAcc.email,
            password: hash,
          });
          console.log(`✅ Conta padrão auto-recriada no banco: ${defaultAcc.email}`);
        } catch (e) {
          found = await originalFindOne(options);
        }
      }
    }
    return found;
  }

  const wrapInMemory = (acc) => {
    if (!acc) return null;
    return {
      ...acc,
      update: async function(updates) {
        Object.assign(acc, updates);
        Object.assign(this, updates);
        return this;
      }
    };
  };

  const found = inMemoryAccounts.find((acc) => {
    if (requestedEmail && acc.email.toLowerCase() !== requestedEmail) return false;
    if (where.username && acc.username.toLowerCase() !== String(where.username).toLowerCase()) return false;
    if (where.id_account && acc.id_account !== Number(where.id_account)) return false;
    return true;
  });
  return wrapInMemory(found);
};

Account.findByPk = async function(id, options = {}) {
  if (await isDatabaseConnected()) {
    return await originalFindByPk(id, options);
  }
  const found = inMemoryAccounts.find((acc) => acc.id_account === Number(id));
  if (!found) return null;
  return {
    ...found,
    update: async function(updates) {
      Object.assign(found, updates);
      Object.assign(this, updates);
      return this;
    }
  };
};

Account.create = async function(data, options = {}) {
  if (await isDatabaseConnected()) {
    return await originalCreate(data, options);
  }
  const newAcc = {
    id_account: nextId++,
    username: data.username || data.email?.split('@')[0] || `user_${nextId}`,
    email: data.email,
    password: data.password,
    timezone: data.timezone || 'America/Sao_Paulo',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  inMemoryAccounts.push(newAcc);
  return {
    ...newAcc,
    update: async function(updates) {
      Object.assign(newAcc, updates);
      Object.assign(this, updates);
      return this;
    }
  };
};

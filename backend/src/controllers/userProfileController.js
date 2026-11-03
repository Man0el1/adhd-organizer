import { Account } from '../models/accountModel.js';

/**
 * Valida se uma string é um fuso horário IANA válido suportado pela plataforma
 */
export function isValidIanaTimezone(tz) {
  if (!tz || typeof tz !== 'string') return false;
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/**
 * GET /api/user/profile
 * Retorna os dados do perfil do usuário autenticado, incluindo fuso horário configurado
 */
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user?.id || 1;
    const user = await Account.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    const timezone =
      user.timezone ||
      req.headers['x-user-timezone'] ||
      'America/Sao_Paulo';

    return res.status(200).json({
      user: {
        id: user.id_account || user.id,
        username: user.username,
        email: user.email,
        timezone,
      },
    });
  } catch (e) {
    return res.status(500).json({ message: `Erro ao obter perfil do usuário: ${e.message}` });
  }
};

/**
 * PATCH /api/user/timezone
 * Atualiza o fuso horário configurado no perfil do usuário
 */
export const updateUserTimezone = async (req, res) => {
  try {
    const userId = req.user?.id || 1;
    const { timezone } = req.body;

    if (!timezone || !isValidIanaTimezone(timezone)) {
      return res.status(400).json({
        message: `Fuso horário inválido: "${timezone}". Por favor, utilize um fuso horário IANA válido (ex: America/Sao_Paulo).`,
      });
    }

    const user = await Account.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    if (typeof user.update === 'function') {
      await user.update({ timezone });
    } else {
      user.timezone = timezone;
    }

    return res.status(200).json({
      message: 'Fuso horário atualizado com sucesso.',
      timezone,
      user: {
        id: user.id_account || user.id,
        username: user.username,
        email: user.email,
        timezone,
      },
    });
  } catch (e) {
    return res.status(500).json({ message: `Erro ao atualizar fuso horário: ${e.message}` });
  }
};

/**
 * PUT /api/user/profile
 * Atualiza dados gerais do perfil (username, timezone)
 */
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user?.id || 1;
    const { username, timezone } = req.body;

    const user = await Account.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    const updates = {};
    if (username && username.trim()) {
      updates.username = username.trim();
    }
    if (timezone) {
      if (!isValidIanaTimezone(timezone)) {
        return res.status(400).json({
          message: `Fuso horário inválido: "${timezone}".`,
        });
      }
      updates.timezone = timezone;
    }

    if (Object.keys(updates).length > 0) {
      if (typeof user.update === 'function') {
        await user.update(updates);
      } else {
        Object.assign(user, updates);
      }
    }

    return res.status(200).json({
      message: 'Perfil atualizado com sucesso.',
      user: {
        id: user.id_account || user.id,
        username: user.username,
        email: user.email,
        timezone: user.timezone || 'America/Sao_Paulo',
      },
    });
  } catch (e) {
    return res.status(500).json({ message: `Erro ao atualizar perfil: ${e.message}` });
  }
};

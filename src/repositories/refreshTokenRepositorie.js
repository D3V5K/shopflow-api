const crypto = require('crypto');
const RefreshToken = require('../models/refreshToken.model');

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

class RefreshTokenRepository {

  async create(refreshToken, userId, meta = {}) {
    return await RefreshToken.create({
      token: hashToken(refreshToken),        
      userId,
      userAgent: meta.userAgent ?? null,
      ipAddress: meta.ipAddress ?? null,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    });
  }

  async findByToken(token) {
    return await RefreshToken.findOne({ token: hashToken(token) });
  }

  async findValidByToken(token) {
    return await RefreshToken.findOne({
      token: hashToken(token),
      expiresAt: { $gt: new Date() },
    });
  }

  async findByUserId(userId) {
    return await RefreshToken.find({ userId }).sort({ createdAt: -1 });
  }

  async deleteByToken(token) {
    return await RefreshToken.findOneAndDelete({ token: hashToken(token) });
  }

  async deleteAllByUserId(userId) {
    return await RefreshToken.deleteMany({ userId });
  }

  async deleteExpired() {
    return await RefreshToken.deleteMany({ expiresAt: { $lt: new Date() } });
  }
}

module.exports = new RefreshTokenRepository();
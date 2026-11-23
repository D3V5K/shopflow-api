const User = require("../models/user.model");

class UserRepository {

    async createUser(userData) {
        return await User.create(userData);
    }

    async findByEmail(email) {        
        return await User.findOne({ email }).select('+password');
    }

    async findByUsername(username) {
        return await User.findOne({ username });
    }

    async findById(userId) {
        return await User.findById(userId);
    }
    async updateIsActive(userId, isActive) {
        return await User.findByIdAndUpdate(
            userId,
            { isActive },
            { new: true }
        );
    }

    async markEmailVerified(userId) {
        return await User.findByIdAndUpdate(
            userId,
            { emailVerified: true },
            { new: true }
        );
    }

    async incrementFailedAttempts(userId) {
        return await User.findByIdAndUpdate(
            userId,
            { $inc: { failedAttempts: 1 } },
            { new: true }
        );
    }

    async updateLockedUntil(userId, lockDurationMs) {
        return await User.findByIdAndUpdate(
            userId,
            { lockedUntil: new Date(Date.now() + lockDurationMs) },
            { new: true }
        );
    }
    async updateLastLogin(userId) {
    return await User.findByIdAndUpdate(
        userId,
        { lastLogin: new Date() },
        { new: true }
    );
}

    async resetSecurityOnLogin(userId) {
        return await User.findByIdAndUpdate(
            userId,
            {
                lastLogin: new Date(),
                failedAttempts: 0,
                lockedUntil: null
            },
            { new: true }
        );
    }

    async updateLastLogout(userId) {
        return await User.findByIdAndUpdate(
            userId,
            { lastLogout: new Date() },
            { new: true }
        );
    }

    async softDeleteUser(userId) {
        return await User.findByIdAndUpdate(
            userId,
            { deletedAt: new Date(), isActive: false },
            { new: true }
        );
    }
}

module.exports = new UserRepository();
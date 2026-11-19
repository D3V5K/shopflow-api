const AppError = require("../utils/AppError");
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");

const UserRepository = require('../repositories/userRepository');
const refreshTokenRepositorie = require('../repositories/refreshTokenRepositorie');

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;

const register = async (userData) => {
    const email = userData.email.trim().toLowerCase();

    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
        throw new AppError("Email already exists", 409);
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const newUserData = {
        username: userData.username,
        email,
        password: hashedPassword
    };

    const user = await UserRepository.createUser(newUserData);
    const userResponse = user.toObject();
    delete userResponse.password;

    return userResponse;
};


const login = async (userData) => {
    const email = userData.email.trim().toLowerCase();

    const existingUser = await UserRepository.findByEmail(email);
    if (!existingUser) {
        throw new AppError("Invalid email or password", 401);
    }

    if (!existingUser.isActive) {
        throw new AppError("Your account has been blocked. Please contact support.", 403);
    }

    if (existingUser.lockedUntil && existingUser.lockedUntil > new Date()) {
        throw new AppError("Account is temporarily locked. Please try again later.", 403);
    }

    const isMatch = await bcrypt.compare(
        userData.password,
        existingUser.password
    );

    if (!isMatch) {
        const updated = await UserRepository.incrementFailedAttempts(existingUser._id);

        if (updated.failedAttempts >= MAX_FAILED_ATTEMPTS) {
            await UserRepository.updateLockedUntil(existingUser._id, LOCK_DURATION_MS);
        }

        throw new AppError("Invalid email or password", 401);
    }

    const accessToken = JWT.sign(
        {
            userId: existingUser._id,
            role: existingUser.role
        },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: "15m" }
    );

    const refreshToken = JWT.sign(
        { userId: existingUser._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "7d" }
    );

    await refreshTokenRepositorie.create(
        refreshToken,
        existingUser._id,
        {
            userAgent: userData.userAgent,
            ipAddress: userData.ipAddress
        }
    );

    await UserRepository.updateLastLogin(existingUser._id);

    const userResponse = {
        _id: existingUser._id,
        id: existingUser._id, 
        username: existingUser.username,
        email: existingUser.email,
        role: existingUser.role,
        lastLogin: existingUser.lastLogin || new Date()
    };

    return {
        accessToken,
        refreshToken,
        user: userResponse
    };
};


const refreshAccessToken = async (refreshToken) => {
    const storedToken = await refreshTokenRepositorie.findByToken(refreshToken);
    if (!storedToken) {
        throw new AppError("Invalid refresh token", 401);
    }

    let decoded;
    try {
        decoded = JWT.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
        throw new AppError("Invalid or expired refresh token", 401);
    }

    const user = await UserRepository.findById(decoded.userId);
    if (!user) {
        throw new AppError("User not found", 404);
    }

    if (!user.isActive) {
        throw new AppError("Your account has been blocked. Please contact support.", 403);
    }

    const newAccessToken = JWT.sign(
        {
            userId: user._id,
            role: user.role
        },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: "15m" }
    );

    return newAccessToken;
};


const logout = async (refreshToken, userId) => {
    if (refreshToken) {
        await refreshTokenRepositorie.deleteByToken(refreshToken);
    }

    if (userId) {
        await UserRepository.updateLastLogout(userId);
    }

    return true;
};


const logoutAll = async (userId) => {
    await refreshTokenRepositorie.deleteAllByUserId(userId);

    await UserRepository.updateLastLogout(userId);

    return true;
};


module.exports = {
    register,
    login,
    refreshAccessToken,
    logout,
    logoutAll
};
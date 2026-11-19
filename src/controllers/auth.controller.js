const authService = require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const UserRepository = require('../repositories/userRepository');

const REFRESH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
};


const register = asyncHandler(async (req, res) => {
    const user = await authService.register(req.body);

    res.status(201).json({
        status: 'success',
        message: 'User registered successfully',
        user
    });
});


const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    
        
    const { accessToken, refreshToken, user } = await authService.login({
        email,
        password,
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip
    });

    res.cookie('refreshToken', refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: REFRESH_TOKEN_MAX_AGE_MS
    });

    res.status(200).json({
        status: 'success',
        message: 'Logged in successfully',
        accessToken,
        user
    });
});


const refresh = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        throw new AppError('No refresh token provided', 401);
    }

    const newAccessToken = await authService.refreshAccessToken(refreshToken);

    res.status(200).json({
        status: 'success',
        accessToken: newAccessToken
    });
});


const logout = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    const userId = req.user?.userId;

    if (refreshToken) {
        await authService.logout(refreshToken, userId);
    }

    res.clearCookie('refreshToken', COOKIE_OPTIONS);

    res.status(200).json({
        status: 'success',
        message: 'Logged out successfully'
    });
});


const logoutAll = asyncHandler(async (req, res) => {
    const userId = req.user.userId;

    await authService.logoutAll(userId);

    res.clearCookie('refreshToken', COOKIE_OPTIONS);

    res.status(200).json({
        status: 'success',
        message: 'Logged out from all devices successfully'
    });
});


const getMe = asyncHandler(async (req, res) => {
    const userId = req.user.userId;

    const user = await UserRepository.findById(userId);

    if (!user) {
        throw new AppError('User not found', 404);
    }

    res.status(200).json({
        status: 'success',
        user
    });
});


module.exports = {
    register,
    login,
    refresh,
    logout,
    logoutAll,
    getMe
};
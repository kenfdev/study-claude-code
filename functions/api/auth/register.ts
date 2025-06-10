import express from 'express';
import { createUser, findUserByEmail } from '../../lib/database';
import { hashPassword, generateToken, isValidEmail, isValidPassword, getPasswordRequirements } from '../../lib/auth';

export async function registerHandler(req: express.Request, res: express.Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
      return;
    }

    if (!isValidEmail(email)) {
      res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
      return;
    }

    if (!isValidPassword(password)) {
      res.status(400).json({
        success: false,
        message: getPasswordRequirements()
      });
      return;
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      // Use generic message to prevent user enumeration
      res.status(400).json({
        success: false,
        message: 'Registration failed. Please check your information and try again.'
      });
      return;
    }

    const passwordHash = await hashPassword(password);
    const user = await createUser(email, passwordHash);

    const token = generateToken({
      userId: user.id,
      email: user.email
    });

    res.status(201).json({
      success: true,
      user: {
        id: user.id,
        email: user.email
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(/* ...existing deps... */) {
    console.log('JWT_SECRET at startup:', process.env.JWT_SECRET);
    console.log('CWD:', process.cwd());
    this.logger.log('JWT_SECRET: ' + process.env.JWT_SECRET);
  }
  async signup(/* ...args... */) {
    try {
      // ...existing signup logic...
    } catch (e) {
      this.logger.error('Signup error:', e);
      throw e;
    }
  }
  async login(/* ...args... */) {
    try {
      // ...existing login logic...
    } catch (e) {
      this.logger.error('Login error:', e);
      throw e;
    }
  }
  // ... existing code ...
} 
import { Request } from 'express';

declare global {
  namespace Express {
    interface User {
      id: string;
      role: string;
      email?: string;
    }

    interface ApiKey {
      id: string;
      name: string;
      permissions: string[];
    }

    interface Request {
      user?: User;
      apiKey?: ApiKey;
    }
  }
}

export {}; 
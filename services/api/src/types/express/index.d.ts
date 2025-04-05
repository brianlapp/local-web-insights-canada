declare namespace Express {
  export interface Request {
    user?: {
      id: string;
      email: string;
      role: string;
      firstName?: string;
      lastName?: string;
    };
    
    apiKey?: {
      id: string;
      name: string;
      permissions: string[];
      expiresAt?: string;
    };
  }
} 
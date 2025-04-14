import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      body: any;
      params: any;
      query: any;
    }
    interface Response {
      status(code: number): Response;
      json(body: any): Response;
    }
  }
} 
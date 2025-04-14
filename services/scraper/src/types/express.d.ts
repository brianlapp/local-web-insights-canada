import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { ParamsDictionary, Query } from 'express-serve-static-core';

declare module 'express' {
  export interface Request<
    P = ParamsDictionary,
    ResBody = unknown,
    ReqBody = unknown,
    ReqQuery = Query,
  > extends ExpressRequest {
    body: ReqBody;
    params: P;
    query: ReqQuery;
    method: string;
    error?: Error;
  }

  export interface Response<ResBody = unknown> extends ExpressResponse {
    status(code: number): this;
    json(body: ResBody): this;
    header(name: string, value: string): this;
    end(): this;
  }

  export interface NextFunction {
    (err?: any): void;
  }
}

export {}; 
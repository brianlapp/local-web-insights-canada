// Custom type declarations for packages without official type definitions

// Babel packages
declare module '@babel/core' {
  export function transform(code: string, options?: any): Promise<any>;
  export function transformSync(code: string, options?: any): any;
}

declare module '@babel/generator' {
  export function generate(ast: any, options?: any): { code: string };
}

declare module '@babel/template' {
  export function ast(template: string, options?: any): any;
}

declare module '@babel/traverse' {
  export function traverse(ast: any, visitors: any): void;
}

// HTTP and middleware packages
declare module 'body-parser' {
  import { RequestHandler } from 'express';
  export function json(options?: any): RequestHandler;
  export function urlencoded(options?: any): RequestHandler;
}

declare module 'caseless' {
  export class Caseless {
    constructor(headers?: any);
    set(name: string, value: any): void;
    get(name: string): any;
  }
}

declare module 'connect' {
  import { RequestHandler } from 'express';
  export function json(options?: any): RequestHandler;
  export function urlencoded(options?: any): RequestHandler;
}

declare module 'cookiejar' {
  export class CookieJar {
    constructor();
    setCookie(cookie: string, url: string): void;
    getCookies(url: string): any[];
  }
}

declare module 'express-serve-static-core' {
  import { Request, Response, NextFunction } from 'express';
  export type RequestHandler = (req: Request, res: Response, next: NextFunction) => any;
}

declare module 'graceful-fs' {
  import * as fs from 'fs';
  export = fs;
}

declare module 'http-errors' {
  export function createError(status: number, message?: string): Error;
}

// Testing packages
declare module 'istanbul-lib-coverage' {
  export class CoverageMap {
    constructor();
    addFileCoverage(fileCoverage: any): void;
    getCoverageSummary(): any;
  }
}

declare module 'istanbul-lib-report' {
  export class Context {
    constructor(options?: any);
  }
}

declare module 'istanbul-reports' {
  export function create(name: string, options?: any): any;
}

declare module 'methods' {
  export const methods: string[];
}

declare module 'mime' {
  export function getType(path: string): string | null;
  export function getExtension(mimeType: string): string | null;
}

declare module 'phoenix' {
  export class Socket {
    constructor(endPoint: string, opts?: any);
    connect(): void;
    disconnect(callback?: () => void): void;
    channel(topic: string, params?: any): Channel;
  }

  export class Channel {
    join(timeout?: number): Push;
    leave(timeout?: number): Push;
    push(event: string, payload?: any, timeout?: number): Push;
    on(event: string, callback: (payload?: any) => void): void;
  }

  export class Push {
    receive(status: string, callback: (response?: any) => void): Push;
    then(callback: (response?: any) => void): Push;
    catch(callback: (error?: any) => void): Push;
  }
}

declare module 'qs' {
  export function parse(str: string, options?: any): any;
  export function stringify(obj: any, options?: any): string;
}

declare module 'range-parser' {
  export function parse(size: number, header: string, options?: any): any;
}

declare module 'send' {
  import { RequestHandler } from 'express';
  export function send(req: any, path: string, options?: any): any;
}

declare module 'serve-static' {
  import { RequestHandler } from 'express';
  export function serveStatic(root: string, options?: any): RequestHandler;
}

declare module 'stack-utils' {
  export function parse(stack: string): any[];
}

declare module 'strip-bom' {
  export function stripBom(str: string): string;
}

declare module 'strip-json-comments' {
  export function stripJsonComments(str: string, options?: any): string;
}

declare module 'tough-cookie' {
  export class Cookie {
    constructor(options?: any);
    toString(): string;
  }
}

declare module 'triple-beam' {
  export const levels: {
    error: number;
    warn: number;
    info: number;
    http: number;
    verbose: number;
    debug: number;
    silly: number;
  };
}

declare module 'ws' {
  export class WebSocket {
    constructor(address: string, options?: any);
    send(data: any, options?: any, callback?: (err?: Error) => void): void;
    close(code?: number, data?: string | Buffer): void;
    on(event: string, listener: (...args: any[]) => void): this;
  }
}

declare module 'yargs' {
  export function yargs(args?: string[]): any;
}

declare module 'yargs-parser' {
  export function parse(args: string[], opts?: any): any;
}

declare module 'yauzl' {
  export function open(path: string, options: any, callback: (err: Error | null, zipfile: any) => void): void;
  export function fromBuffer(buffer: Buffer, options: any, callback: (err: Error | null, zipfile: any) => void): void;
} 
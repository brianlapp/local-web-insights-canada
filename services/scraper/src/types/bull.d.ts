declare module 'bull' {
  import Redis from 'ioredis';
  
  export interface QueueOptions {
    redis?: Redis | string;
    prefix?: string;
    defaultJobOptions?: JobOptions;
    settings?: QueueSettings;
    limiter?: RateLimiterOptions;
    createClient?: (type: 'client' | 'subscriber' | 'bclient') => Redis;
  }
  
  export interface JobOptions {
    priority?: number;
    delay?: number;
    attempts?: number;
    repeat?: RepeatOptions;
    backoff?: BackoffOptions;
    lifo?: boolean;
    timeout?: number;
    removeOnComplete?: boolean | number;
    removeOnFail?: boolean | number;
    stackTraceLimit?: number;
  }
  
  export interface RepeatOptions {
    cron?: string;
    every?: number;
    tz?: string;
  }
  
  export interface BackoffOptions {
    type: string;
    delay: number;
  }
  
  export interface QueueSettings {
    lockDuration?: number;
    stalledInterval?: number;
    maxStalledCount?: number;
    guardInterval?: number;
    retryProcessDelay?: number;
    drainDelay?: number;
  }
  
  export interface RateLimiterOptions {
    max: number;
    duration: number;
    bounceBack?: boolean;
  }
  
  export interface Job<T = any> {
    id: string;
    data: T;
    opts: JobOptions;
    progress(percent: number): Promise<void>;
    finished(): Promise<any>;
    retry(): Promise<void>;
    remove(): Promise<void>;
    attemptsMade: number;
    failedReason?: string;
    stacktrace?: string;
    timestamp: number;
    processedOn?: number;
    finishedOn?: number;
  }
  
  export class Queue<T = any> {
    constructor(name: string, options?: QueueOptions);
    add(data: T, opts?: JobOptions): Promise<Job<T>>;
    process(concurrency: number, handler: (job: Job<T>) => Promise<any>): void;
    process(handler: (job: Job<T>) => Promise<any>): void;
    on(event: string, handler: (job: Job<T>, ...args: any[]) => void): this;
    getJob(jobId: string): Promise<Job<T> | null>;
    getJobCounts(): Promise<{
      waiting: number;
      active: number;
      completed: number;
      failed: number;
      delayed: number;
      paused: number;
    }>;
    close(): Promise<void>;
    isReady(): Promise<boolean>;
    pause(): Promise<void>;
    resume(): Promise<void>;
    clean(grace: number, status: string): Promise<void>;
    getRepeatableJobs(): Promise<Array<{
      key: string;
      name: string;
      id: string;
      endDate: number;
      tz: string;
      cron: string;
      every: number;
    }>>;
  }
} 
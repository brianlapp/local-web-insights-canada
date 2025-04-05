// User and Authentication types
export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  Admin = 'admin',
  Standard = 'standard',
  ReadOnly = 'readonly'
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

// API Key types
export interface ApiKey {
  id: string;
  name: string;
  key: string;
  prefix: string;
  permissions: string[];
  createdBy: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Webhook types
export interface Webhook {
  id: string;
  url: string;
  events: WebhookEvent[];
  secret: string;
  active: boolean;
  description?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export enum WebhookEvent {
  ReportCreated = 'report.created',
  ReportUpdated = 'report.updated',
  BusinessDiscovered = 'business.discovered',
  BusinessAudited = 'business.audited',
  AnalysisCompleted = 'analysis.completed'
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: WebhookEvent;
  payload: object;
  status: WebhookDeliveryStatus;
  statusCode?: number;
  responseBody?: string;
  error?: string;
  attemptCount: number;
  nextRetryAt?: string;
  createdAt: string;
  updatedAt: string;
}

export enum WebhookDeliveryStatus {
  Pending = 'pending',
  Success = 'success',
  Failed = 'failed',
  Retrying = 'retrying'
}

// Query parameter types
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface SortParams {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface FilterParams {
  [key: string]: string | string[] | number | boolean | undefined;
}

// Geographic query types
export interface GeographicQueryParams extends PaginationParams, SortParams {
  city?: string;
  region?: string;
  radius?: number;
  lat?: number;
  lng?: number;
  minScore?: number;
  maxScore?: number;
  category?: string;
}

// Category query types
export interface CategoryQueryParams extends PaginationParams, SortParams {
  category: string;
  city?: string;
  minBusinesses?: number;
  minScore?: number;
  includeImprovement?: boolean;
}

// Business query types
export interface BusinessQueryParams extends PaginationParams, SortParams {
  businessId?: string;
  category?: string;
  city?: string;
  hasWebsite?: boolean;
  minScore?: number;
  maxScore?: number;
}

// Report types
export interface ReportQuery extends PaginationParams, SortParams {
  reportType?: string;
  startDate?: string;
  endDate?: string;
  city?: string;
  category?: string;
  businessId?: string;
}

// Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
} 
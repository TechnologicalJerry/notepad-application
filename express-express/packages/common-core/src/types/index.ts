export interface UserPayload {
  id: string;
  email: string;
  name: string;
  roles?: string[];
  organizationId?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: number;
    details?: any;
  };
  meta?: {
    correlationId?: string;
    [key: string]: any;
  };
}

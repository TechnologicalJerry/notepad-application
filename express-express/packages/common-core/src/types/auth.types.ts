export interface UserPayload {
  _id: string;
  id?: string;
  email: string;
  name: string;
  session: string;
  iat?: number;
  exp?: number;
  roles?: string[];
  isVerified?: boolean;
  organizationId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
      requestId?: string;
    }
    interface Response {
      locals: {
        user?: UserPayload;
        requestId?: string;
        [key: string]: any;
      };
    }
  }
}

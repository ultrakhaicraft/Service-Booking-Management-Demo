// Matching backend LoginRequest
export interface LoginRequest {
  email: string;
  password: string;
}

// Matching backend MyAuthInfo
export interface MyAuthInfo {
  fullName: string;
  email: string;
  role: string;
  accountId: string;
}

// Matching backend LoginResponse (inherits MyAuthInfo)
export interface LoginResponse extends MyAuthInfo {
  accessToken: string;
}
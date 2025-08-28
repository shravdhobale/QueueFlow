import { apiRequest } from "./queryClient";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    businessId?: string;
  };
}

export class AuthAPI {
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiRequest("POST", "/api/auth/login", credentials);
    return response.json();
  }

  static async register(userData: any): Promise<AuthResponse> {
    const response = await apiRequest("POST", "/api/auth/register", userData);
    return response.json();
  }
}

export class QueueAPI {
  static async joinQueue(data: any) {
    const response = await apiRequest("POST", "/api/queue/join", data);
    return response.json();
  }

  static async getQueueStatus(id: string) {
    const response = await apiRequest("GET", `/api/queue/status/${id}`, undefined);
    return response.json();
  }

  static async serveCustomer(id: string) {
    const response = await apiRequest("PUT", `/api/queue/${id}/serve`, undefined);
    return response.json();
  }

  static async removeCustomer(id: string) {
    const response = await apiRequest("DELETE", `/api/queue/${id}`, undefined);
    return response.json();
  }
}

export class BusinessAPI {
  static async getAllBusinesses() {
    const response = await apiRequest("GET", "/api/businesses", undefined);
    return response.json();
  }

  static async getDashboard(businessId: string) {
    const response = await apiRequest("GET", `/api/dashboard/${businessId}`, undefined);
    return response.json();
  }
}

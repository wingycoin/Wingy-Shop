export interface WingyCoinUser {
  id: string;
  email: string;
  user_metadata?: {
    email: string;
    email_verified: boolean;
    phone_verified: boolean;
    sub: string;
  };
  // These fields might be in a different structure, but keeping for compatibility
  completedads?: number;
  discordid?: string;
  invitecode?: string;
  inviter_rewarded?: boolean;
  phoneverified?: string;
  successfullinvites?: number;
  wingy?: number;
}

export interface WingyCoinLoginResponse {
  user: WingyCoinUser;
}

export interface WingyCoinSignupResponse {
  userId: string;
  message?: string;
}

class WingyCoinApiService {
  private baseUrl = 'https://api.wingycoin.com';

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(errorData || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  async login(email: string, password: string): Promise<WingyCoinLoginResponse> {
    return await this.makeRequest<WingyCoinLoginResponse>('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async signup(email: string, password: string, username: string): Promise<WingyCoinSignupResponse> {
    return await this.makeRequest<WingyCoinSignupResponse>('/signup', {
      method: 'POST',
      body: JSON.stringify({ 
        email, 
        password, 
        username: username.toLowerCase() 
      }),
    });
  }

  async checkBalance(userId: string): Promise<{ wingy: number; completedads: number }> {
    return await this.makeRequest<{ wingy: number; completedads: number }>('/check-balance', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }
}

export const wingyCoinApi = new WingyCoinApiService();
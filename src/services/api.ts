/**
 * CivicMind AI Enterprise API Client (Module 1 Mockup)
 * Designed to act as a drop-in replacement once FastAPI endpoints are completed in Module 2.
 */

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // Debug logging to read unused variables for compiler compliance
    console.debug(`API endpoint call: ${API_BASE_URL}${endpoint}`, options);
    // const url = `${API_BASE_URL}${endpoint}`;
    // const headers = {
    //   'Content-Type': 'application/json',
    //   ...options.headers,
    // };

    try {
      // In Module 1, we simulate network request delay and return mock data for endpoints
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Standard Fetch logic (ready for backend)
      // const response = await fetch(url, { ...options, headers });
      // const data = await response.json();
      // return { data, error: null, status: response.status };

      return {
        data: null,
        error: 'Backend API offline (Module 1 Development). Simulated payload OK.',
        status: 200,
      };
    } catch (err: any) {
      return {
        data: null,
        error: err.message || 'Something went wrong',
        status: 500,
      };
    }
  }

  public async get<T>(endpoint: string, headers?: HeadersInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', headers });
  }

  public async post<T>(endpoint: string, body: any, headers?: HeadersInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
  }

  public async put<T>(endpoint: string, body: any, headers?: HeadersInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });
  }

  public async delete<T>(endpoint: string, headers?: HeadersInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE', headers });
  }
}

export const api = new ApiClient();
export default api;

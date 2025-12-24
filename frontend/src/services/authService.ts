import { api } from "@/lib/axios";
import { LoginResponse, SignupRequest } from "@/types/auth";
import { CheckUsernameResponse } from "@/types/auth";

export const authService = {
  checkUsername: async (username: string) => {
    const response = await api.get<CheckUsernameResponse>(
      `/api/users/check-username/?username=${username}`
    );
    return response.data;
  },

  register: async (signupData: SignupRequest) => {
    const response = await api.post("/api/users/signup/", signupData);
    return response.data;
  },

  login: async (username: string, password: string) => {
    const response = await api.post<LoginResponse>("/api/users/login/", {
      username,
      password,
    });
    if (response.data.access) {
      localStorage.setItem("accessToken", response.data.access);
    }
    if (response.data.refresh) {
      localStorage.setItem("refreshToken", response.data.refresh);
    }

    return response.data;
  },

  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  },
};

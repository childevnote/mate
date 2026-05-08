import {
  createAxiosInstance,
  createAuthService,
  createPostService,
  createUserService,
} from "@mate/api";
import { mobileStorage } from "./storage";

const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000";

/** Shared Axios instance configured with SecureStore */
export const api = createAxiosInstance(BASE_URL, mobileStorage);

/** Pre-configured service objects */
export const authService = createAuthService(api, mobileStorage);
export const postService = createPostService(api);
export const userService = createUserService(api);

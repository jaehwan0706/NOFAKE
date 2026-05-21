import { useEffect, useState } from "react";

const LOGIN_TOKEN_KEY = "nofakeAccessToken";
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) ?? "";

export type AuthUser = {
  name: string;
  email: string;
  phone_verified?: boolean;
};

let _user: AuthUser | null = null;

export function loginUser(user: AuthUser) {
  _user = user;
  window.dispatchEvent(new Event("auth-change"));
}

export function logoutUser() {
  _user = null;
  localStorage.removeItem(LOGIN_TOKEN_KEY);
  window.dispatchEvent(new Event("auth-change"));
}

export function useAuthUser() {
  const [user, setUser] = useState<AuthUser | null>(_user);

  useEffect(() => {
    const handleAuthSync = () => {
      setUser(_user ? { ..._user } : null);
    };
    handleAuthSync();
    window.addEventListener("auth-change", handleAuthSync);
    return () => window.removeEventListener("auth-change", handleAuthSync);
  }, []);

  return user;
}

(async () => {
  const token = localStorage.getItem(LOGIN_TOKEN_KEY);
  if (!token) {
    if (_user !== null) logoutUser();
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "69420",
      },
    });

    if (!res.ok) {
      logoutUser();
      return;
    }

    const data = (await res.json()) as {
      success: boolean;
      name?: string;
      email?: string;
      phone_verified?: boolean;
    };

    if (data.success && data.name) {
      loginUser({
        name: data.name,
        email: data.email ?? "",
        phone_verified: data.phone_verified,
      });
    } else {
      logoutUser();
    }
  } catch {
    // Network errors should not force logout while the user may be offline.
  }
})();

import { useEffect, useState } from "react";

const LOGIN_TOKEN_KEY = "nofakeAccessToken";
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) ?? "";

export type AuthUser = {
  name: string;
  email: string;
  phone_verified?: boolean;
  walletAddress?: string | null;
};

let _user: AuthUser | null = null;

// Ready immediately when there is no token to validate.
// When a token exists we must wait for the IIFE to settle before
// routing guards can make a trust-worthy decision.
let _authReady: boolean = !localStorage.getItem(LOGIN_TOKEN_KEY);

export function loginUser(user: AuthUser) {
  _user = user;
  window.dispatchEvent(new Event("auth-change"));
}

export function logoutUser() {
  _user = null;
  localStorage.removeItem(LOGIN_TOKEN_KEY);
  window.dispatchEvent(new Event("auth-change"));
}

function markAuthReady() {
  if (!_authReady) {
    _authReady = true;
    window.dispatchEvent(new Event("auth-ready"));
  }
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

/** Returns true once the initial token validation has finished (or when there is no token). */
export function useAuthReady() {
  const [ready, setReady] = useState<boolean>(_authReady);

  useEffect(() => {
    if (_authReady) {
      setReady(true);
      return;
    }
    const handleReady = () => setReady(true);
    window.addEventListener("auth-ready", handleReady);
    return () => window.removeEventListener("auth-ready", handleReady);
  }, []);

  return ready;
}

(async () => {
  const token = localStorage.getItem(LOGIN_TOKEN_KEY);
  if (!token) {
    if (_user !== null) logoutUser();
    return; // _authReady was already true (no token branch)
  }

  try {
    const commonHeaders = {
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "69420",
    };

    // Fetch auth identity and wallet profile in parallel to avoid a waterfall.
    const [authRes, profileRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/auth/me`, { headers: commonHeaders }),
      fetch(`${API_BASE_URL}/api/user/profile`, { headers: commonHeaders }),
    ]);

    if (!authRes.ok) {
      logoutUser();
      return;
    }

    const data = (await authRes.json()) as {
      success: boolean;
      name?: string;
      email?: string;
      phone_verified?: boolean;
    };

    if (data.success && data.name) {
      let walletAddress: string | null = null;
      if (profileRes.ok) {
        const profile = await profileRes.json().catch(() => null) as { walletAddress?: string | null } | null;
        walletAddress = profile?.walletAddress ?? null;
      }
      loginUser({
        name: data.name,
        email: data.email ?? "",
        phone_verified: data.phone_verified,
        walletAddress,
      });
    } else {
      logoutUser();
    }
  } catch {
    // Network errors should not force logout while the user may be offline.
  } finally {
    // Runs in every path (success, auth failure, network error, early return).
    markAuthReady();
  }
})();

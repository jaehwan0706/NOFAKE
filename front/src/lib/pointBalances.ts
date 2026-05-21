import { apiRequest } from "./api";

export interface PointBalances {
  nofake: number;
  nike: number;
  musinsa: number;
}

export async function fetchPointBalances(token: string | null): Promise<PointBalances> {
  if (!token) {
    throw new Error("로그인 토큰이 없습니다.");
  }

  const response = await apiRequest<{ success: boolean; data: PointBalances }>("/api/points/balance", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "69420",
    },
  });

  return response.data;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export interface LoginRequest {
  login: string;
  senha: string;
}

export interface MenuPermissao {
  menu: string;
  permissao: boolean;
  pai: string | null;
}

export interface UsuarioInfo {
  login: string;
  grupo: string | null;
  naoDispensa: boolean;
  nomeUnidade: string | null;
  codUnidadeSaude: number | null;
  permissoes: MenuPermissao[];
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  usuario: UsuarioInfo;
}

export interface ApiError {
  message: string;
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ login: data.login, senha: data.senha }),
  });

  if (!res.ok) {
    const err: ApiError = await res.json().catch(() => ({
      message: "Erro desconhecido ao realizar login.",
    }));
    throw new Error(err.message ?? "Falha na autenticação.");
  }

  return res.json() as Promise<LoginResponse>;
}

export async function logout(refreshToken: string): Promise<void> {
  await fetch(`${API_BASE_URL}/api/auth/logout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
}

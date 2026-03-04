"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [loginField, setLoginField] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await login({ login: loginField, senha });
      // Store only the short-lived access token in sessionStorage.
      // The refresh token is intentionally NOT stored in sessionStorage/localStorage
      // to reduce XSS exposure; production deployments should use httpOnly cookies
      // set directly by the API.
      sessionStorage.setItem("accessToken", response.accessToken);
      sessionStorage.setItem("usuario", JSON.stringify(response.usuario));
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Falha na autenticação.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
        {/* Logo / Title */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-blue-700 dark:text-blue-400">
            DispensaMed
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Sistema de Dispensação de Medicamentos
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div>
            <label
              htmlFor="login"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Usuário
            </label>
            <input
              id="login"
              type="text"
              autoComplete="username"
              value={loginField}
              onChange={(e) => setLoginField(e.target.value)}
              required
              disabled={loading}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                         px-4 py-2.5 text-sm shadow-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         disabled:opacity-50"
              placeholder="Digite seu usuário"
            />
          </div>

          <div>
            <label
              htmlFor="senha"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Senha
            </label>
            <input
              id="senha"
              type="password"
              autoComplete="current-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              disabled={loading}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                         px-4 py-2.5 text-sm shadow-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         disabled:opacity-50"
              placeholder="Digite sua senha"
            />
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700
                         text-red-700 dark:text-red-300 text-sm px-4 py-3"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !loginField || !senha}
            className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                       text-white font-semibold py-2.5 text-sm shadow
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors"
          >
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  );
}

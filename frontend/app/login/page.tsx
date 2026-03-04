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
  const [showPassword, setShowPassword] = useState(false);

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
    <main className="min-h-screen flex flex-col md:flex-row">
      {/* Left panel — branding */}
      <div
        className="relative flex flex-col items-center justify-center
                   md:w-3/5 min-h-[220px] md:min-h-screen
                   bg-gradient-to-br from-[#0f172a] via-[#1e40af] to-[#3b82f6]
                   overflow-hidden"
      >
        {/* Subtle dot pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative z-10 flex flex-col items-center text-center px-8 py-12">
          {/* Icon */}
          <div className="mb-6 flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur border border-white/20 shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-10 h-10 text-white"
            >
              <path d="M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.01.75.75 0 0 0 .42-.643 4.875 4.875 0 0 0-6.957-4.611 8.586 8.586 0 0 1 1.71 5.157v.003Z" />
            </svg>
          </div>

          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight leading-none">
            SEPIN
          </h1>
          <p className="mt-3 text-blue-200 text-base md:text-lg font-medium max-w-xs leading-snug">
            Sistema de Gestão de Informações de Saúde
          </p>

          {/* Decorative badges */}
          <div className="mt-10 flex flex-wrap gap-3 justify-center">
            {["Medicamentos", "Dispensação", "Controle de Estoque"].map((tag) => (
              <span
                key={tag}
                className="text-xs text-blue-200 border border-blue-400/40 bg-white/5 px-3 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Footer branding */}
        <div className="relative z-10 pb-6 text-blue-300/70 text-xs">
          © {new Date().getFullYear()} BKR Sistemas
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center bg-white dark:bg-slate-900 px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="md:hidden mb-8 text-center">
            <span className="text-2xl font-black text-blue-700">SEPIN</span>
            <p className="text-xs text-gray-500 mt-0.5">Sistema de Gestão de Informações de Saúde</p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Acesse sua conta</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Insira suas credenciais para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Login field */}
            <div>
              <label
                htmlFor="login"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Usuário
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
                  </svg>
                </span>
                <input
                  id="login"
                  type="text"
                  autoComplete="username"
                  value={loginField}
                  onChange={(e) => setLoginField(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full rounded-xl border border-gray-300 dark:border-slate-600
                             bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100
                             pl-10 pr-4 py-2.5 text-sm shadow-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                             disabled:opacity-50 transition-all duration-200"
                  placeholder="Digite seu usuário"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label
                htmlFor="senha"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Senha
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" />
                  </svg>
                </span>
                <input
                  id="senha"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full rounded-xl border border-gray-300 dark:border-slate-600
                             bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100
                             pl-10 pr-10 py-2.5 text-sm shadow-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                             disabled:opacity-50 transition-all duration-200"
                  placeholder="Digite sua senha"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 0 0-1.06 1.06l14.5 14.5a.75.75 0 1 0 1.06-1.06l-1.745-1.745a10.029 10.029 0 0 0 3.3-4.38 1.651 1.651 0 0 0 0-1.185A10.004 10.004 0 0 0 9.999 3a9.956 9.956 0 0 0-4.744 1.194L3.28 2.22ZM7.752 6.69l1.092 1.092a2.5 2.5 0 0 1 3.374 3.373l1.091 1.092a4 4 0 0 0-5.557-5.557Z" clipRule="evenodd" />
                      <path d="M10.748 13.93l2.523 2.523a9.987 9.987 0 0 1-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 0 1 0-1.186A10.007 10.007 0 0 1 2.839 6.02L6.07 9.252a4 4 0 0 0 4.678 4.678Z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                      <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41Z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-900/30
                           border border-red-200 dark:border-red-700
                           text-red-700 dark:text-red-300 text-sm px-4 py-3"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0">
                  <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !loginField || !senha}
              className="w-full rounded-xl
                         bg-gradient-to-r from-blue-700 to-blue-600
                         hover:from-blue-800 hover:to-blue-700
                         active:from-blue-900 active:to-blue-800
                         text-white font-semibold py-2.5 text-sm shadow
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all duration-200
                         flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Entrando…
                </>
              ) : (
                "Entrar"
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-gray-400 dark:text-gray-600">
            © {new Date().getFullYear()} BKR Sistemas · SEPIN v1.0
          </p>
        </div>
      </div>
    </main>
  );
}

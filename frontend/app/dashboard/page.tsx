"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function DashboardPage() {
  const [userName, setUserName] = useState<string>("Usuário");

  useEffect(() => {
    try {
      const u = JSON.parse(sessionStorage.getItem("usuario") ?? "{}");
      if (u?.login) setUserName(u.login);
    } catch {
      // ignore
    }
  }, []);

  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const stats = [
    {
      label: "Total de Medicamentos",
      value: "—",
      sub: "Cadastrados no sistema",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
          <path d="M4.077 9.508a6 6 0 1 1 8.486-8.485L4.076 9.508ZM5.493 11.077 11.077 5.493l3.43 3.43-5.584 5.584-3.43-3.43ZM6.923 12.507 15.492 3.938a6 6 0 0 1-8.57 8.569Z" />
        </svg>
      ),
    },
    {
      label: "Dispensações Hoje",
      value: "—",
      sub: "Registradas no dia",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
          <path d="M2 3a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H2Z" />
          <path fillRule="evenodd" d="M2 7.5h16l-.811 7.71a2 2 0 0 1-1.99 1.79H4.802a2 2 0 0 1-1.99-1.79L2 7.5ZM7 11a1 1 0 0 1 1-1h4a1 1 0 1 1 0 2H8a1 1 0 0 1-1-1Z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      label: "Estoque Baixo",
      value: "—",
      sub: "Itens abaixo do mínimo",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
          <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      label: "Beneficiados Atendidos",
      value: "—",
      sub: "No mês atual",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
          <path d="M7 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM14.5 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM1.615 16.428a1.224 1.224 0 0 1-.569-1.175 6.002 6.002 0 0 1 11.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 0 1 7 18a9.953 9.953 0 0 1-5.385-1.572ZM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 0 0-1.588-3.755 4.502 4.502 0 0 1 5.874 2.636.818.818 0 0 1-.36.98A7.465 7.465 0 0 1 14.5 16Z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Bem-vindo(a), <span className="text-blue-700">{userName}</span>!
        </h1>
        <p className="text-sm text-gray-500 mt-1 capitalize">{today}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm
                       hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl ${s.iconBg} flex items-center justify-center ${s.iconColor}`}>
                {s.icon}
              </div>
            </div>
            <div className="text-3xl font-extrabold text-gray-900 mb-1">{s.value}</div>
            <div className="text-sm font-medium text-gray-700">{s.label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Quick access */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-blue-600">
              <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-11.25a.75.75 0 0 0-1.5 0v2.5h-2.5a.75.75 0 0 0 0 1.5h2.5v2.5a.75.75 0 0 0 1.5 0v-2.5h2.5a.75.75 0 0 0 0-1.5h-2.5v-2.5Z" clipRule="evenodd" />
            </svg>
            Acesso Rápido
          </h2>
          <div className="space-y-2">
            <Link
              href="/dashboard/medicamentos"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-200 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path d="M4.077 9.508a6 6 0 1 1 8.486-8.485L4.076 9.508ZM5.493 11.077 11.077 5.493l3.43 3.43-5.584 5.584-3.43-3.43ZM6.923 12.507 15.492 3.938a6 6 0 0 1-8.57 8.569Z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-800 group-hover:text-blue-700 text-sm">Medicamentos</div>
                <div className="text-xs text-gray-500">Cadastro e consulta de medicamentos</div>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors">
                <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
              </svg>
            </Link>

            {[
              { label: "Dispensação", desc: "Registrar dispensações de medicamentos" },
              { label: "Beneficiados", desc: "Gerenciar beneficiados cadastrados" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 p-3 rounded-lg border border-transparent opacity-50 cursor-not-allowed"
              >
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-600 text-sm">{item.label}</div>
                  <div className="text-xs text-gray-400">{item.desc}</div>
                </div>
                <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">Em breve</span>
              </div>
            ))}
          </div>
        </div>

        {/* System info */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-blue-600">
              <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clipRule="evenodd" />
            </svg>
            Informações do Sistema
          </h2>
          <dl className="space-y-3">
            {[
              { label: "Sistema", value: "SEPIN v1.0" },
              { label: "Módulo", value: "Gestão de Informações de Saúde" },
              { label: "Banco de Dados", value: "Firebird" },
              { label: "Data", value: new Date().toLocaleDateString("pt-BR") },
              { label: "Fornecedor", value: "BKR Sistemas" },
            ].map((row) => (
              <div key={row.label} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
                <dt className="text-sm text-gray-500">{row.label}</dt>
                <dd className="text-sm font-medium text-gray-800">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}

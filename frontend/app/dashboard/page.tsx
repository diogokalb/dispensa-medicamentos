"use client";

export default function DashboardPage() {
  const cards = [
    { label: "Medicamentos Cadastrados", value: "—", icon: "💊", color: "bg-blue-50 border-blue-200" },
    { label: "Dispensações do Dia", value: "—", icon: "📦", color: "bg-green-50 border-green-200" },
    { label: "Estoque Baixo", value: "—", icon: "⚠️", color: "bg-yellow-50 border-yellow-200" },
    { label: "Último Acesso", value: new Date().toLocaleDateString("pt-BR"), icon: "🕐", color: "bg-purple-50 border-purple-200" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Dashboard</h1>
      <p className="text-gray-500 mb-8">Bem-vindo ao Sistema de Dispensação de Medicamentos</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {cards.map((c) => (
          <div key={c.label} className={`rounded-xl border p-6 ${c.color}`}>
            <div className="text-3xl mb-3">{c.icon}</div>
            <div className="text-2xl font-bold text-gray-800 mb-1">{c.value}</div>
            <div className="text-sm text-gray-600">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Acesso Rápido</h2>
          <div className="space-y-3">
            <a
              href="/dashboard/medicamentos"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors group"
            >
              <span className="text-2xl">💊</span>
              <div>
                <div className="font-medium text-gray-800 group-hover:text-blue-700">Medicamentos</div>
                <div className="text-xs text-gray-500">Cadastro e consulta de medicamentos</div>
              </div>
              <span className="ml-auto text-gray-400">→</span>
            </a>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Informações do Sistema</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Sistema</dt>
              <dd className="font-medium text-gray-800">S.I.B. v1.0</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Banco de Dados</dt>
              <dd className="font-medium text-gray-800">Firebird</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Data</dt>
              <dd className="font-medium text-gray-800">{new Date().toLocaleDateString("pt-BR")}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}

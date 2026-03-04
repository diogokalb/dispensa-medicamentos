"use client";

import { useEffect, useState, useCallback } from "react";
import {
  produtosApi, gruposApi,
  type ProdutoListItem, type ProdutoDto, type ProdutoSaveDto,
  type GrupoProdutoDto, type LoteDto, type ProdutoBarrasDto,
  type ProdutoComponenteDto, type EstoqueProdutoDto,
} from "@/lib/api";

// ─── Types ─────────────────────────────────────────────────────────────────

type Tab = "geral" | "estoque" | "lotes" | "barras" | "componentes";

const TABS: { id: Tab; label: string }[] = [
  { id: "geral", label: "Geral" },
  { id: "estoque", label: "Estoque" },
  { id: "lotes", label: "Lotes" },
  { id: "barras", label: "Cód. de Barras" },
  { id: "componentes", label: "Componentes" },
];

// ─── Helpers ───────────────────────────────────────────────────────────────

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleDateString("pt-BR"); } catch { return iso; }
}

function fmtNum(n: number | null | undefined): string {
  if (n == null) return "—";
  return n.toLocaleString("pt-BR");
}

// ─── Empty form state ──────────────────────────────────────────────────────

function emptyForm(): ProdutoSaveDto {
  return {
    codCompras: null, descricao: null, descricaoAbreviada: null,
    un: null, codGrupo: null, duracao: null, estoqueMinimo: null,
    estoqueMaximo: null, qtdCodBarras: null, preco: null, obs: null,
    nomeGenerico: null, laboratorio: null, codigoHorus: null,
    horusTipo: null, dcb: null, apresentacao: null, lista: null,
    listaBasica: "N", custoMedio: null, ultimoCusto: null,
    qtdTotal: null, dataDesativado: null,
  };
}

// ─── Input helpers ─────────────────────────────────────────────────────────

function strVal(v: string | null | undefined): string { return v ?? ""; }
function numVal(v: number | null | undefined): string { return v != null ? String(v) : ""; }
function setStr(setter: (v: ProdutoSaveDto) => void, form: ProdutoSaveDto, field: keyof ProdutoSaveDto, val: string) {
  setter({ ...form, [field]: val === "" ? null : val });
}
function setNum(setter: (v: ProdutoSaveDto) => void, form: ProdutoSaveDto, field: keyof ProdutoSaveDto, val: string) {
  setter({ ...form, [field]: val === "" ? null : Number(val) });
}

// ─── Constants ─────────────────────────────────────────────────────────────

const LOW_STOCK_THRESHOLD = 10;

// ─── Main component ────────────────────────────────────────────────────────

export default function MedicamentosPage() {
  // List state
  const [items, setItems] = useState<ProdutoListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const PAGE_SIZE = 20;

  // Form state
  const [view, setView] = useState<"list" | "form">("list");
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<ProdutoSaveDto>(emptyForm());
  const [tab, setTab] = useState<Tab>("geral");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Detail data
  const [grupos, setGrupos] = useState<GrupoProdutoDto[]>([]);
  const [lotes, setLotes] = useState<LoteDto[]>([]);
  const [barras, setBarras] = useState<ProdutoBarrasDto[]>([]);
  const [componentes, setComponentes] = useState<ProdutoComponenteDto[]>([]);
  const [estoque, setEstoque] = useState<EstoqueProdutoDto[]>([]);

  // Load list
  const loadList = useCallback(async () => {
    setListLoading(true);
    setListError(null);
    try {
      const res = await produtosApi.list(search || undefined, page, PAGE_SIZE);
      setItems(res.items);
      setTotal(res.total);
    } catch (e: unknown) {
      setListError(e instanceof Error ? e.message : "Erro ao carregar lista.");
    } finally {
      setListLoading(false);
    }
  }, [search, page]);

  useEffect(() => { if (view === "list") loadList(); }, [loadList, view]);

  // Load grupos once
  useEffect(() => {
    gruposApi.list().then(setGrupos).catch(() => {});
  }, []);

  // Open new form
  function handleNew() {
    setEditId(null);
    setForm(emptyForm());
    setTab("geral");
    setFormError(null);
    setFormSuccess(null);
    setLotes([]); setBarras([]); setComponentes([]); setEstoque([]);
    setView("form");
  }

  // Open edit form
  async function handleEdit(id: number) {
    setEditId(id);
    setTab("geral");
    setFormError(null);
    setFormSuccess(null);
    setView("form");
    try {
      const p: ProdutoDto = await produtosApi.get(id);
      setForm({
        codCompras: p.codCompras, descricao: p.descricao,
        descricaoAbreviada: p.descricaoAbreviada, un: p.un, codGrupo: p.codGrupo,
        duracao: p.duracao, estoqueMinimo: p.estoqueMinimo, estoqueMaximo: p.estoqueMaximo,
        qtdCodBarras: p.qtdCodBarras, preco: p.preco, obs: p.obs,
        nomeGenerico: p.nomeGenerico, laboratorio: p.laboratorio,
        codigoHorus: p.codigoHorus, horusTipo: p.horusTipo, dcb: p.dcb,
        apresentacao: p.apresentacao, lista: p.lista, listaBasica: p.listaBasica,
        custoMedio: p.custoMedio, ultimoCusto: p.ultimoCusto, qtdTotal: p.qtdTotal,
        dataDesativado: p.dataDesativado,
      });
      // Load all tabs data in parallel
      const [l, b, c, e] = await Promise.all([
        produtosApi.lotes(id), produtosApi.barras(id),
        produtosApi.componentes(id), produtosApi.estoque(id),
      ]);
      setLotes(l); setBarras(b); setComponentes(c); setEstoque(e);
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : "Erro ao carregar produto.");
    }
  }

  // Save
  async function handleSave() {
    if (!form.descricao?.trim()) {
      setFormError("Descrição é obrigatória."); return;
    }
    setSaving(true); setFormError(null); setFormSuccess(null);
    try {
      if (editId) {
        await produtosApi.update(editId, form);
        setFormSuccess("Produto atualizado com sucesso.");
      } else {
        const res = await produtosApi.create(form);
        setFormSuccess("Produto criado com sucesso.");
        setEditId(res.id);
      }
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  // Delete
  async function handleDelete() {
    if (!editId) return;
    if (!confirm("Confirma exclusão deste produto?")) return;
    setSaving(true); setFormError(null);
    try {
      await produtosApi.delete(editId);
      setView("list");
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : "Erro ao excluir.");
    } finally {
      setSaving(false);
    }
  }

  // ─── List view ──────────────────────────────────────────────────────────

  if (view === "list") {
    const totalPages = Math.ceil(total / PAGE_SIZE);
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Medicamentos</h1>
            <p className="text-sm text-gray-500 mt-1">Cadastro de medicamentos e produtos</p>
          </div>
          <button
            onClick={handleNew}
            className="flex items-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-11.25a.75.75 0 0 0-1.5 0v2.5h-2.5a.75.75 0 0 0 0 1.5h2.5v2.5a.75.75 0 0 0 1.5 0v-2.5h2.5a.75.75 0 0 0 0-1.5h-2.5v-2.5Z" clipRule="evenodd" />
            </svg>
            Novo Medicamento
          </button>
        </div>

        {/* Search */}
        <div className="mb-4 relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Buscar por descrição…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full sm:w-80 rounded-xl border border-gray-300 pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Error */}
        {listError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{listError}</div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#1e3a5f]">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-white">Código</th>
                  <th className="text-left px-4 py-3 font-semibold text-white">Descrição</th>
                  <th className="text-left px-4 py-3 font-semibold text-white">Un.</th>
                  <th className="text-left px-4 py-3 font-semibold text-white hidden md:table-cell">Grupo</th>
                  <th className="text-right px-4 py-3 font-semibold text-white hidden lg:table-cell">Estoque</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {listLoading ? (
                  <tr><td colSpan={5} className="text-center py-12 text-gray-400">Carregando…</td></tr>
                ) : items.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-12 text-gray-400">Nenhum produto encontrado.</td></tr>
                ) : items.map((item, idx) => (
                  <tr
                    key={item.codigo}
                    onClick={() => handleEdit(item.codigo)}
                    className={`hover:bg-blue-50 cursor-pointer transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
                  >
                    <td className="px-4 py-3 font-mono text-gray-500 text-xs">{item.codigo}</td>
                    <td className="px-4 py-3 font-medium text-gray-800 max-w-xs truncate">{item.descricao ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{item.un ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{item.nomeGrupo ?? "—"}</td>
                    <td className="px-4 py-3 text-right hidden lg:table-cell">
                      {item.estoqueTotal != null ? (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          item.estoqueTotal <= 0
                            ? "bg-red-100 text-red-700"
                            : item.estoqueTotal <= LOW_STOCK_THRESHOLD
                            ? "bg-amber-100 text-amber-700"
                            : "bg-green-100 text-green-700"
                        }`}>
                          {fmtNum(item.estoqueTotal)}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm">
              <span className="text-gray-500">Total: {total} produtos</span>
              <div className="flex gap-1.5">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-50 transition-colors text-xs font-medium"
                >← Anterior</button>
                <span className="px-3 py-1.5 text-xs text-gray-600">{page} / {totalPages}</span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-50 transition-colors text-xs font-medium"
                >Próxima →</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Form view ──────────────────────────────────────────────────────────

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView("list")}
            className="text-gray-500 hover:text-gray-800 transition-colors"
          >
            ← Voltar
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            {editId ? `Editando #${editId}` : "Novo Medicamento"}
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleNew}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
          >Novo</button>
          {editId && (
            <button
              onClick={handleDelete}
              disabled={saving}
              className="px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >Excluir</button>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
          >{saving ? "Salvando…" : "Gravar"}</button>
        </div>
      </div>

      {/* Alerts */}
      {formError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{formError}</div>
      )}
      {formSuccess && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">{formSuccess}</div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex overflow-x-auto border-b border-gray-200">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors
                ${tab === t.id
                  ? "border-b-2 border-blue-600 text-blue-700"
                  : "text-gray-500 hover:text-gray-700"
                }`}
            >{t.label}</button>
          ))}
        </div>

        <div className="p-6">
          {tab === "geral" && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {editId && (
                <Field label="Código">
                  <input readOnly value={editId} className="input bg-gray-50" />
                </Field>
              )}

              <Field label="Descrição *" className="md:col-span-2">
                <input
                  value={strVal(form.descricao)}
                  onChange={e => setStr(setForm, form, "descricao", e.target.value)}
                  className="input"
                  placeholder="Nome do medicamento"
                />
              </Field>

              <Field label="Descrição Abreviada">
                <input
                  value={strVal(form.descricaoAbreviada)}
                  onChange={e => setStr(setForm, form, "descricaoAbreviada", e.target.value)}
                  className="input"
                />
              </Field>

              <Field label="Unidade (UN)">
                <input
                  value={strVal(form.un)}
                  onChange={e => setStr(setForm, form, "un", e.target.value)}
                  className="input"
                  placeholder="CP, ML, FR…"
                />
              </Field>

              <Field label="Grupo">
                <select
                  value={form.codGrupo ?? ""}
                  onChange={e => setForm({ ...form, codGrupo: e.target.value ? Number(e.target.value) : null })}
                  className="input"
                >
                  <option value="">— Selecionar —</option>
                  {grupos.map(g => (
                    <option key={g.codigo} value={g.codigo}>{g.descricao}</option>
                  ))}
                </select>
              </Field>

              <Field label="Nome Genérico" className="md:col-span-2">
                <input
                  value={strVal(form.nomeGenerico)}
                  onChange={e => setStr(setForm, form, "nomeGenerico", e.target.value)}
                  className="input"
                />
              </Field>

              <Field label="Laboratório">
                <input
                  value={strVal(form.laboratorio)}
                  onChange={e => setStr(setForm, form, "laboratorio", e.target.value)}
                  className="input"
                />
              </Field>

              <Field label="Apresentação" className="md:col-span-2">
                <input
                  value={strVal(form.apresentacao)}
                  onChange={e => setStr(setForm, form, "apresentacao", e.target.value)}
                  className="input"
                />
              </Field>

              <Field label="Lista Controlada">
                <input
                  value={strVal(form.lista)}
                  onChange={e => setStr(setForm, form, "lista", e.target.value)}
                  className="input"
                />
              </Field>

              <Field label="Lista Básica">
                <select
                  value={form.listaBasica ?? "N"}
                  onChange={e => setForm({ ...form, listaBasica: e.target.value })}
                  className="input"
                >
                  <option value="S">Sim</option>
                  <option value="N">Não</option>
                </select>
              </Field>

              <Field label="Código Horus">
                <input
                  value={strVal(form.codigoHorus)}
                  onChange={e => setStr(setForm, form, "codigoHorus", e.target.value)}
                  className="input"
                />
              </Field>

              <Field label="Tipo Horus">
                <select
                  value={form.horusTipo ?? ""}
                  onChange={e => setForm({ ...form, horusTipo: e.target.value || null })}
                  className="input"
                >
                  <option value="">—</option>
                  <option value="B">B – Básico</option>
                  <option value="E">E – Especializado</option>
                </select>
              </Field>

              <Field label="DCB">
                <input
                  value={strVal(form.dcb)}
                  onChange={e => setStr(setForm, form, "dcb", e.target.value)}
                  className="input"
                />
              </Field>

              <Field label="Duração (dias)">
                <input
                  type="number"
                  value={strVal(form.duracao)}
                  onChange={e => setStr(setForm, form, "duracao", e.target.value)}
                  className="input"
                />
              </Field>

              <Field label="Estoque Mínimo">
                <input
                  type="number"
                  value={numVal(form.estoqueMinimo)}
                  onChange={e => setNum(setForm, form, "estoqueMinimo", e.target.value)}
                  className="input"
                />
              </Field>

              <Field label="Estoque Máximo">
                <input
                  type="number"
                  value={numVal(form.estoqueMaximo)}
                  onChange={e => setNum(setForm, form, "estoqueMaximo", e.target.value)}
                  className="input"
                />
              </Field>

              <Field label="Preço">
                <input
                  type="number"
                  step="0.01"
                  value={numVal(form.preco)}
                  onChange={e => setNum(setForm, form, "preco", e.target.value)}
                  className="input"
                />
              </Field>

              <Field label="Qtd Cód. de Barras">
                <input
                  type="number"
                  value={numVal(form.qtdCodBarras)}
                  onChange={e => setNum(setForm, form, "qtdCodBarras", e.target.value)}
                  className="input"
                />
              </Field>

              <Field label="Código Compras">
                <input
                  type="number"
                  value={numVal(form.codCompras)}
                  onChange={e => setNum(setForm, form, "codCompras", e.target.value)}
                  className="input"
                />
              </Field>

              <Field label="Observação" className="md:col-span-3">
                <textarea
                  rows={2}
                  value={strVal(form.obs)}
                  onChange={e => setStr(setForm, form, "obs", e.target.value)}
                  className="input"
                />
              </Field>
            </div>
          )}

          {tab === "estoque" && (
            <div>
              {estoque.length === 0 ? (
                <p className="text-gray-500 text-sm">Nenhum registro de estoque encontrado.</p>
              ) : (
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-[#1e3a5f]">
                      <th className="text-left px-4 py-2 font-semibold text-white">Unidade</th>
                      <th className="text-right px-4 py-2 font-semibold text-white">Quantidade</th>
                      <th className="text-right px-4 py-2 font-semibold text-white">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {estoque.map((e, i) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                        <td className="px-4 py-2 text-gray-700">{e.codUnidade}</td>
                        <td className="px-4 py-2 text-right text-gray-700">{fmtNum(e.quantidade)}</td>
                        <td className="px-4 py-2 text-right text-gray-700">{fmtNum(e.valor)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {tab === "lotes" && (
            <div>
              {lotes.length === 0 ? (
                <p className="text-gray-500 text-sm">Nenhum lote encontrado.</p>
              ) : (
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-[#1e3a5f]">
                      <th className="text-left px-4 py-2 font-semibold text-white">Lote</th>
                      <th className="text-left px-4 py-2 font-semibold text-white">Validade</th>
                      <th className="text-left px-4 py-2 font-semibold text-white">Status</th>
                      <th className="text-left px-4 py-2 font-semibold text-white">Fabricante</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {lotes.map((l, i) => {
                      const isAtivo = l.ativo?.toUpperCase() === "SIM" || l.ativo === "S";
                      return (
                        <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                          <td className="px-4 py-2 font-medium text-blue-700">{l.loteNum ?? "—"}</td>
                          <td className="px-4 py-2 text-gray-700">{fmtDate(l.dtValidade)}</td>
                          <td className="px-4 py-2">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                              isAtivo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            }`}>
                              {isAtivo ? "Ativo" : "Inativo"}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-gray-600">{l.nomeFabricante ?? "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {tab === "barras" && (
            <div>
              {barras.length === 0 ? (
                <p className="text-gray-500 text-sm">Nenhum código de barras encontrado.</p>
              ) : (
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-[#1e3a5f]">
                      <th className="text-left px-4 py-2 font-semibold text-white">Código de Barras</th>
                      <th className="text-left px-4 py-2 font-semibold text-white">Fabricante</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {barras.map((b, i) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                        <td className="px-4 py-2 font-mono text-blue-700">{b.codigoBarras ?? "—"}</td>
                        <td className="px-4 py-2 text-gray-600">{b.nomeFabricante ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {tab === "componentes" && (
            <div>
              {componentes.length === 0 ? (
                <p className="text-gray-500 text-sm">Nenhum componente encontrado.</p>
              ) : (
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-[#1e3a5f]">
                      <th className="text-left px-4 py-2 font-semibold text-white">Componente</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {componentes.map((c, i) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                        <td className="px-4 py-2 text-gray-700">{c.nomeComponente ?? c.componente ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Field component ───────────────────────────────────────────────────────

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {children}
    </div>
  );
}

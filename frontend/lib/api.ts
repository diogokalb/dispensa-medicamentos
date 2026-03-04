const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("accessToken");
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  };

  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      sessionStorage.clear();
      window.location.href = "/login";
    }
    throw new Error("Sessão expirada.");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Erro desconhecido." }));
    throw new Error((err as { message?: string }).message ?? "Erro na requisição.");
  }

  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

export interface ProdutoListItem {
  codigo: number;
  descricao: string | null;
  un: string | null;
  nomeGrupo: string | null;
  estoqueTotal: number | null;
}

export interface ProdutoListResponse {
  items: ProdutoListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ProdutoDto {
  codigo: number;
  codCompras: number | null;
  descricao: string | null;
  descricaoAbreviada: string | null;
  un: string | null;
  codGrupo: number | null;
  nomeGrupo: string | null;
  duracao: string | null;
  estoqueMinimo: number | null;
  estoqueMaximo: number | null;
  qtdCodBarras: number | null;
  preco: number | null;
  obs: string | null;
  nomeGenerico: string | null;
  laboratorio: string | null;
  codigoHorus: string | null;
  horusTipo: string | null;
  dcb: string | null;
  apresentacao: string | null;
  lista: string | null;
  listaBasica: string | null;
  custoMedio: number | null;
  ultimoCusto: number | null;
  qtdTotal: number | null;
  dataDesativado: string | null;
}

export interface ProdutoSaveDto {
  codCompras?: number | null;
  descricao?: string | null;
  descricaoAbreviada?: string | null;
  un?: string | null;
  codGrupo?: number | null;
  duracao?: string | null;
  estoqueMinimo?: number | null;
  estoqueMaximo?: number | null;
  qtdCodBarras?: number | null;
  preco?: number | null;
  obs?: string | null;
  nomeGenerico?: string | null;
  laboratorio?: string | null;
  codigoHorus?: string | null;
  horusTipo?: string | null;
  dcb?: string | null;
  apresentacao?: string | null;
  lista?: string | null;
  listaBasica?: string | null;
  custoMedio?: number | null;
  ultimoCusto?: number | null;
  qtdTotal?: number | null;
  dataDesativado?: string | null;
}

export interface GrupoProdutoDto {
  codigo: number;
  descricao: string | null;
}

export interface LoteDto {
  codProduto: number;
  loteNum: string | null;
  dtValidade: string | null;
  ativo: string | null;
  codFabricante: number | null;
  nomeFabricante: string | null;
}

export interface ProdutoBarrasDto {
  produto: number;
  codigoBarras: string | null;
  fabricante: number | null;
  nomeFabricante: string | null;
}

export interface ProdutoComponenteDto {
  produto: number;
  componente: number | null;
  nomeComponente: string | null;
}

export interface EstoqueProdutoDto {
  codUnidade: number;
  codProduto: number;
  quantidade: number | null;
  valor: number | null;
}

export const produtosApi = {
  list: (search?: string, page = 1, pageSize = 20) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    return apiFetch<ProdutoListResponse>(`/api/produtos?${params}`);
  },
  get: (id: number) => apiFetch<ProdutoDto>(`/api/produtos/${id}`),
  create: (dto: ProdutoSaveDto) =>
    apiFetch<{ id: number }>("/api/produtos", { method: "POST", body: JSON.stringify(dto) }),
  update: (id: number, dto: ProdutoSaveDto) =>
    apiFetch<void>(`/api/produtos/${id}`, { method: "PUT", body: JSON.stringify(dto) }),
  delete: (id: number) =>
    apiFetch<void>(`/api/produtos/${id}`, { method: "DELETE" }),
  lotes: (id: number) => apiFetch<LoteDto[]>(`/api/produtos/${id}/lotes`),
  barras: (id: number) => apiFetch<ProdutoBarrasDto[]>(`/api/produtos/${id}/barras`),
  componentes: (id: number) => apiFetch<ProdutoComponenteDto[]>(`/api/produtos/${id}/componentes`),
  estoque: (id: number) => apiFetch<EstoqueProdutoDto[]>(`/api/produtos/${id}/estoque`),
};

export const gruposApi = {
  list: () => apiFetch<GrupoProdutoDto[]>("/api/grupos-produtos"),
};

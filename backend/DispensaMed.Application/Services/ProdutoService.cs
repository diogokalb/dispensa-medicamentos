using DispensaMed.Application.DTOs;
using DispensaMed.Application.Interfaces;
using DispensaMed.Domain.Entities;
using DispensaMed.Domain.Interfaces;

namespace DispensaMed.Application.Services;

public class ProdutoService : IProdutoService
{
    private readonly IProdutoRepository _repo;
    private readonly IGrupoProdutoRepository _grupoRepo;

    public ProdutoService(IProdutoRepository repo, IGrupoProdutoRepository grupoRepo)
    {
        _repo = repo;
        _grupoRepo = grupoRepo;
    }

    public async Task<(IEnumerable<ProdutoListDto> Items, int Total)> GetAllAsync(
        string? search, int page, int pageSize)
    {
        var (produtos, total) = await _repo.GetAllAsync(search, page, pageSize);
        var grupos = (await _grupoRepo.GetAllAsync()).ToDictionary(g => g.Codigo, g => g.Descricao);

        var items = produtos.Select(p => new ProdutoListDto
        {
            Codigo = p.Codigo,
            Descricao = p.Descricao,
            Un = p.Un,
            NomeGrupo = p.CodGrupo.HasValue && grupos.TryGetValue(p.CodGrupo.Value, out var g) ? g : null,
            EstoqueTotal = p.QtdTotal
        });

        return (items, total);
    }

    public async Task<ProdutoDto?> GetByIdAsync(long id)
    {
        var p = await _repo.GetByIdAsync(id);
        if (p is null) return null;

        GrupoProduto? grupo = null;
        if (p.CodGrupo.HasValue)
            grupo = await _grupoRepo.GetByIdAsync(p.CodGrupo.Value);

        return MapToDto(p, grupo?.Descricao);
    }

    public async Task<long> CreateAsync(ProdutoCreateDto dto)
    {
        var produto = MapFromCreateDto(dto);
        return await _repo.CreateAsync(produto);
    }

    public async Task UpdateAsync(long id, ProdutoUpdateDto dto)
    {
        var produto = MapFromUpdateDto(id, dto);
        await _repo.UpdateAsync(produto);
    }

    public async Task<bool> DeleteAsync(long id)
    {
        var estoque = await _repo.GetEstoqueAsync(id);
        if (estoque.Any(e => e.Quantidade > 0))
            return false;

        await _repo.DeleteAsync(id);
        return true;
    }

    public async Task<IEnumerable<EstoqueProdutoDto>> GetEstoqueAsync(long id)
    {
        var items = await _repo.GetEstoqueAsync(id);
        return items.Select(e => new EstoqueProdutoDto
        {
            CodUnidade = e.CodUnidade,
            CodProduto = e.CodProduto,
            Quantidade = e.Quantidade,
            Valor = e.Valor
        });
    }

    public async Task<IEnumerable<LoteDto>> GetLotesAsync(long id)
    {
        var items = await _repo.GetLotesAsync(id);
        return items.Select(l => new LoteDto
        {
            CodProduto = l.CodProduto,
            LoteNum = l.LoteNum,
            DtValidade = l.DtValidade,
            Ativo = l.Ativo,
            CodFabricante = l.CodFabricante,
            NomeFabricante = l.NomeFabricante
        });
    }

    public async Task<IEnumerable<ProdutoBarrasDto>> GetBarrasAsync(long id)
    {
        var items = await _repo.GetBarrasAsync(id);
        return items.Select(b => new ProdutoBarrasDto
        {
            Produto = b.Produto,
            CodigoBarras = b.CodigoBarras,
            Fabricante = b.Fabricante,
            NomeFabricante = b.NomeFabricante
        });
    }

    public async Task<IEnumerable<ProdutoComponenteDto>> GetComponentesAsync(long id)
    {
        var items = await _repo.GetComponentesAsync(id);
        return items.Select(c => new ProdutoComponenteDto
        {
            Produto = c.Produto,
            Componente = c.Componente,
            NomeComponente = c.NomeComponente
        });
    }

    private static ProdutoDto MapToDto(Produto p, string? nomeGrupo) => new()
    {
        Codigo = p.Codigo,
        CodCompras = p.CodCompras,
        Descricao = p.Descricao,
        DescricaoAbreviada = p.DescricaoAbreviada,
        Un = p.Un,
        CodGrupo = p.CodGrupo,
        NomeGrupo = nomeGrupo,
        Duracao = p.Duracao,
        EstoqueMinimo = p.EstoqueMinimo,
        EstoqueMaximo = p.EstoqueMaximo,
        QtdCodBarras = p.QtdCodBarras,
        Preco = p.Preco,
        Obs = p.Obs,
        NomeGenerico = p.NomeGenerico,
        Laboratorio = p.Laboratorio,
        CodigoHorus = p.CodigoHorus,
        HorusTipo = p.HorusTipo,
        DCB = p.DCB,
        Apresentacao = p.Apresentacao,
        Lista = p.Lista,
        ListaBasica = p.ListaBasica,
        CustoMedio = p.CustoMedio,
        UltimoCusto = p.UltimoCusto,
        QtdTotal = p.QtdTotal,
        DataDesativado = p.DataDesativado
    };

    private static Produto MapFromCreateDto(ProdutoCreateDto dto) => new()
    {
        CodCompras = dto.CodCompras,
        Descricao = dto.Descricao,
        DescricaoAbreviada = dto.DescricaoAbreviada,
        Un = dto.Un,
        CodGrupo = dto.CodGrupo,
        Duracao = dto.Duracao,
        EstoqueMinimo = dto.EstoqueMinimo,
        EstoqueMaximo = dto.EstoqueMaximo,
        QtdCodBarras = dto.QtdCodBarras,
        Preco = dto.Preco,
        Obs = dto.Obs,
        NomeGenerico = dto.NomeGenerico,
        Laboratorio = dto.Laboratorio,
        CodigoHorus = dto.CodigoHorus,
        HorusTipo = dto.HorusTipo,
        DCB = dto.DCB,
        Apresentacao = dto.Apresentacao,
        Lista = dto.Lista,
        ListaBasica = dto.ListaBasica
    };

    private static Produto MapFromUpdateDto(long id, ProdutoUpdateDto dto) => new()
    {
        Codigo = id,
        CodCompras = dto.CodCompras,
        Descricao = dto.Descricao,
        DescricaoAbreviada = dto.DescricaoAbreviada,
        Un = dto.Un,
        CodGrupo = dto.CodGrupo,
        Duracao = dto.Duracao,
        EstoqueMinimo = dto.EstoqueMinimo,
        EstoqueMaximo = dto.EstoqueMaximo,
        QtdCodBarras = dto.QtdCodBarras,
        Preco = dto.Preco,
        Obs = dto.Obs,
        NomeGenerico = dto.NomeGenerico,
        Laboratorio = dto.Laboratorio,
        CodigoHorus = dto.CodigoHorus,
        HorusTipo = dto.HorusTipo,
        DCB = dto.DCB,
        Apresentacao = dto.Apresentacao,
        Lista = dto.Lista,
        ListaBasica = dto.ListaBasica,
        CustoMedio = dto.CustoMedio,
        UltimoCusto = dto.UltimoCusto,
        QtdTotal = dto.QtdTotal,
        DataDesativado = dto.DataDesativado
    };
}

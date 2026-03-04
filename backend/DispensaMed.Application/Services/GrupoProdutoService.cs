using DispensaMed.Application.DTOs;
using DispensaMed.Application.Interfaces;
using DispensaMed.Domain.Interfaces;

namespace DispensaMed.Application.Services;

public class GrupoProdutoService : IGrupoProdutoService
{
    private readonly IGrupoProdutoRepository _repo;

    public GrupoProdutoService(IGrupoProdutoRepository repo)
    {
        _repo = repo;
    }

    public async Task<IEnumerable<GrupoProdutoDto>> GetAllAsync()
    {
        var items = await _repo.GetAllAsync();
        return items.Select(g => new GrupoProdutoDto { Codigo = g.Codigo, Descricao = g.Descricao });
    }
}

using DispensaMed.Domain.Entities;

namespace DispensaMed.Domain.Interfaces;

public interface IProdutoRepository
{
    Task<Produto?> GetByIdAsync(long id);
    Task<(IEnumerable<Produto> Items, int Total)> GetAllAsync(string? search, int page, int pageSize);
    Task<long> CreateAsync(Produto produto);
    Task UpdateAsync(Produto produto);
    Task DeleteAsync(long id);
    Task<IEnumerable<EstoqueProduto>> GetEstoqueAsync(long id);
    Task<IEnumerable<Lote>> GetLotesAsync(long id);
    Task<IEnumerable<ProdutoBarras>> GetBarrasAsync(long id);
    Task<IEnumerable<ProdutoComponente>> GetComponentesAsync(long id);
}

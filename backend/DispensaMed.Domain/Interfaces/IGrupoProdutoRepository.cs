using DispensaMed.Domain.Entities;

namespace DispensaMed.Domain.Interfaces;

public interface IGrupoProdutoRepository
{
    Task<IEnumerable<GrupoProduto>> GetAllAsync();
    Task<GrupoProduto?> GetByIdAsync(int id);
}

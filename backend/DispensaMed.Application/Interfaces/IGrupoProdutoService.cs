using DispensaMed.Application.DTOs;

namespace DispensaMed.Application.Interfaces;

public interface IGrupoProdutoService
{
    Task<IEnumerable<GrupoProdutoDto>> GetAllAsync();
}

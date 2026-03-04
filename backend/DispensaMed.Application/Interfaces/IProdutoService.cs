using DispensaMed.Application.DTOs;

namespace DispensaMed.Application.Interfaces;

public interface IProdutoService
{
    Task<(IEnumerable<ProdutoListDto> Items, int Total)> GetAllAsync(string? search, int page, int pageSize);
    Task<ProdutoDto?> GetByIdAsync(long id);
    Task<long> CreateAsync(ProdutoCreateDto dto);
    Task UpdateAsync(long id, ProdutoUpdateDto dto);
    Task<bool> DeleteAsync(long id);
    Task<IEnumerable<EstoqueProdutoDto>> GetEstoqueAsync(long id);
    Task<IEnumerable<LoteDto>> GetLotesAsync(long id);
    Task<IEnumerable<ProdutoBarrasDto>> GetBarrasAsync(long id);
    Task<IEnumerable<ProdutoComponenteDto>> GetComponentesAsync(long id);
}

using DispensaMed.Domain.Entities;

namespace DispensaMed.Domain.Interfaces;

public interface IUsuarioRepository
{
    Task<Usuario?> GetByLoginAsync(string login);
    Task<IEnumerable<MenuPermissao>> GetMenuPermissoesAsync(string login, string? grupo);
    Task<UsuarioConfig?> GetUsuarioConfigAsync(string login);
    Task<ProfissionalVinculado?> GetProfissionalVinculadoAsync(string login);
    Task SaveRefreshTokenAsync(RefreshToken token);
    Task<RefreshToken?> GetRefreshTokenAsync(string token);
    Task DeleteRefreshTokenAsync(string token);
    Task DeleteExpiredRefreshTokensAsync(string login);
}

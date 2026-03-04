using DispensaMed.Domain.Entities;

namespace DispensaMed.Application.DTOs;

public class LoginResponse
{
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public UsuarioInfoDto Usuario { get; set; } = new();
}

public class UsuarioInfoDto
{
    public string Login { get; set; } = string.Empty;
    public string? Grupo { get; set; }
    public bool NaoDispensa { get; set; }
    public string? NomeUnidade { get; set; }
    public int? CodUnidadeSaude { get; set; }
    public IEnumerable<MenuPermissao> Permissoes { get; set; } = [];
}

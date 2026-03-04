namespace DispensaMed.Domain.Entities;

public class Usuario
{
    public string UsuarioLogin { get; set; } = string.Empty;
    public string Senha { get; set; } = string.Empty;
    public string? Grupo { get; set; }
    public string? Sae { get; set; }
    public string? ExclusaoPessoas { get; set; }
    public string? LiberarEstoque { get; set; }
    public string? NaoDispensa { get; set; }
}

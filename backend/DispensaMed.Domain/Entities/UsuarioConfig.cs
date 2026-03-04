namespace DispensaMed.Domain.Entities;

public class UsuarioConfig
{
    public int CodUnidadeSaudeAtual { get; set; }
    public string? NomeUnidade { get; set; }
    public string? LiberacaoEstoque { get; set; }
    public string? PermitirEstoqueZerado { get; set; }
}

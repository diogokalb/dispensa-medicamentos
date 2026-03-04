namespace DispensaMed.Domain.Entities;

public class MenuPermissao
{
    public string Menu { get; set; } = string.Empty;
    public bool Permissao { get; set; }
    public string? Pai { get; set; }
}

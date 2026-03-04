namespace DispensaMed.Infrastructure.Configuration;

/// <summary>
/// Maps commonly used keys from the [GERAL] section of Config.ini.
/// Registered as <see cref="Microsoft.Extensions.Options.IOptions{ConfigIniSettings}"/> in DI.
/// </summary>
public class ConfigIniSettings
{
    public string Database { get; set; } = string.Empty;
    public string DatabaseFotos { get; set; } = string.Empty;
    public string Prefeitura { get; set; } = string.Empty;
    public string Secretaria { get; set; } = string.Empty;
    public string Cidade { get; set; } = string.Empty;
    public string Cgc { get; set; } = string.Empty;
    public string Modulo { get; set; } = string.Empty;
}

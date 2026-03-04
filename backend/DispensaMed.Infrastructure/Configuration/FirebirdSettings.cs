namespace DispensaMed.Infrastructure.Configuration;

/// <summary>
/// Non-database connection parameters for Firebird.
/// The Database path is resolved from Config.ini at startup.
/// </summary>
public class FirebirdSettings
{
    public string DataSource { get; set; } = "localhost";
    public int Port { get; set; } = 3050;
    public string User { get; set; } = "SYSDBA";
    public string Password { get; set; } = "masterkey";
    public string Charset { get; set; } = "UTF8";
    public int ServerType { get; set; } = 0;
}

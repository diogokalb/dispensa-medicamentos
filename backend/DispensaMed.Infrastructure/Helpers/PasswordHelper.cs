namespace DispensaMed.Infrastructure.Helpers;

/// <summary>
/// Password helper that replicates the legacy Delphi Criptografia('BKR') function
/// and supports BCrypt for new web-system passwords.
/// </summary>
public static class PasswordHelper
{
    private const string DefaultKey = "BKR";

    /// <summary>
    /// Replicates the Delphi XOR cipher: Criptografia(texto, 'BKR').
    /// </summary>
    public static string CriptografiaBKR(string texto, string chave = DefaultKey)
    {
        if (string.IsNullOrEmpty(texto)) return string.Empty;
        var resultado = new char[texto.Length];
        for (int i = 0; i < texto.Length; i++)
            resultado[i] = (char)(texto[i] ^ chave[i % chave.Length]);
        return new string(resultado);
    }

    /// <summary>
    /// Hashes a plain-text password with BCrypt (for new web-system accounts).
    /// </summary>
    public static string HashBCrypt(string plainPassword)
    {
        return BCrypt.Net.BCrypt.HashPassword(plainPassword, workFactor: 12);
    }
}

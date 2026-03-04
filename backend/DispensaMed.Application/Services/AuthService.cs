using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using DispensaMed.Application.DTOs;
using DispensaMed.Application.Interfaces;
using DispensaMed.Domain.Entities;
using DispensaMed.Domain.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace DispensaMed.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IConfiguration _configuration;

    public AuthService(IUsuarioRepository usuarioRepository, IConfiguration configuration)
    {
        _usuarioRepository = usuarioRepository;
        _configuration = configuration;
    }

    public async Task<LoginResponse?> LoginAsync(LoginRequest request)
    {
        var loginUpper = request.Login.Trim().ToUpperInvariant();
        var usuario = await _usuarioRepository.GetByLoginAsync(loginUpper);
        if (usuario is null)
            return null;

        if (!VerifyPassword(request.Senha, usuario.Senha))
            return null;

        var permissoes = await _usuarioRepository.GetMenuPermissoesAsync(loginUpper, usuario.Grupo);
        var config = await _usuarioRepository.GetUsuarioConfigAsync(loginUpper);

        await _usuarioRepository.DeleteExpiredRefreshTokensAsync(loginUpper);

        var (accessToken, expiresAt) = GenerateAccessToken(loginUpper, usuario.Grupo);
        var refreshTokenValue = GenerateRefreshToken();

        var refreshToken = new RefreshToken
        {
            Usuario = loginUpper,
            Token = refreshTokenValue,
            ExpiresAt = DateTime.UtcNow.AddDays(GetRefreshTokenExpirationDays()),
            CreatedAt = DateTime.UtcNow
        };
        await _usuarioRepository.SaveRefreshTokenAsync(refreshToken);

        return new LoginResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshTokenValue,
            ExpiresAt = expiresAt,
            Usuario = new UsuarioInfoDto
            {
                Login = loginUpper,
                Grupo = usuario.Grupo,
                NaoDispensa = string.Equals(usuario.NaoDispensa, "S", StringComparison.OrdinalIgnoreCase),
                NomeUnidade = config?.NomeUnidade,
                CodUnidadeSaude = config?.CodUnidadeSaudeAtual,
                Permissoes = permissoes
            }
        };
    }

    public async Task<LoginResponse?> RefreshTokenAsync(string refreshToken)
    {
        var storedToken = await _usuarioRepository.GetRefreshTokenAsync(refreshToken);
        if (storedToken is null || storedToken.ExpiresAt <= DateTime.UtcNow)
            return null;

        await _usuarioRepository.DeleteRefreshTokenAsync(refreshToken);

        var usuario = await _usuarioRepository.GetByLoginAsync(storedToken.Usuario);
        if (usuario is null)
            return null;

        var permissoes = await _usuarioRepository.GetMenuPermissoesAsync(storedToken.Usuario, usuario.Grupo);
        var config = await _usuarioRepository.GetUsuarioConfigAsync(storedToken.Usuario);

        var (accessToken, expiresAt) = GenerateAccessToken(storedToken.Usuario, usuario.Grupo);
        var newRefreshTokenValue = GenerateRefreshToken();

        var newRefreshToken = new RefreshToken
        {
            Usuario = storedToken.Usuario,
            Token = newRefreshTokenValue,
            ExpiresAt = DateTime.UtcNow.AddDays(GetRefreshTokenExpirationDays()),
            CreatedAt = DateTime.UtcNow
        };
        await _usuarioRepository.SaveRefreshTokenAsync(newRefreshToken);

        return new LoginResponse
        {
            AccessToken = accessToken,
            RefreshToken = newRefreshTokenValue,
            ExpiresAt = expiresAt,
            Usuario = new UsuarioInfoDto
            {
                Login = storedToken.Usuario,
                Grupo = usuario.Grupo,
                NaoDispensa = string.Equals(usuario.NaoDispensa, "S", StringComparison.OrdinalIgnoreCase),
                NomeUnidade = config?.NomeUnidade,
                CodUnidadeSaude = config?.CodUnidadeSaudeAtual,
                Permissoes = permissoes
            }
        };
    }

    public async Task LogoutAsync(string refreshToken)
    {
        await _usuarioRepository.DeleteRefreshTokenAsync(refreshToken);
    }

    // -------------------------------------------------------------------
    // Password verification: tries CriptografiaBKR first, then plain text,
    // then BCrypt (for new passwords created by the web system).
    // -------------------------------------------------------------------
    private static bool VerifyPassword(string inputPassword, string storedPassword)
    {
        if (string.IsNullOrEmpty(storedPassword))
            return false;

        // 1. Legacy encrypted password (XOR with key "BKR")
        var encrypted = CriptografiaBKR(inputPassword);
        if (encrypted == storedPassword)
            return true;

        // 2. Plain-text fallback – TEMPORARY: required for legacy records from the Delphi system
        //    that were stored without encryption. These should be re-hashed on successful login
        //    as part of a future migration step.
        if (inputPassword == storedPassword)
            return true;

        // 3. BCrypt hash (new passwords created by the web system)
        try
        {
            if (storedPassword.StartsWith("$2", StringComparison.Ordinal) &&
                BCrypt.Net.BCrypt.Verify(inputPassword, storedPassword))
                return true;
        }
        catch
        {
            // storedPassword is not a valid BCrypt hash – ignore
        }

        return false;
    }

    // XOR cipher matching the Delphi Criptografia(texto, 'BKR') function.
    public static string CriptografiaBKR(string texto, string chave = "BKR")
    {
        if (string.IsNullOrEmpty(texto)) return string.Empty;
        var resultado = new char[texto.Length];
        for (int i = 0; i < texto.Length; i++)
            resultado[i] = (char)(texto[i] ^ chave[i % chave.Length]);
        return new string(resultado);
    }

    // -------------------------------------------------------------------
    // JWT helpers
    // -------------------------------------------------------------------
    private (string token, DateTime expiresAt) GenerateAccessToken(string login, string? grupo)
    {
        var jwtKey = _configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT key not configured.");
        var issuer = _configuration["Jwt:Issuer"] ?? "DispensaMed";
        var audience = _configuration["Jwt:Audience"] ?? "DispensaMed";
        var expirationMinutes = int.TryParse(_configuration["Jwt:ExpirationMinutes"], out var mins) ? mins : 60;

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiresAt = DateTime.UtcNow.AddMinutes(expirationMinutes);

        var claims = new List<Claim>
        {
            new(ClaimTypes.Name, login),
            new(JwtRegisteredClaimNames.Sub, login),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };
        if (!string.IsNullOrWhiteSpace(grupo))
            claims.Add(new Claim("grupo", grupo));

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: expiresAt,
            signingCredentials: creds);

        return (new JwtSecurityTokenHandler().WriteToken(token), expiresAt);
    }

    private static string GenerateRefreshToken()
    {
        return Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
    }

    private int GetRefreshTokenExpirationDays()
    {
        return int.TryParse(_configuration["Jwt:RefreshTokenExpirationDays"], out var days) ? days : 7;
    }
}

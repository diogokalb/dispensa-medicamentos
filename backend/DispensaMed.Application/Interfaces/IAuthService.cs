using DispensaMed.Application.DTOs;

namespace DispensaMed.Application.Interfaces;

public interface IAuthService
{
    Task<LoginResponse?> LoginAsync(LoginRequest request);
    Task<LoginResponse?> RefreshTokenAsync(string refreshToken);
    Task LogoutAsync(string refreshToken);
}

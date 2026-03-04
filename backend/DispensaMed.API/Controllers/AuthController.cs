using DispensaMed.Application.DTOs;
using DispensaMed.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DispensaMed.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    /// <summary>
    /// Authenticates a user and returns JWT access + refresh tokens.
    /// </summary>
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var response = await _authService.LoginAsync(request);
        if (response is null)
            return Unauthorized(new { message = "Login ou senha inválidos." });

        return Ok(response);
    }

    /// <summary>
    /// Issues a new access token using a valid refresh token.
    /// </summary>
    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<IActionResult> Refresh([FromBody] RefreshRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.RefreshToken))
            return BadRequest(new { message = "Refresh token é obrigatório." });

        var response = await _authService.RefreshTokenAsync(request.RefreshToken);
        if (response is null)
            return Unauthorized(new { message = "Refresh token inválido ou expirado." });

        return Ok(response);
    }

    /// <summary>
    /// Invalidates the refresh token (logout).
    /// </summary>
    [HttpPost("logout")]
    [AllowAnonymous]
    public async Task<IActionResult> Logout([FromBody] RefreshRequest request)
    {
        if (!string.IsNullOrWhiteSpace(request.RefreshToken))
            await _authService.LogoutAsync(request.RefreshToken);

        return NoContent();
    }

    /// <summary>
    /// Endpoint protected by JWT to verify authentication is working.
    /// </summary>
    [HttpGet("me")]
    [Authorize]
    public IActionResult Me()
    {
        var login = User.Identity?.Name ?? "desconhecido";
        return Ok(new { login });
    }
}

public class RefreshRequest
{
    public string RefreshToken { get; set; } = string.Empty;
}

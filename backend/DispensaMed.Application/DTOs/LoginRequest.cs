using System.ComponentModel.DataAnnotations;

namespace DispensaMed.Application.DTOs;

public class LoginRequest
{
    [Required]
    public string Login { get; set; } = string.Empty;

    [Required]
    public string Senha { get; set; } = string.Empty;
}

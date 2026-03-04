namespace DispensaMed.Domain.Entities;

public class RefreshToken
{
    public int Id { get; set; }
    public string Usuario { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; }
}

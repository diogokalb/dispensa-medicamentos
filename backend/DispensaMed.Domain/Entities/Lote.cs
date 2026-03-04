namespace DispensaMed.Domain.Entities;

public class Lote
{
    public long CodProduto { get; set; }
    public string? LoteNum { get; set; }
    public DateTime? DtValidade { get; set; }
    public string? Ativo { get; set; }
    public int? CodFabricante { get; set; }
    public string? NomeFabricante { get; set; }
}

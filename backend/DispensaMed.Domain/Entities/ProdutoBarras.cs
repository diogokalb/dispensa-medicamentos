namespace DispensaMed.Domain.Entities;

public class ProdutoBarras
{
    public long Produto { get; set; }
    public string? CodigoBarras { get; set; }
    public int? Fabricante { get; set; }
    public string? NomeFabricante { get; set; }
}

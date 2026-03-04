namespace DispensaMed.Domain.Entities;

public class EstoqueProduto
{
    public int CodUnidade { get; set; }
    public long CodProduto { get; set; }
    public decimal? Quantidade { get; set; }
    public decimal? Valor { get; set; }
}

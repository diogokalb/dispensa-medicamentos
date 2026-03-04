namespace DispensaMed.Application.DTOs;

public class EstoqueProdutoDto
{
    public int CodUnidade { get; set; }
    public long CodProduto { get; set; }
    public decimal? Quantidade { get; set; }
    public decimal? Valor { get; set; }
}

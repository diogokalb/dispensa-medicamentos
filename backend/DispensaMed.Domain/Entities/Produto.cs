namespace DispensaMed.Domain.Entities;

public class Produto
{
    public long Codigo { get; set; }
    public int? CodCompras { get; set; }
    public string? Descricao { get; set; }
    public string? DescricaoAbreviada { get; set; }
    public string? Un { get; set; }
    public int? CodGrupo { get; set; }
    public string? Duracao { get; set; }
    public decimal? EstoqueMinimo { get; set; }
    public decimal? EstoqueMaximo { get; set; }
    public int? QtdCodBarras { get; set; }
    public decimal? Preco { get; set; }
    public string? Obs { get; set; }
    public string? NomeGenerico { get; set; }
    public string? Laboratorio { get; set; }
    public string? CodigoHorus { get; set; }
    public string? HorusTipo { get; set; }
    public string? DCB { get; set; }
    public string? Apresentacao { get; set; }
    public string? Lista { get; set; }
    public string? ListaBasica { get; set; }
    public decimal? CustoMedio { get; set; }
    public decimal? UltimoCusto { get; set; }
    public decimal? QtdTotal { get; set; }
    public DateTime? DataDesativado { get; set; }
}

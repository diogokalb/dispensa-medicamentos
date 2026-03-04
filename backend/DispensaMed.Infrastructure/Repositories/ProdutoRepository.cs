using Dapper;
using DispensaMed.Domain.Entities;
using DispensaMed.Domain.Interfaces;
using DispensaMed.Infrastructure.Data;

namespace DispensaMed.Infrastructure.Repositories;

public class ProdutoRepository : IProdutoRepository
{
    private readonly DbConnectionFactory _db;

    public ProdutoRepository(DbConnectionFactory db)
    {
        _db = db;
    }

    public async Task<Produto?> GetByIdAsync(long id)
    {
        using var conn = _db.CreateConnection();
        const string sql = """
            SELECT p.CODIGO, p.CODCOMPRAS, p.DESCRICAO, p.DESCRICAOABREVIADA, p.UN,
                   p.CODGRUPO, p.DURACAO, p.ESTOQUEMINIMO, p.ESTOQUEMAXIMO,
                   p.QTDCODBARRAS, p.PRECO, p.OBS, p.NOMEGENEXICO AS NOMEGENERICO,
                   p.LABORATORIO, p.CODIGOHORUS, p.HORUSTIPO, p.DCB,
                   p.APRESENTACAO, p.LISTA, p.LISTABASICA, p.CUSTOMEDIO,
                   p.ULTIMOCUSTO, p.QTDTOTAL, p.DATADESATIVADO
            FROM PRODUTOS p
            WHERE p.CODIGO = @Id
            """;
        return await conn.QueryFirstOrDefaultAsync<Produto>(sql, new { Id = id });
    }

    public async Task<(IEnumerable<Produto> Items, int Total)> GetAllAsync(string? search, int page, int pageSize)
    {
        using var conn = _db.CreateConnection();

        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);
        var skip = (page - 1) * pageSize;
        var whereClause = string.IsNullOrWhiteSpace(search)
            ? ""
            : "WHERE UPPER(p.DESCRICAO) CONTAINING UPPER(@Search)";

        var countSql = $"SELECT COUNT(*) FROM PRODUTOS p {whereClause}";
        var total = await conn.ExecuteScalarAsync<int>(countSql, new { Search = search });

        var dataSql = $"""
            SELECT FIRST {pageSize} SKIP {skip}
                   p.CODIGO, p.CODCOMPRAS, p.DESCRICAO, p.DESCRICAOABREVIADA, p.UN,
                   p.CODGRUPO, p.DURACAO, p.ESTOQUEMINIMO, p.ESTOQUEMAXIMO,
                   p.QTDCODBARRAS, p.PRECO, p.OBS, p.NOMEGENEXICO AS NOMEGENERICO,
                   p.LABORATORIO, p.CODIGOHORUS, p.HORUSTIPO, p.DCB,
                   p.APRESENTACAO, p.LISTA, p.LISTABASICA, p.CUSTOMEDIO,
                   p.ULTIMOCUSTO, p.QTDTOTAL, p.DATADESATIVADO
            FROM PRODUTOS p
            {whereClause}
            ORDER BY p.DESCRICAO
            """;

        var items = await conn.QueryAsync<Produto>(dataSql, new { Search = search });
        return (items, total);
    }

    public async Task<long> CreateAsync(Produto produto)
    {
        using var conn = _db.CreateConnection();
        const string sql = """
            INSERT INTO PRODUTOS (CODCOMPRAS, DESCRICAO, DESCRICAOABREVIADA, UN,
                CODGRUPO, DURACAO, ESTOQUEMINIMO, ESTOQUEMAXIMO,
                QTDCODBARRAS, PRECO, OBS, NOMEGENEXICO, LABORATORIO,
                CODIGOHORUS, HORUSTIPO, DCB, APRESENTACAO, LISTA, LISTABASICA,
                CUSTOMEDIO, ULTIMOCUSTO, QTDTOTAL, DATADESATIVADO)
            VALUES (@CodCompras, @Descricao, @DescricaoAbreviada, @Un,
                @CodGrupo, @Duracao, @EstoqueMinimo, @EstoqueMaximo,
                @QtdCodBarras, @Preco, @Obs, @NomeGenerico, @Laboratorio,
                @CodigoHorus, @HorusTipo, @DCB, @Apresentacao, @Lista, @ListaBasica,
                @CustoMedio, @UltimoCusto, @QtdTotal, @DataDesativado)
            RETURNING CODIGO
            """;
        return await conn.ExecuteScalarAsync<long>(sql, produto);
    }

    public async Task UpdateAsync(Produto produto)
    {
        using var conn = _db.CreateConnection();
        const string sql = """
            UPDATE PRODUTOS SET
                CODCOMPRAS = @CodCompras,
                DESCRICAO = @Descricao,
                DESCRICAOABREVIADA = @DescricaoAbreviada,
                UN = @Un,
                CODGRUPO = @CodGrupo,
                DURACAO = @Duracao,
                ESTOQUEMINIMO = @EstoqueMinimo,
                ESTOQUEMAXIMO = @EstoqueMaximo,
                QTDCODBARRAS = @QtdCodBarras,
                PRECO = @Preco,
                OBS = @Obs,
                NOMEGENEXICO = @NomeGenerico,
                LABORATORIO = @Laboratorio,
                CODIGOHORUS = @CodigoHorus,
                HORUSTIPO = @HorusTipo,
                DCB = @DCB,
                APRESENTACAO = @Apresentacao,
                LISTA = @Lista,
                LISTABASICA = @ListaBasica,
                CUSTOMEDIO = @CustoMedio,
                ULTIMOCUSTO = @UltimoCusto,
                QTDTOTAL = @QtdTotal,
                DATADESATIVADO = @DataDesativado
            WHERE CODIGO = @Codigo
            """;
        await conn.ExecuteAsync(sql, produto);
    }

    public async Task DeleteAsync(long id)
    {
        using var conn = _db.CreateConnection();
        await conn.ExecuteAsync("DELETE FROM PRODUTOS WHERE CODIGO = @Id", new { Id = id });
    }

    public async Task<IEnumerable<EstoqueProduto>> GetEstoqueAsync(long id)
    {
        using var conn = _db.CreateConnection();
        const string sql = """
            SELECT CODUNIDADE, CODPRODUTO, QUANTIDADE, VALOR
            FROM ESTOQUE_UNID_PROD
            WHERE CODPRODUTO = @Id
            """;
        return await conn.QueryAsync<EstoqueProduto>(sql, new { Id = id });
    }

    public async Task<IEnumerable<Lote>> GetLotesAsync(long id)
    {
        using var conn = _db.CreateConnection();
        const string sql = """
            SELECT nl.CODPRODUTO, nl.LOTE AS LOTENUM, nl.DTVALIDADE,
                   nl.ATIVO, nl.CODFABRICANTE, f.NOME AS NOMEFABRICANTE
            FROM NOVOLOTES nl
            LEFT JOIN FABRICANTES f ON f.CODIGO = nl.CODFABRICANTE
            WHERE nl.CODPRODUTO = @Id
            ORDER BY nl.DTVALIDADE
            """;
        return await conn.QueryAsync<Lote>(sql, new { Id = id });
    }

    public async Task<IEnumerable<ProdutoBarras>> GetBarrasAsync(long id)
    {
        using var conn = _db.CreateConnection();
        const string sql = """
            SELECT pb.PRODUTO, pb.CODIGOBARRAS, pb.FABRICANTE, f.NOME AS NOMEFABRICANTE
            FROM PRODUTOSBARRAS pb
            LEFT JOIN FABRICANTES f ON f.CODIGO = pb.FABRICANTE
            WHERE pb.PRODUTO = @Id
            """;
        return await conn.QueryAsync<ProdutoBarras>(sql, new { Id = id });
    }

    public async Task<IEnumerable<ProdutoComponente>> GetComponentesAsync(long id)
    {
        using var conn = _db.CreateConnection();
        const string sql = """
            SELECT pc.PRODUTO, pc.COMPONENTE, c.NOME AS NOMECOMPONENTE
            FROM PRODUTOSCOMPONENTES pc
            LEFT JOIN COMPONENTES c ON c.CODIGO = pc.COMPONENTE
            WHERE pc.PRODUTO = @Id
            """;
        return await conn.QueryAsync<ProdutoComponente>(sql, new { Id = id });
    }
}

using Dapper;
using DispensaMed.Domain.Entities;
using DispensaMed.Domain.Interfaces;
using DispensaMed.Infrastructure.Data;

namespace DispensaMed.Infrastructure.Repositories;

public class GrupoProdutoRepository : IGrupoProdutoRepository
{
    private readonly DbConnectionFactory _db;

    public GrupoProdutoRepository(DbConnectionFactory db)
    {
        _db = db;
    }

    public async Task<IEnumerable<GrupoProduto>> GetAllAsync()
    {
        using var conn = _db.CreateConnection();
        return await conn.QueryAsync<GrupoProduto>(
            "SELECT CODIGO, DESCRICAO FROM GRUPOSPRODUTOS ORDER BY DESCRICAO");
    }

    public async Task<GrupoProduto?> GetByIdAsync(int id)
    {
        using var conn = _db.CreateConnection();
        return await conn.QueryFirstOrDefaultAsync<GrupoProduto>(
            "SELECT CODIGO, DESCRICAO FROM GRUPOSPRODUTOS WHERE CODIGO = @Id",
            new { Id = id });
    }
}

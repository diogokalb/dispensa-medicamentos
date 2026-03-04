using Dapper;
using DispensaMed.Domain.Entities;
using DispensaMed.Domain.Interfaces;
using DispensaMed.Infrastructure.Data;
using FirebirdSql.Data.FirebirdClient;

namespace DispensaMed.Infrastructure.Repositories;

public class UsuarioRepository : IUsuarioRepository
{
    private readonly DbConnectionFactory _connectionFactory;

    public UsuarioRepository(DbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<Usuario?> GetByLoginAsync(string login)
    {
        const string sql = """
            SELECT
                USUARIO     AS UsuarioLogin,
                SENHA,
                GRUPO,
                SAE,
                EXCLUSAOPESSOAS,
                LIBERARESTOQUE  AS LiberarEstoque,
                NAODISPENSA
            FROM Usuarios
            WHERE Upper(USUARIO) = Upper(@login)
            """;

        await using var conn = _connectionFactory.CreateConnection();
        await conn.OpenAsync();
        return await conn.QueryFirstOrDefaultAsync<Usuario>(sql, new { login });
    }

    public async Task<IEnumerable<MenuPermissao>> GetMenuPermissoesAsync(string login, string? grupo)
    {
        await using var conn = _connectionFactory.CreateConnection();
        await conn.OpenAsync();

        if (!string.IsNullOrWhiteSpace(grupo))
        {
            const string sql = """
                SELECT MENU, PERMISSAO, PAI
                FROM MenusGrupos
                WHERE GRUPO = @grupo
                ORDER BY PAI
                """;
            return await conn.QueryAsync<MenuPermissao>(sql, new { grupo });
        }
        else
        {
            const string sql = """
                SELECT MENU, PERMISSAO, PAI
                FROM Menus
                WHERE Upper(USUARIO) = Upper(@login)
                ORDER BY PAI
                """;
            return await conn.QueryAsync<MenuPermissao>(sql, new { login });
        }
    }

    public async Task<UsuarioConfig?> GetUsuarioConfigAsync(string login)
    {
        const string sql = """
            SELECT
                T.CODUNIDADESAUDEATUAL  AS CodUnidadeSaudeAtual,
                U.NOME                  AS NomeUnidade,
                T.LIBERACAOESTOQUE,
                T.PERMITIRESTOQUEZERADO AS PermitirEstoqueZerado
            FROM TabDiv T
            INNER JOIN Unidades U ON U.CODIGO = T.CODUNIDADESAUDEATUAL
            WHERE Upper(T.USUARIO) = Upper(@login)
            """;

        await using var conn = _connectionFactory.CreateConnection();
        await conn.OpenAsync();
        return await conn.QueryFirstOrDefaultAsync<UsuarioConfig>(sql, new { login });
    }

    public async Task<ProfissionalVinculado?> GetProfissionalVinculadoAsync(string login)
    {
        const string sql = """
            SELECT CODIGO, CODSALA AS CodSala
            FROM Profissionais
            WHERE Upper(USUARIO) = Upper(@login)
            """;

        await using var conn = _connectionFactory.CreateConnection();
        await conn.OpenAsync();
        return await conn.QueryFirstOrDefaultAsync<ProfissionalVinculado>(sql, new { login });
    }

    public async Task SaveRefreshTokenAsync(RefreshToken token)
    {
        const string sql = """
            INSERT INTO WEB_REFRESH_TOKENS (ID, USUARIO, TOKEN, EXPIRES_AT, CREATED_AT)
            VALUES (GEN_ID(GEN_WEB_REFRESH_TOKENS_ID, 1), @Usuario, @Token, @ExpiresAt, @CreatedAt)
            """;

        await using var conn = _connectionFactory.CreateConnection();
        await conn.OpenAsync();
        await conn.ExecuteAsync(sql, new
        {
            token.Usuario,
            token.Token,
            token.ExpiresAt,
            token.CreatedAt
        });
    }

    public async Task<RefreshToken?> GetRefreshTokenAsync(string token)
    {
        const string sql = """
            SELECT ID, USUARIO, TOKEN, EXPIRES_AT AS ExpiresAt, CREATED_AT AS CreatedAt
            FROM WEB_REFRESH_TOKENS
            WHERE TOKEN = @token
            """;

        await using var conn = _connectionFactory.CreateConnection();
        await conn.OpenAsync();
        return await conn.QueryFirstOrDefaultAsync<RefreshToken>(sql, new { token });
    }

    public async Task DeleteRefreshTokenAsync(string token)
    {
        const string sql = "DELETE FROM WEB_REFRESH_TOKENS WHERE TOKEN = @token";

        await using var conn = _connectionFactory.CreateConnection();
        await conn.OpenAsync();
        await conn.ExecuteAsync(sql, new { token });
    }

    public async Task DeleteExpiredRefreshTokensAsync(string login)
    {
        const string sql = """
            DELETE FROM WEB_REFRESH_TOKENS
            WHERE Upper(USUARIO) = Upper(@login) AND EXPIRES_AT < CURRENT_TIMESTAMP
            """;

        await using var conn = _connectionFactory.CreateConnection();
        await conn.OpenAsync();
        await conn.ExecuteAsync(sql, new { login });
    }
}

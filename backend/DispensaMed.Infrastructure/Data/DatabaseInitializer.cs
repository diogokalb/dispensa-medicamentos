using DispensaMed.Infrastructure.Data;
using FirebirdSql.Data.FirebirdClient;
using Microsoft.Extensions.Logging;

namespace DispensaMed.Infrastructure.Data;

/// <summary>
/// Creates the WEB_REFRESH_TOKENS table and its generator on startup
/// if they do not already exist.
/// </summary>
public class DatabaseInitializer
{
    private readonly DbConnectionFactory _connectionFactory;
    private readonly ILogger<DatabaseInitializer> _logger;

    public DatabaseInitializer(DbConnectionFactory connectionFactory, ILogger<DatabaseInitializer> logger)
    {
        _connectionFactory = connectionFactory;
        _logger = logger;
    }

    public async Task InitializeAsync()
    {
        try
        {
            await using var conn = _connectionFactory.CreateConnection();
            await conn.OpenAsync();

            await EnsureRefreshTokensTableAsync(conn);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to initialize database.");
            throw;
        }
    }

    private async Task EnsureRefreshTokensTableAsync(FbConnection conn)
    {
        // Check if table exists in Firebird's system tables
        const string checkTable = """
            SELECT COUNT(*)
            FROM RDB$RELATIONS
            WHERE RDB$RELATION_NAME = 'WEB_REFRESH_TOKENS'
            """;

        var tableExists = await ExecuteScalarAsync<int>(conn, checkTable) > 0;

        if (!tableExists)
        {
            _logger.LogInformation("Creating WEB_REFRESH_TOKENS table...");

            const string createTable = """
                CREATE TABLE WEB_REFRESH_TOKENS (
                    ID          INTEGER     NOT NULL PRIMARY KEY,
                    USUARIO     VARCHAR(50) NOT NULL,
                    TOKEN       VARCHAR(500) NOT NULL UNIQUE,
                    EXPIRES_AT  TIMESTAMP   NOT NULL,
                    CREATED_AT  TIMESTAMP   DEFAULT CURRENT_TIMESTAMP
                )
                """;
            await ExecuteNonQueryAsync(conn, createTable);
        }

        // Check if the generator exists
        const string checkGenerator = """
            SELECT COUNT(*)
            FROM RDB$GENERATORS
            WHERE RDB$GENERATOR_NAME = 'GEN_WEB_REFRESH_TOKENS_ID'
            """;

        var generatorExists = await ExecuteScalarAsync<int>(conn, checkGenerator) > 0;

        if (!generatorExists)
        {
            _logger.LogInformation("Creating GEN_WEB_REFRESH_TOKENS_ID generator...");
            await ExecuteNonQueryAsync(conn, "CREATE GENERATOR GEN_WEB_REFRESH_TOKENS_ID");
        }
    }

    private static async Task ExecuteNonQueryAsync(FbConnection conn, string sql)
    {
        await using var cmd = conn.CreateCommand();
        cmd.CommandText = sql;
        await cmd.ExecuteNonQueryAsync();
    }

    private static async Task<T?> ExecuteScalarAsync<T>(FbConnection conn, string sql)
    {
        await using var cmd = conn.CreateCommand();
        cmd.CommandText = sql;
        var result = await cmd.ExecuteScalarAsync();
        if (result is null || result == DBNull.Value) return default;
        return (T)Convert.ChangeType(result, typeof(T));
    }
}

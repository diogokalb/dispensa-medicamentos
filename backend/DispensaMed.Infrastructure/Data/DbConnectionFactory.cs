using FirebirdSql.Data.FirebirdClient;
using Microsoft.Extensions.Configuration;

namespace DispensaMed.Infrastructure.Data;

public class DbConnectionFactory
{
    private readonly string _connectionString;

    public DbConnectionFactory(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("Firebird")
            ?? throw new InvalidOperationException("Connection string 'Firebird' not found.");
    }

    public FbConnection CreateConnection()
    {
        return new FbConnection(_connectionString);
    }
}

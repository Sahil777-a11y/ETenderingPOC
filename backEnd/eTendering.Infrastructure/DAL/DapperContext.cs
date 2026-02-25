using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.Data;

namespace eTendering.Infrastructure.DAL
{
    /// <summary>
    /// Provides a centralized context for Dapper database operations.
    /// Encapsulates the connection string and creates <see cref="IDbConnection"/> instances.
    /// </summary>
    public class DapperContext
    {
        private readonly IConfiguration _configuration;
        private readonly string _connectionString;

        /// <summary>
        /// Initializes a new instance of the <see cref="DapperContext"/> class.
        /// Retrieves the connection string from the application's configuration.
        /// </summary>
        /// <param name="configuration">The application configuration containing connection strings.</param>
        public DapperContext(IConfiguration configuration)
        {
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
            _connectionString = _configuration.GetConnectionString("DBConnectionString") ?? throw new InvalidOperationException("Connection string 'DBConnectionString' not found.");
        }

        /// <summary>
        /// Creates a new <see cref="IDbConnection"/> instance.
        /// </summary>
        /// <returns>A new <see cref="SqlConnection"/> using the configured connection string.</returns>
        public IDbConnection CreateConnection() => new SqlConnection(_connectionString);
    }
}

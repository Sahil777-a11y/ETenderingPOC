using System.Data;

namespace eTendering.Infrastructure.Repository.Interface
{
    /// <summary>
    /// Generic repository interface providing common database operations using Dapper.
    /// Supports query, parent-child mapping, and CRUD commands for type <typeparamref name="T"/>.
    /// </summary>
    /// <typeparam name="T">The entity type for standard repository operations.</typeparam>
    public interface IGenericRepo<T> where T : class
    {
        /// <summary>
        /// Creates and returns a new database connection.
        /// </summary>
        IDbConnection CreateConnection();

        #region Query Methods

        /// <summary>
        /// Returns a single T-mapped entity (or null).
        /// </summary>
        /// <param name="storedProc">The stored procedure name to execute.</param>
        /// <param name="parameters">Optional parameters to pass to the stored procedure.</param>
        Task<T?> QuerySingleAsync(string storedProc, object? parameters = null);

        /// <summary>
        /// Returns a list of T-mapped entities.
        /// </summary>
        /// <param name="storedProc">The stored procedure name to execute.</param>
        /// <param name="parameters">Optional parameters to pass to the stored procedure.</param>
        Task<IEnumerable<T>> QueryListAsync(string storedProc, object? parameters = null);

        /// <summary>
        /// Returns a single custom-mapped entity (other than T).
        /// </summary>
        /// <typeparam name="TCustom">The type of the custom-mapped entity.</typeparam>
        /// <param name="storedProc">The stored procedure name to execute.</param>
        /// <param name="parameters">Optional parameters to pass to the stored procedure.</param>
        Task<TCustom?> QueryCustomSingleAsync<TCustom>(string storedProc, object? parameters = null);

        /// <summary>
        /// Returns a list of custom-mapped entities.
        /// </summary>
        /// <typeparam name="TCustom">The type of the custom-mapped entity.</typeparam>
        /// <param name="storedProc">The stored procedure name to execute.</param>
        /// <param name="parameters">Parameters to pass to the stored procedure.</param>
        /// <param name="connection">Optional database connection.</param>
        /// <param name="transaction">Optional database transaction.</param>
        Task<IEnumerable<TCustom>> QueryCustomListAsync<TCustom>(string storedProc, object? parameters = null, IDbConnection? connection = null, IDbTransaction? transaction = null);

        /// <summary>
        /// Returns a list of custom-mapped entities with count of totalRecords.
        /// </summary>
        /// <typeparam name="TCustom">The type of the custom-mapped entity.</typeparam>
        /// <param name="storedProc">The stored procedure name to execute.</param>
        /// <param name="parameters">Optional parameters to pass to the stored procedure.</param>
        Task<(int totalRecords, IEnumerable<TCustom> items)> QueryCustomListWithCountAsync<TCustom>(string storedProc, object? parameters = null);


        /// <summary>
        /// Returns a list of custom-mapped entities with custom Metadata DTO.
        /// </summary>
        /// <typeparam name="TMetaDto">The type of the custom-mapped Meta DTO.</typeparam>
        /// <typeparam name="TCustom">The type of the custom-mapped entity.</typeparam>
        /// <param name="storedProc">The stored procedure name to execute.</param>
        /// <param name="parameters">Optional parameters to pass to the stored procedure.</param>
        Task<(TMetaDto metaDto, IEnumerable<TCustom> items)> QueryCustomListWithMetaDtoAsync<TMetaDto, TCustom>(string storedProc, object? parameters = null);


        /// <summary>
        /// Returns a list of custom-mapped entities with count of totalRecords and Dashboard Card Count.
        /// </summary>
        /// <typeparam name="TCustom">The type of the custom-mapped entity.</typeparam>
        /// <param name="storedProc">The stored procedure name to execute.</param>
        /// <param name="parameters">Optional parameters to pass to the stored procedure.</param>
        Task<(int totalRecords, TDashboard dashboardCounts, IEnumerable<TCustom> items)> QueryCustomListWithCountAndDashboardCountAsync<TCustom, TDashboard>(string storedProc, object? parameters = null);

        /// <summary>
        /// Returns a list of custom-mapped entities to export data.
        /// </summary>
        /// <typeparam name="TResult">The type of entity for export mapping.</typeparam>
        /// <param name="storedProc">The stored procedure name to execute.</param>
        /// <param name="parameters">Parameters to pass to the stored procedure.</param>
        /// <param name="connection">Optional database connection.</param>
        /// <param name="transaction">Optional database transaction.</param>
        Task<IEnumerable<TResult>> ExportDataAsync<TResult>(string storedProc, object parameters, IDbConnection? connection = null, IDbTransaction? transaction = null);

        /// <summary>
        /// Returns a list of registered file prefixes..
        /// </summary>
        Task<T> IsRegisteredAsync(string storedProc, object parameters);

        #endregion

        #region Parent-Child Methods & Mapping

        /// <summary>
        /// Returns a single custom-parent (no T-mapped) entity with its associated children collection.
        /// </summary>
        /// <typeparam name="TParent">The type of the parent entity.</typeparam>
        /// <typeparam name="TChild">The type of the child entity.</typeparam>
        /// <param name="storedProc">The stored procedure name to execute.</param>
        /// <param name="parameters">Optional parameters to pass to the stored procedure.</param>
        /// <param name="childPropertyName">The property name on parent for child collection.</param>
        /// <param name="parentKeyName">The key property name of the parent.</param>
        /// <param name="childForeignKeyName">The foreign key property name of the child.</param>
        Task<TParent?> QuerySingleParentWithChildrenAsync<TParent, TChild>(string storedProc, object? parameters, string childPropertyName, string parentKeyName, string childForeignKeyName);

        /// <summary>
        /// Returns a single custom-parent entity with children and total record count.
        /// </summary>
        /// <typeparam name="TParent">The type of the parent entity.</typeparam>
        /// <typeparam name="TChild">The type of the child entity.</typeparam>
        /// <param name="storedProc">The stored procedure name to execute.</param>
        /// <param name="parameters">Optional parameters to pass to the stored procedure.</param>
        /// <param name="childPropertyName">The property name on parent for child collection.</param>
        /// <param name="parentKeyName">The key property name of the parent.</param>
        /// <param name="childForeignKeyName">The foreign key property name of the child.</param>
        Task<(int totalRecords, TParent? parent)> QuerySingleParentWithChildrenAndCountAsync<TParent, TChild>(string storedProc, object? parameters, string childPropertyName, string parentKeyName, string childForeignKeyName);

        /// <summary>
        /// Returns only custom-parent entities (no children) with total record count.
        /// </summary>
        /// <typeparam name="TParent">The type of the parent entity.</typeparam>
        /// <param name="storedProc">The stored procedure name to execute.</param>
        /// <param name="parameters">Optional parameters to pass to the stored procedure.</param>
        Task<(int totalRecords, IEnumerable<TParent> Items)> QueryMultiParentsOnlyAsync<TParent>(string storedProc, object? parameters = null);

        /// <summary>
        /// Returns multiple parent entities with their associated children collection and total record count.
        /// </summary>
        /// <typeparam name="TParent">The type of the parent entity.</typeparam>
        /// <typeparam name="TChild">The type of the child entity.</typeparam>
        /// <param name="storedProc">The stored procedure name to execute.</param>
        /// <param name="parameters">Optional parameters to pass to the stored procedure.</param>
        /// <param name="childPropertyName">The property name on parent for child collection.</param>
        /// <param name="parentKeyName">The key property name of the parent.</param>
        /// <param name="childForeignKeyName">The foreign key property name of the child.</param>
        Task<(int totalRecords, IEnumerable<TParent> items)> QueryMultiParentsWithChildrenAndCountAsync<TParent, TChild>(
            string storedProc, object? parameters, string childPropertyName, string parentKeyName, string childForeignKeyName);

        #endregion

        #region Command Methods (CRUD)

        /// <summary>
        /// Execute a non-query command (insert/update/delete) and return affected rows.
        /// </summary>
        /// <param name="storedProc">The stored procedure name to execute.</param>
        /// <param name="parameters">Optional parameters to pass to the stored procedure.</param>
        /// <param name="connection">Optional database connection.</param>
        /// <param name="transaction">Optional database transaction.</param>
        Task<int> ExecuteAsync(string storedProc, object? parameters = null, IDbConnection? connection = null, IDbTransaction? transaction = null);

        /// <summary>
        /// Insert or update (returns identity or affected row).
        /// </summary>
        /// <typeparam name="TResult">The return type of the scalar result.</typeparam>
        /// <param name="storedProc">The stored procedure name to execute.</param>
        /// <param name="parameters">Parameters to pass to the stored procedure.</param>
        /// <param name="connection">Optional database connection.</param>
        /// <param name="transaction">Optional database transaction.</param>
        Task<TResult> ExecuteScalarAsync<TResult>(string storedProc, object parameters, IDbConnection? connection = null, IDbTransaction? transaction = null);

        #endregion
    }
}

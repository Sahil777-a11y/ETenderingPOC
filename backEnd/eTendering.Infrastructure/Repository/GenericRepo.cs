using Dapper;
using eTendering.Infrastructure.DAL;
using eTendering.Infrastructure.Repository.Interface;
using Microsoft.Extensions.Logging;
using System.Data;


namespace eTendering.Infrastructure.Repository
{
    public class GenericRepo<T>(DapperContext _context, ILogger<GenericRepo<T>> _logger) : IGenericRepo<T> where T : class
    {
        public IDbConnection CreateConnection() => _context.CreateConnection();

        #region Query Methods

        public async Task<T?> QuerySingleAsync(string storedProc, object? parameters = null)
        {
            try
            {
                _logger.LogInformation("Executing SP: {StoredProcedure} with parameters: {@Parameters}", storedProc, parameters);

                using var connection = CreateConnection();

                return await connection.QueryFirstOrDefaultAsync<T>(storedProc, parameters, commandType: CommandType.StoredProcedure);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while executing SP: {StoredProcedure}", storedProc);
                throw;
            }
        }


        public async Task<IEnumerable<T>> QueryListAsync(string storedProc, object? parameters = null)
        {
            try
            {
                _logger.LogInformation("Executing SP: {StoredProcedure} with parameters: {@Parameters}", storedProc, parameters);

                using var connection = CreateConnection();

                return await connection.QueryAsync<T>(storedProc, parameters, commandType: CommandType.StoredProcedure);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while executing SP: {StoredProcedure}", storedProc);
                throw;
            }
        }


        public async Task<TCustom?> QueryCustomSingleAsync<TCustom>(string storedProc, object? parameters = null)
        {
            try
            {
                _logger.LogInformation("Executing SP: {StoredProcedure} with parameters: {@Parameters}", storedProc, parameters);

                using var connection = CreateConnection();

                return await connection.QueryFirstOrDefaultAsync<TCustom>(storedProc, parameters, commandType: CommandType.StoredProcedure);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while executing SP: {StoredProcedure}", storedProc);
                throw;
            }
        }


        public Task<IEnumerable<TCustom>> QueryCustomListAsync<TCustom>(string storedProc, object? parameters = null, IDbConnection? connection = null, IDbTransaction? transaction = null) => ExecuteQueryListAsync<TCustom>(storedProc, "Query", parameters, connection, transaction);


        public async Task<(int totalRecords, IEnumerable<TCustom> items)> QueryCustomListWithCountAsync<TCustom>(string storedProc, object? parameters = null)
        {
            try
            {
                _logger.LogInformation("Executing SP: {StoredProcedure} with parameters: {@Parameters}", storedProc, parameters);

                using var connection = CreateConnection();

                using var multi = await connection.QueryMultipleAsync(storedProc, parameters, commandType: CommandType.StoredProcedure);

                var total = await multi.ReadFirstAsync<int>();
                var items = await multi.ReadAsync<TCustom>();

                return (total, items);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while executing SP: {StoredProcedure}", storedProc);
                throw;
            }
        }


        public async Task<(TMetaDto metaDto, IEnumerable<TCustom> items)> QueryCustomListWithMetaDtoAsync<TMetaDto, TCustom>(string storedProc, object? parameters = null)
        {
            try
            {
                _logger.LogInformation("Executing SP: {StoredProcedure} with parameters: {@Parameters}", storedProc, parameters);

                using var connection = CreateConnection();

                using var multi = await connection.QueryMultipleAsync(storedProc, parameters, commandType: CommandType.StoredProcedure);

                var metaDto = await multi.ReadFirstAsync<TMetaDto>();
                var items = await multi.ReadAsync<TCustom>();

                return (metaDto, items);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while executing SP: {StoredProcedure}", storedProc);
                throw;
            }
        }


        public async Task<(int totalRecords, TDashboard dashboardCounts, IEnumerable<TCustom> items)> QueryCustomListWithCountAndDashboardCountAsync<TCustom, TDashboard>(string storedProc, object? parameters = null)
        {
            try
            {
                _logger.LogInformation("Executing SP: {StoredProcedure} with parameters: {@Parameters}", storedProc, parameters);

                using var connection = CreateConnection();

                using var multi = await connection.QueryMultipleAsync(
                    storedProc,
                    parameters,
                    commandType: CommandType.StoredProcedure);

                // 1. Total count
                var total = await multi.ReadFirstAsync<int>();

                // 2. Dashboard counts (generic type T)
                var counts = await multi.ReadFirstOrDefaultAsync<TDashboard>();

                // 3. Items list
                var items = await multi.ReadAsync<TCustom>();

                return (total, counts!, items);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while executing SP: {StoredProcedure}", storedProc);

                throw;
            }
        }


        public Task<IEnumerable<TCustom>> ExportDataAsync<TCustom>(string storedProc, object parameters, IDbConnection? connection = null, IDbTransaction? transaction = null) => ExecuteQueryListAsync<TCustom>(storedProc, "Export", parameters, connection, transaction);


        private async Task<IEnumerable<TCustom>> ExecuteQueryListAsync<TCustom>(string storedProc, string operation, object? parameters = null, IDbConnection? connection = null, IDbTransaction? transaction = null)
        {
            _logger.LogInformation("Executing SP: {StoredProcedure} with parameters: {@Parameters}", storedProc, parameters);

            var dispose = connection == null;
            connection ??= CreateConnection();

            if (dispose) connection.Open();

            try
            {
                return await connection.QueryAsync<TCustom>(storedProc, parameters,
                    transaction: transaction, commandType: CommandType.StoredProcedure);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while executing SP: {StoredProcedure}", storedProc);
                throw;
            }
            finally
            {
                if (dispose) connection.Dispose();
            }
        }

        public async Task<T> IsRegisteredAsync(string storedProc, object parameters)
        {
            try
            {
                _logger.LogInformation("Executing SP: {StoredProcedure} with parameters: {@Parameters}", storedProc, parameters);

                using var connection = CreateConnection();

                return await connection.QueryFirstOrDefaultAsync<T>(storedProc, parameters, commandType: CommandType.StoredProcedure);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while executing SP: {StoredProcedure}", storedProc);
                throw;
            }
        }

        #endregion

        #region Parent-Child Methods & Mapping

        public async Task<TParent?> QuerySingleParentWithChildrenAsync<TParent, TChild>(string storedProc, object? parameters, string childPropertyName, string parentKeyName, string childForeignKeyName)
        {
            try
            {
                _logger.LogInformation("Executing single parent-child SP: {StoredProcedure} with parameters: {@Parameters}", storedProc, parameters);

                using var connection = CreateConnection();

                using var multi = await connection.QueryMultipleAsync(storedProc, parameters, commandType: CommandType.StoredProcedure);

                // Expecting: first result = parent, second result = children
                var parent = await multi.ReadFirstOrDefaultAsync<TParent>();

                if (parent == null) return default;

                var children = multi.IsConsumed ? [] : (await multi.ReadAsync<TChild>()).ToList();

                if (children.Count > 0)
                    MapChildren([parent], children, childPropertyName, parentKeyName, childForeignKeyName);

                return parent;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while executing single parent-child SP: {StoredProcedure}", storedProc);
                throw;
            }
        }


        public async Task<(int totalRecords, TParent? parent)> QuerySingleParentWithChildrenAndCountAsync<TParent, TChild>(string storedProc, object? parameters, string childPropertyName, string parentKeyName, string childForeignKeyName)
        {
            try
            {
                _logger.LogInformation(
                    "Executing single parent-child SP: {StoredProcedure} with parameters: {@Parameters}",
                    storedProc, parameters);

                using var connection = CreateConnection();

                using var multi = await connection.QueryMultipleAsync(
                    storedProc,
                    parameters,
                    commandType: CommandType.StoredProcedure);

                // 1. Read total records
                var totalRecords = await multi.ReadFirstAsync<int>();

                // 2. Read single parent
                var parent = await multi.ReadFirstOrDefaultAsync<TParent>();

                if (parent == null)
                    return (totalRecords, default);

                // 3. Read children
                var children = multi.IsConsumed ? [] : (await multi.ReadAsync<TChild>()).ToList();

                // 4. Map children to parent
                if (children.Count > 0)
                    MapChildren([parent], children, childPropertyName, parentKeyName, childForeignKeyName);

                return (totalRecords, parent);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while executing single parent-child SP: {StoredProcedure}", storedProc);
                throw;
            }
        }


        public async Task<(int totalRecords, IEnumerable<TParent> Items)> QueryMultiParentsOnlyAsync<TParent>(string storedProc, object? parameters = null)
        {
            try
            {
                _logger.LogInformation("Executing parent-only SP: {StoredProcedure} with parameters: {@Parameters}", storedProc, parameters);

                using var connection = _context.CreateConnection();

                using var multi = await connection.QueryMultipleAsync(storedProc, parameters, commandType: CommandType.StoredProcedure);

                // First result set: count
                var totalCount = await multi.ReadFirstAsync<int>();

                // Second result set: parent records
                var parents = (await multi.ReadAsync<TParent>()).ToList();

                return (totalCount, parents);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while fetching parent-only data using SP: {StoredProcedure}", storedProc);
                throw;
            }
        }


        public async Task<(int totalRecords, IEnumerable<TParent> items)> QueryMultiParentsWithChildrenAndCountAsync<TParent, TChild>(string storedProc, object? parameters, string childPropertyName, string parentKeyName, string childForeignKeyName)
        {
            try
            {
                _logger.LogInformation("Executing parent-child SP: {StoredProcedure} with parameters: {@Parameters}", storedProc, parameters);

                using var connection = CreateConnection();

                using var multi = await connection.QueryMultipleAsync(storedProc, parameters, commandType: CommandType.StoredProcedure);

                var totalCount = await multi.ReadFirstAsync<int>();
                var parents = (await multi.ReadAsync<TParent>()).ToList();
                var children = multi.IsConsumed ? [] : (await multi.ReadAsync<TChild>()).ToList();

                if (children.Count != 0)
                    MapChildren(parents, children, childPropertyName, parentKeyName, childForeignKeyName);

                return (totalCount, parents);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while executing parent-child SP: {StoredProcedure}", storedProc);
                throw;
            }
        }


        private static void MapChildren<TParent, TChild>(List<TParent> parents,List<TChild> children,string childPropertyName,string parentKeyName,
     string childForeignKeyName)
        {
            var childProp = typeof(TParent).GetProperty(childPropertyName);
            var parentKeyProp = typeof(TParent).GetProperty(parentKeyName);
            var childKeyProp = typeof(TChild).GetProperty(childForeignKeyName);

            if (childProp == null || parentKeyProp == null || childKeyProp == null)
                return;

            var lookup = parents.ToDictionary(
                p => parentKeyProp.GetValue(p),
                p => p);

            foreach (var child in children)
            {
                var parentKey = childKeyProp.GetValue(child);

                if (parentKey != null && lookup.TryGetValue(parentKey, out var parent))
                {
                    var list = childProp.GetValue(parent) as IList<TChild>;

                    if (list == null)
                    {
                        list = new List<TChild>();
                        childProp.SetValue(parent, list);
                    }

                    list.Add(child);
                }
            }
        }

        #endregion

        #region Command Methods (CRUD)

        public async Task<int> ExecuteAsync(string storedProc, object? parameters = null, IDbConnection? connection = null, IDbTransaction? transaction = null)
        {
            _logger.LogInformation("Executing command SP: {StoredProcedure} with parameters: {@Parameters}", storedProc, parameters);

            var dispose = connection == null;
            connection ??= CreateConnection();

            if (dispose) connection.Open();

            try
            {
                var result = await connection.ExecuteAsync(storedProc, parameters, transaction, commandType: CommandType.StoredProcedure);

                return result < 0 ? 0 : result;
            }
            finally
            {
                if (dispose) connection.Dispose();
            }
        }


        public async Task<TResult> ExecuteScalarAsync<TResult>(string storedProc, object parameters,
            IDbConnection? connection = null, IDbTransaction? transaction = null)
        {
            _logger.LogInformation("Executing scalar SP: {StoredProcedure} with parameters: {@Parameters}", storedProc, parameters);

            var dispose = connection == null;
            connection ??= CreateConnection();

            if (dispose) connection.Open();

            try
            {
                return await connection.QuerySingleAsync<TResult>(storedProc, parameters, transaction: transaction,
                    commandType: CommandType.StoredProcedure);
            }
            finally
            {
                if (dispose) connection.Dispose();
            }
        }

        #endregion
    }
}

import { useState } from 'react';
import PropTypes from 'prop-types';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Filter,
  Download,
  RefreshCw,
  ChevronDown,
  X
} from 'lucide-react';

const DataTable = ({
  data = [],
  columns = [],
  loading = false,
  error = null,
  pagination = {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  },
  onPageChange = () => {},
  onLimitChange = () => {},
  onSearch = () => {},
  onFilter = () => {},
  onRefresh = () => {},
  onExport = null,
  searchable = true,
  filterable = false,
  exportable = false,
  refreshable = true,
  filters = [],
  activeFilters = {},
  actions = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState(activeFilters);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleFilterChange = (filterKey, value) => {
    const newFilters = { ...localFilters, [filterKey]: value };
    setLocalFilters(newFilters);
    onFilter(newFilters);
  };

  const clearFilters = () => {
    setLocalFilters({});
    onFilter({});
  };

  const renderCell = (item, column) => {
    if (column.render) {
      return column.render(item[column.key], item);
    }
    
    if (column.type === 'badge') {
      const badgeClass = column.badgeColors?.[item[column.key]] || 'bg-gray-100 text-gray-800';
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeClass}`}>
          {item[column.key]}
        </span>
      );
    }
    
    if (column.type === 'date') {
      return new Date(item[column.key]).toLocaleDateString();
    }
    
    if (column.type === 'currency') {
      return `$${item[column.key]?.toLocaleString() || '0'}`;
    }
    
    return item[column.key] || '-';
  };

  const renderFilterDropdown = (filter) => (
    <div key={filter.key} className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {filter.label}
      </label>
      <select
        value={localFilters[filter.key] || ''}
        onChange={(e) => handleFilterChange(filter.key, e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All {filter.label}</option>
        {filter.options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <X className="h-5 w-5 text-red-400 mr-2" />
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200">
      {/* Header with search and controls */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            {searchable && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
              </div>
            )}
            
            {filterable && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Filter className="h-4 w-4" />
                Filters
                <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {refreshable && (
              <button
                onClick={onRefresh}
                disabled={loading}
                className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            )}
            
            {exportable && onExport && (
              <button
                onClick={onExport}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
            )}
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && filterable && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filters.map(renderFilterDropdown)}
            </div>
            {Object.keys(localFilters).length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.title}
                </th>
              ))}
              {actions.length > 0 && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={columns.length + (actions.length > 0 ? 1 : 0)} className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center">
                    <RefreshCw className="h-5 w-5 animate-spin text-gray-400 mr-2" />
                    Loading...
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions.length > 0 ? 1 : 0)} className="px-6 py-4 text-center text-gray-500">
                  No data available
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={item.id || index} className="hover:bg-gray-50">
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {renderCell(item, column)}
                    </td>
                  ))}
                  {actions.length > 0 && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        {actions.map((action, actionIndex) => (
                          <button
                            key={actionIndex}
                            onClick={() => action.onClick(item)}
                            className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${action.className || 'text-blue-600 hover:text-blue-900'}`}
                            title={action.title}
                          >
                            {action.icon && <action.icon className="h-3 w-3 mr-1" />}
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-sm text-gray-700">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} results
            </div>
            
            <div className="flex items-center gap-2">
              <select
                value={pagination.limit}
                onChange={(e) => onLimitChange(parseInt(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              
              <button
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <span className="px-3 py-1 text-sm">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              
              <button
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="p-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

DataTable.propTypes = {
  data: PropTypes.array,
  columns: PropTypes.array,
  loading: PropTypes.bool,
  error: PropTypes.string,
  pagination: PropTypes.object,
  onPageChange: PropTypes.func,
  onLimitChange: PropTypes.func,
  onSearch: PropTypes.func,
  onFilter: PropTypes.func,
  onRefresh: PropTypes.func,
  onExport: PropTypes.func,
  searchable: PropTypes.bool,
  filterable: PropTypes.bool,
  exportable: PropTypes.bool,
  refreshable: PropTypes.bool,
  filters: PropTypes.array,
  activeFilters: PropTypes.object,
  actions: PropTypes.array
};

export default DataTable;
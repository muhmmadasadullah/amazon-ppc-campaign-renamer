import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export function Dashboard({ stats, filters, onFilterChange, campaigns }) {
  // Chart data for campaign type distribution
  const chartData = {
    labels: ['Sponsored Products', 'Sponsored Brands', 'Sponsored Display', 'Sponsored Brands Video'],
    datasets: [
      {
        data: [stats.sp, stats.sb, stats.sd, stats.sbv],
        backgroundColor: [
          '#3B82F6', // Blue for SP
          '#10B981', // Green for SB
          '#F59E0B', // Yellow for SD
          '#8B5CF6'  // Purple for SBV
        ],
        borderColor: [
          '#2563EB',
          '#059669',
          '#D97706',
          '#7C3AED'
        ],
        borderWidth: 2,
        hoverOffset: 4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const percentage = ((context.raw / stats.total) * 100).toFixed(1);
            return `${context.label}: ${context.raw} (${percentage}%)`;
          }
        }
      }
    }
  };

  // Get unique values for filter options
  const uniqueAsins = Array.from(new Set(
    campaigns.flatMap(c => c.advertisedAsins)
  )).filter(Boolean).sort();

  const matchTypeOptions = [
    { value: 'all', label: 'All Match Types' },
    { value: 'auto', label: 'Auto Targeting' },
    { value: 'ex', label: 'Exact Match' },
    { value: 'ph', label: 'Phrase Match' },
    { value: 'br', label: 'Broad Match' },
    { value: 'pat', label: 'Product Targeting' }
  ];

  const badgeOptions = [
    { value: 'all', label: 'All Badges' },
    { value: 'skc', label: 'Single Keyword Campaigns' },
    { value: 'def', label: 'Defensive Campaigns' },
    { value: 'bkws', label: 'Branded Keywords' },
    { value: 'tos', label: 'Top of Search' },
    { value: 'pp', label: 'Product Pages' }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <div className="stats-card bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="stat-value text-blue-600 dark:text-blue-400 text-2xl font-bold">
            {stats.sp}
          </div>
          <div className="stat-title text-blue-600 dark:text-blue-400 text-xs font-medium">
            Sponsored Products
          </div>
        </div>
        
        <div className="stats-card bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="stat-value text-green-600 dark:text-green-400 text-2xl font-bold">
            {stats.sb}
          </div>
          <div className="stat-title text-green-600 dark:text-green-400 text-xs font-medium">
            Sponsored Brands
          </div>
        </div>
        
        <div className="stats-card bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="stat-value text-yellow-600 dark:text-yellow-400 text-2xl font-bold">
            {stats.sd}
          </div>
          <div className="stat-title text-yellow-600 dark:text-yellow-400 text-xs font-medium">
            Sponsored Display
          </div>
        </div>
        
        <div className="stats-card bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
          <div className="stat-value text-purple-600 dark:text-purple-400 text-2xl font-bold">
            {stats.sbv}
          </div>
          <div className="stat-title text-purple-600 dark:text-purple-400 text-xs font-medium">
            SB Video
          </div>
        </div>
        
        <div className="stats-card bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="stat-value text-gray-600 dark:text-gray-400 text-2xl font-bold">
            {stats.auto}
          </div>
          <div className="stat-title text-gray-600 dark:text-gray-400 text-xs font-medium">
            Auto Campaigns
          </div>
        </div>
        
        <div className="stats-card bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="stat-value text-gray-600 dark:text-gray-400 text-2xl font-bold">
            {stats.manual}
          </div>
          <div className="stat-title text-gray-600 dark:text-gray-400 text-xs font-medium">
            Manual Campaigns
          </div>
        </div>
        
        <div className="stats-card bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
          <div className="stat-value text-indigo-600 dark:text-indigo-400 text-2xl font-bold">
            {stats.skc}
          </div>
          <div className="stat-title text-indigo-600 dark:text-indigo-400 text-xs font-medium">
            SKC Campaigns
          </div>
        </div>
        
        <div className="stats-card bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="stat-value text-red-600 dark:text-red-400 text-2xl font-bold">
            {stats.defensive}
          </div>
          <div className="stat-title text-red-600 dark:text-red-400 text-xs font-medium">
            Defensive
          </div>
        </div>
      </div>

      {/* Chart and Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Campaign Distribution Chart */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-lg">Campaign Type Distribution</h2>
            <div className="h-64">
              <Doughnut data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="lg:col-span-2 card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-lg">Filters</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Campaign Type Filter */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Campaign Type</span>
                </label>
                <select 
                  className="select select-bordered select-sm"
                  value={filters.campaignType}
                  onChange={(e) => onFilterChange('campaignType', e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="sp">Sponsored Products</option>
                  <option value="sb">Sponsored Brands</option>
                  <option value="sd">Sponsored Display</option>
                  <option value="sbv">Sponsored Brands Video</option>
                </select>
              </div>

              {/* Match Type Filter */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Match Type</span>
                </label>
                <select 
                  className="select select-bordered select-sm"
                  value={filters.matchType}
                  onChange={(e) => onFilterChange('matchType', e.target.value)}
                >
                  {matchTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Badge Filter */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">
                    Badges
                    <div className="tooltip tooltip-right" data-tip="Special campaign attributes detected automatically">
                      <svg className="w-4 h-4 ml-1 inline" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </span>
                </label>
                <select 
                  className="select select-bordered select-sm"
                  value={filters.badge}
                  onChange={(e) => onFilterChange('badge', e.target.value)}
                >
                  {badgeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Advertised ASIN Filter */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">
                    Advertised ASIN
                    <div className="tooltip tooltip-right" data-tip="We only show ASINs from enabled Product Ad rows. ASINs you target (PAT) or that only appear in names aren't listed.">
                      <svg className="w-4 h-4 ml-1 inline" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </span>
                </label>
                <select 
                  className="select select-bordered select-sm"
                  value={filters.advertisedAsin}
                  onChange={(e) => onFilterChange('advertisedAsin', e.target.value)}
                >
                  <option value="all">All ASINs ({uniqueAsins.length})</option>
                  {uniqueAsins.map(asin => (
                    <option key={asin} value={asin}>
                      {asin}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search */}
              <div className="form-control md:col-span-2">
                <label className="label">
                  <span className="label-text font-medium">Search</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search campaign names or ASINs..."
                    className="input input-bordered input-sm w-full pr-8"
                    value={filters.search}
                    onChange={(e) => onFilterChange('search', e.target.value)}
                  />
                  {filters.search && (
                    <button
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => onFilterChange('search', '')}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
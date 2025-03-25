import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';

const PlatformComparison = () => {
    const [portfolioSize, setPortfolioSize] = useState(50000);
    const [accountType, setAccountType] = useState('All');
    const [showTooltip, setShowTooltip] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  
  // Platform comparison data
  const platformData = [
    {
      id: 1,
      name: "Vanguard Investor",
      logo: "/api/placeholder/80/40",
      accounts: ["ISA", "SIPP", "GIA"],
      platformFee: { percent: 0.15, cap: 375, fixed: null },
      fundFeeRange: { min: 0.06, max: 0.48, avg: 0.22 },
      tradingCosts: { funds: 0, etfs: 0, shares: null },
      minimumInvestment: 500,
      numFunds: 75,
      pros: ["Very low platform fees", "Low-cost index funds", "Simple platform"],
      cons: ["Limited fund selection", "No direct share dealing", "Basic features"],
      bestFor: "Index fund investors with portfolios up to £250k"
    },
    {
      id: 2,
      name: "Hargreaves Lansdown",
      logo: "/api/placeholder/80/40",
      accounts: ["ISA", "SIPP", "GIA", "LISA", "JISA"],
      platformFee: { percent: 0.45, cap: null, fixed: null, tiered: true },
      fundFeeRange: { min: 0.05, max: 1.5, avg: 0.45 },
      tradingCosts: { funds: 0, etfs: 11.95, shares: 11.95 },
      minimumInvestment: 100,
      numFunds: 3000,
      pros: ["Excellent customer service", "Comprehensive investment options", "User-friendly platform"],
      cons: ["Higher platform fees", "Expensive share dealing costs", "No fee cap for funds"],
      bestFor: "Beginners wanting guidance and extensive research"
    },
    {
      id: 3,
      name: "AJ Bell Youinvest",
      logo: "/api/placeholder/80/40",
      accounts: ["ISA", "SIPP", "GIA", "LISA", "JISA"],
      platformFee: { percent: 0.25, cap: null, fixed: null, tiered: true },
      fundFeeRange: { min: 0.05, max: 1.5, avg: 0.35 },
      tradingCosts: { funds: 1.50, etfs: 9.95, shares: 9.95 },
      minimumInvestment: 50,
      numFunds: 2000,
      pros: ["Good middle-ground on fees", "Wide investment selection", "Good mobile app"],
      cons: ["Fund dealing charges", "No platform fee cap", "Less research than premium platforms"],
      bestFor: "Cost-conscious investors who still want good choice"
    },
    {
      id: 4,
      name: "Interactive Investor",
      logo: "/api/placeholder/80/40",
      accounts: ["ISA", "SIPP", "GIA", "JISA"],
      platformFee: { percent: null, cap: null, fixed: 19.99, tiered: false },
      fundFeeRange: { min: 0.05, max: 1.5, avg: 0.35 },
      tradingCosts: { funds: 3.99, etfs: 3.99, shares: 3.99 },
      minimumInvestment: 25,
      numFunds: 3000,
      pros: ["Fixed monthly fee", "Free monthly trades", "Great for larger portfolios"],
      cons: ["Expensive for small portfolios", "Higher trading fees beyond allowance", "Less beginner-friendly"],
      bestFor: "Larger portfolios (£50k+) and frequent traders"
    },
    {
      id: 5,
      name: "Fidelity Personal Investing",
      logo: "/api/placeholder/80/40",
      accounts: ["ISA", "SIPP", "GIA", "JISA"],
      platformFee: { percent: 0.35, cap: 45, fixed: null, tiered: true },
      fundFeeRange: { min: 0.05, max: 1.5, avg: 0.35 },
      tradingCosts: { funds: 0, etfs: 10, shares: 10 },
      minimumInvestment: 50,
      numFunds: 2500,
      pros: ["Low fee cap for ISA & GIA", "Good fund selection", "Established brand"],
      cons: ["Higher platform fees for small portfolios", "Expensive share dealing", "No LISA"],
      bestFor: "Fund investors with medium-sized portfolios"
    },
    {
      id: 6,
      name: "iWeb",
      logo: "/api/placeholder/80/40",
      accounts: ["ISA", "SIPP", "GIA"],
      platformFee: { percent: 0, cap: null, fixed: 100, tiered: false, oneOff: true },
      fundFeeRange: { min: 0.05, max: 1.5, avg: 0.35 },
      tradingCosts: { funds: 5, etfs: 5, shares: 5 },
      minimumInvestment: 25,
      numFunds: 2000,
      pros: ["One-off account opening fee only", "No platform fees", "Low dealing charges"],
      cons: ["Basic interface", "Limited research", "£100 setup fee"],
      bestFor: "Buy and hold investors with larger portfolios"
    },
    {
      id: 7,
      name: "Freetrade",
      logo: "/api/placeholder/80/40",
      accounts: ["ISA", "SIPP", "GIA"],
      platformFee: { percent: 0, cap: null, fixed: 59.88, tiered: false, subscription: true },
      fundFeeRange: { min: 0.05, max: 0.99, avg: 0.12 },
      tradingCosts: { funds: 0, etfs: 0, shares: 0 },
      minimumInvestment: 1,
      numFunds: 200,
      pros: ["Commission-free trading", "Simple app-based interface", "Fractional shares"],
      cons: ["Limited fund range", "Monthly subscription fee", "Basic research tools"],
      bestFor: "Beginner investors and ETF focused investors"
    },
    {
      id: 8,
      name: "Charles Stanley Direct",
      logo: "/api/placeholder/80/40",
      accounts: ["ISA", "SIPP", "GIA", "JISA"],
      platformFee: { percent: 0.35, cap: null, fixed: null, tiered: true },
      fundFeeRange: { min: 0.05, max: 1.5, avg: 0.32 },
      tradingCosts: { funds: 0, etfs: 11.50, shares: 11.50 },
      minimumInvestment: 50,
      numFunds: 2500,
      pros: ["Good customer service", "Strong mobile app", "Frequent trader discounts"],
      cons: ["Higher platform fees", "Expensive share dealing", "No fee cap"],
      bestFor: "Fund investors who need good customer support"
    },
    {
      id: 9,
      name: "Bestinvest",
      logo: "/api/placeholder/80/40",
      accounts: ["ISA", "SIPP", "GIA", "JISA"],
      platformFee: { percent: 0.40, cap: null, fixed: null, tiered: true },
      fundFeeRange: { min: 0.05, max: 1.5, avg: 0.35 },
      tradingCosts: { funds: 0, etfs: 7.50, shares: 7.50 },
      minimumInvestment: 100,
      numFunds: 2500,
      pros: ["Strong research", "Expert fund selection", "Free fund dealing"],
      cons: ["Higher platform fees", "No fee cap", "Less competitive for larger portfolios"],
      bestFor: "Investors seeking research and fund recommendations"
    }
  ];

  // Filter platforms by account type
  const filteredPlatforms = accountType === 'All' 
    ? platformData 
    : platformData.filter(platform => platform.accounts.includes(accountType));

  // Sorting function for the table
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Calculate total cost for the selected portfolio size
  const calculateTotalCost = (platform) => {
    // Calculate annual platform cost
    let platformCost = 0;
    if (platform.platformFee.percent) {
      // Fix: Change portfolio.Size to portfolioSize
      platformCost = portfolioSize * (platform.platformFee.percent / 100);
      // Apply fee cap if it exists
      if (platform.platformFee.cap && platformCost > platform.platformFee.cap) {
        platformCost = platform.platformFee.cap;
      }
    } else if (platform.platformFee.fixed) {
      // If it's a one-off fee, amortize it over 10 years for comparison
      if (platform.platformFee.oneOff) {
        platformCost = platform.platformFee.fixed / 10;
      } else {
        platformCost = platform.platformFee.fixed * 12; // Annual cost
      }
    }
    
    // Estimate fund fees (assume 100% of portfolio in funds with average fee)
    const fundCost = portfolioSize * (platform.fundFeeRange.avg / 100);
    
    // Estimate trading costs (assume 12 trades per year)
    let tradingCost = 0;
    if (platform.tradingCosts.funds !== null) {
      tradingCost = platform.tradingCosts.funds * 12;
    }
    
    return platformCost + fundCost + tradingCost;
  };

  // Sort the filtered platforms
  const sortedPlatforms = React.useMemo(() => {
    let sortablePlatforms = [...filteredPlatforms];
    if (sortConfig.key) {
      sortablePlatforms.sort((a, b) => {
        // Special case for total cost
        if (sortConfig.key === 'totalCost') {
          const costA = calculateTotalCost(a);
          const costB = calculateTotalCost(b);
          if (costA < costB) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
          }
          if (costA > costB) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
          }
          return 0;
        }
        
        // Special case for platform fee
        if (sortConfig.key === 'platformFee') {
          // For percentage fees
          if (a.platformFee.percent !== null && b.platformFee.percent !== null) {
            return sortConfig.direction === 'ascending'
              ? a.platformFee.percent - b.platformFee.percent
              : b.platformFee.percent - a.platformFee.percent;
          }
          // For fixed fees
          if (a.platformFee.fixed !== null && b.platformFee.fixed !== null) {
            return sortConfig.direction === 'ascending'
              ? a.platformFee.fixed - b.platformFee.fixed
              : b.platformFee.fixed - a.platformFee.fixed;
          }
          // If one is percentage and one is fixed, compare based on current portfolio size
          if (a.platformFee.percent !== null && b.platformFee.fixed !== null) {
            const aFee = Math.min(portfolioSize * (a.platformFee.percent / 100), a.platformFee.cap || Infinity);
            const bFee = b.platformFee.oneOff ? b.platformFee.fixed / 10 : b.platformFee.fixed * 12;
            return sortConfig.direction === 'ascending' ? aFee - bFee : bFee - aFee;
          }
          if (a.platformFee.fixed !== null && b.platformFee.percent !== null) {
            const aFee = a.platformFee.oneOff ? a.platformFee.fixed / 10 : a.platformFee.fixed * 12;
            const bFee = Math.min(portfolioSize * (b.platformFee.percent / 100), b.platformFee.cap || Infinity);
            return sortConfig.direction === 'ascending' ? aFee - bFee : bFee - aFee;
          }
        }
        
        // For nested properties
        if (sortConfig.key === 'fundFees') {
          return sortConfig.direction === 'ascending'
            ? a.fundFeeRange.avg - b.fundFeeRange.avg
            : b.fundFeeRange.avg - a.fundFeeRange.avg;
        }
        
        if (sortConfig.key === 'tradingCosts') {
          const aTrading = a.tradingCosts.funds || a.tradingCosts.etfs || 0;
          const bTrading = b.tradingCosts.funds || b.tradingCosts.etfs || 0;
          return sortConfig.direction === 'ascending'
            ? aTrading - bTrading
            : bTrading - aTrading;
        }
        
        // For regular properties
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortablePlatforms;
  }, [filteredPlatforms, sortConfig, portfolioSize]);

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Tooltip content
  const tooltipContent = {
    platformFee: "Platform fees are charges for administering your investments. They can be percentage-based, fixed, or tiered based on your portfolio value.",
    fundFees: "Fund fees (OCF) are charged by fund managers for running the fund. They vary by fund type, with index trackers typically being cheaper than active funds.",
    tradingCosts: "Trading costs include dealing charges when buying/selling investments and can vary between funds, ETFs, and shares.",
    totalCost: "Total cost shows the estimated annual cost for your selected portfolio size, including platform fees, average fund fees, and estimated trading costs."
  };

  // Function to render the platform fee
  const renderPlatformFee = (platform) => {
    if (platform.platformFee.percent !== null) {
      return (
        <>
          {platform.platformFee.percent}%
          {platform.platformFee.cap && <span className="text-xs ml-1">(capped at £{platform.platformFee.cap}/yr)</span>}
          {platform.platformFee.tiered && <span className="text-xs ml-1">(tiered)</span>}
        </>
      );
    } else if (platform.platformFee.fixed !== null) {
      return (
        <>
          £{platform.platformFee.fixed}
          {platform.platformFee.oneOff ? <span className="text-xs ml-1">(one-off)</span> : <span className="text-xs ml-1">(/month)</span>}
        </>
      );
    }
    return 'N/A';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">UK Platform Comparison</h2>
      </div>
      
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <p className="text-gray-600 mb-4">
          Compare UK investment platforms based on fees and features. Adjust your portfolio size and account type to see which platform offers the best value for your needs.
        </p>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="portfolioSize" className="block text-sm font-medium text-gray-700 mb-1">
              Portfolio Size
            </label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">£</span>
              </div>
              <input
                type="number"
                id="portfolioSize"
                className="focus:ring-black focus:border-black block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md p-2 border"
                value={portfolioSize}
                onChange={(e) => setPortfolioSize(Number(e.target.value))}
                min="1000"
                step="1000"
              />
            </div>
            
            <div className="mt-2 flex flex-wrap gap-2">
              <button 
                onClick={() => setPortfolioSize(10000)}
                className={`py-1 px-3 text-xs rounded-full ${portfolioSize === 10000 ? 'bg-black text-white' : 'bg-gray-200 text-gray-800'}`}
              >
                £10k
              </button>
              <button 
                onClick={() => setPortfolioSize(50000)}
                className={`py-1 px-3 text-xs rounded-full ${portfolioSize === 50000 ? 'bg-black text-white' : 'bg-gray-200 text-gray-800'}`}
              >
                £50k
              </button>
              <button 
                onClick={() => setPortfolioSize(100000)}
                className={`py-1 px-3 text-xs rounded-full ${portfolioSize === 100000 ? 'bg-black text-white' : 'bg-gray-200 text-gray-800'}`}
              >
                £100k
              </button>
              <button 
                onClick={() => setPortfolioSize(250000)}
                className={`py-1 px-3 text-xs rounded-full ${portfolioSize === 250000 ? 'bg-black text-white' : 'bg-gray-200 text-gray-800'}`}
              >
                £250k
              </button>
              <button 
                onClick={() => setPortfolioSize(500000)}
                className={`py-1 px-3 text-xs rounded-full ${portfolioSize === 500000 ? 'bg-black text-white' : 'bg-gray-200 text-gray-800'}`}
              >
                £500k
              </button>
            </div>
          </div>
          
          <div>
            <label htmlFor="accountType" className="block text-sm font-medium text-gray-700 mb-1">
              Account Type
            </label>
            <select
              id="accountType"
              className="focus:ring-black focus:border-black block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
              value={accountType}
              onChange={(e) => setAccountType(e.target.value)}
            >
              <option value="All">All Account Types</option>
              <option value="ISA">Stocks & Shares ISA</option>
              <option value="SIPP">SIPP (Pension)</option>
              <option value="GIA">General Investment Account</option>
              <option value="LISA">Lifetime ISA</option>
              <option value="JISA">Junior ISA</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Platform
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('platformFee')}
              >
                <div className="flex items-center">
                  Platform Fee
                  {sortConfig.key === 'platformFee' && (
                    <span className="ml-1">
                      {sortConfig.direction === 'ascending' 
                        ? <LucideIcons.ChevronUp size={14} /> 
                        : <LucideIcons.ChevronDown size={14} />}
                    </span>
                  )}
                  <button 
                    className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowTooltip('platformFee');
                    }}
                  >
                    <LucideIcons.HelpCircle size={14} />
                  </button>
                </div>
                {showTooltip === 'platformFee' && (
                  <div className="absolute z-10 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
                    {tooltipContent.platformFee}
                    <button 
                      className="absolute top-1 right-1 text-white hover:text-gray-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowTooltip(null);
                      }}
                    >
                      <LucideIcons.X size={14} />
                    </button>
                  </div>
                )}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('fundFees')}
              >
                <div className="flex items-center">
                  Fund Fees
                  {sortConfig.key === 'fundFees' && (
                    <span className="ml-1">
                      {sortConfig.direction === 'ascending' 
                        ? <LucideIcons.ChevronUp size={14} /> 
                        : <LucideIcons.ChevronDown size={14} />}
                    </span>
                  )}
                  <button 
                    className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowTooltip('fundFees');
                    }}
                  >
                    <LucideIcons.HelpCircle size={14} />
                  </button>
                </div>
                {showTooltip === 'fundFees' && (
                  <div className="absolute z-10 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
                    {tooltipContent.fundFees}
                    <button 
                      className="absolute top-1 right-1 text-white hover:text-gray-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowTooltip(null);
                      }}
                    >
                      <LucideIcons.X size={14} />
                    </button>
                  </div>
                )}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('tradingCosts')}
              >
                <div className="flex items-center">
                  Trading Costs
                  {sortConfig.key === 'tradingCosts' && (
                    <span className="ml-1">
                      {sortConfig.direction === 'ascending' 
                        ? <LucideIcons.ChevronUp size={14} /> 
                        : <LucideIcons.ChevronDown size={14} />}
                    </span>
                  )}
                  <button 
                    className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowTooltip('tradingCosts');
                    }}
                  >
                    <LucideIcons.HelpCircle size={14} />
                  </button>
                </div>
                {showTooltip === 'tradingCosts' && (
                  <div className="absolute z-10 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
                    {tooltipContent.tradingCosts}
                    <button 
                      className="absolute top-1 right-1 text-white hover:text-gray-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowTooltip(null);
                      }}
                    >
                      <LucideIcons.X size={14} />
                    </button>
                  </div>
                )}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('totalCost')}
              >
                <div className="flex items-center">
                  Estimated Cost for {formatCurrency(portfolioSize)}
                  {sortConfig.key === 'totalCost' && (
                    <span className="ml-1">
                      {sortConfig.direction === 'ascending' 
                        ? <LucideIcons.ChevronUp size={14} /> 
                        : <LucideIcons.ChevronDown size={14} />}
                    </span>
                  )}
                  <button 
                    className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowTooltip('totalCost');
                    }}
                  >
                    <LucideIcons.HelpCircle size={14} />
                  </button>
                </div>
                {showTooltip === 'totalCost' && (
                  <div className="absolute z-10 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
                    {tooltipContent.totalCost}
                    <button 
                      className="absolute top-1 right-1 text-white hover:text-gray-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowTooltip(null);
                      }}
                    >
                      <LucideIcons.X size={14} />
                    </button>
                  </div>
                )}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Best For
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedPlatforms.map((platform, index) => {
              const totalCost = calculateTotalCost(platform);
              const isLowestCost = index === 0 && sortConfig.key === 'totalCost' && sortConfig.direction === 'ascending';
              
              return (
                <tr 
                  key={platform.id}
                  className={isLowestCost ? 'bg-green-50' : ''}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img className="h-10 w-20 object-contain" src={platform.logo} alt={`${platform.name} logo`} />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{platform.name}</div>
                        <div className="text-xs text-gray-500">
                          {platform.accounts.join(', ')}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {renderPlatformFee(platform)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {platform.fundFeeRange.avg}% avg
                    <div className="text-xs text-gray-400">
                      Range: {platform.fundFeeRange.min}% - {platform.fundFeeRange.max}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>Funds: {platform.tradingCosts.funds === 0 ? 'Free' : platform.tradingCosts.funds ? `£${platform.tradingCosts.funds}` : 'N/A'}</div>
                    <div>ETFs: {platform.tradingCosts.etfs === 0 ? 'Free' : platform.tradingCosts.etfs ? `£${platform.tradingCosts.etfs}` : 'N/A'}</div>
                    <div>Shares: {platform.tradingCosts.shares === 0 ? 'Free' : platform.tradingCosts.shares ? `£${platform.tradingCosts.shares}` : 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${isLowestCost ? 'text-green-600' : 'text-gray-900'}`}>
                      {formatCurrency(totalCost)}/year
                    </div>
                    <div className="text-xs text-gray-500">
                      {(totalCost / portfolioSize * 100).toFixed(2)}% of portfolio
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {platform.bestFor}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-700 mb-4">How To Use This Comparison</h3>
        
        <div className="prose max-w-none text-sm">
          <p>
            Finding the right investment platform depends on your specific needs and investment style. Here are some tips:
          </p>
          
          <ul>
            <li><strong>Consider your portfolio size</strong> - Fixed fee platforms often become better value than percentage-based platforms once your portfolio exceeds around £40,000-£50,000.</li>
            <li><strong>Think about your trading frequency</strong> - If you trade frequently, lower dealing charges may be more important than the platform fee.</li>
            <li><strong>Check for fee caps</strong> - Some platforms cap their percentage fees at a certain amount, which can be beneficial for larger portfolios.</li>
            <li><strong>Look beyond fees</strong> - Consider the user experience, customer service, and range of investments available.</li>
            <li><strong>Multiple accounts?</strong> - If you have ISAs, SIPPs, and other accounts, check if the platform offers discounted fees for multiple accounts.</li>
          </ul>
          
          <p>
            Remember: The cheapest platform isn't always the best. Consider what features and services are most important to you.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlatformComparison;
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import * as LucideIcons from 'lucide-react';
import { useRegion } from '../RegionContext';

const USFeeCalculator = () => {
  const { formatCurrency, formatPercentage } = useRegion();

  // State for form inputs
  const [initialInvestment, setInitialInvestment] = useState(10000);
  const [annualContribution, setAnnualContribution] = useState(5000);
  const [investmentPeriod, setInvestmentPeriod] = useState(30);
  const [expectedReturn, setExpectedReturn] = useState(7);
  const [expenseRatio, setExpenseRatio] = useState(0.5);
  const [advisoryFee, setAdvisoryFee] = useState(1);
  const [tradingCosts, setTradingCosts] = useState(0.1);
  const [advancedMode, setAdvancedMode] = useState(false);
  const [showTooltip, setShowTooltip] = useState(null);
  
  // US Specific settings
  const [accountType, setAccountType] = useState('401k');
  const [includeCapitalGainsTax, setIncludeCapitalGainsTax] = useState(false);
  const [taxBracket, setTaxBracket] = useState('medium'); // low, medium, high
  const [contribution401kLimit, setContribution401kLimit] = useState(23000); // 2025 estimate
  const [contributionIRALimit, setContributionIRALimit] = useState(7000); // 2025 estimate
  
  // Selected fund/provider preset
  const [selectedProvider, setSelectedProvider] = useState(null);
  
  // US Fund/Provider presets
  const providerPresets = [
    { name: "Vanguard", expenseRatio: 0.04, tradingCosts: 0, advisoryFee: 0 },
    { name: "Fidelity", expenseRatio: 0.05, tradingCosts: 0, advisoryFee: 0 },
    { name: "Schwab", expenseRatio: 0.05, tradingCosts: 0, advisoryFee: 0 },
    { name: "iShares (BlackRock)", expenseRatio: 0.06, tradingCosts: 0, advisoryFee: 0 },
    { name: "SPDR (State Street)", expenseRatio: 0.09, tradingCosts: 0, advisoryFee: 0 },
    { name: "Robo-Advisor", expenseRatio: 0.05, tradingCosts: 0, advisoryFee: 0.25 },
    { name: "Financial Advisor", expenseRatio: 0.2, tradingCosts: 0, advisoryFee: 1 },
    { name: "Typical Active Funds", expenseRatio: 0.75, tradingCosts: 0.2, advisoryFee: 0 },
    { name: "Typical Target Date Funds", expenseRatio: 0.45, tradingCosts: 0, advisoryFee: 0 },
  ];
  
  // State for calculation results
  const [withoutFeesResult, setWithoutFeesResult] = useState(0);
  const [withFeesResult, setWithFeesResult] = useState(0);
  const [feesTotal, setFeesTotal] = useState(0);
  const [feePercentage, setFeePercentage] = useState(0);
  const [tRexScore, setTRexScore] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [scenarioName, setScenarioName] = useState('My US Investment');
  const [savedScenarios, setSavedScenarios] = useState([]);
  
  // Tax rates based on US tax brackets (2025 estimates)
  const taxRates = {
    low: { income: 12, longTermGains: 0, shortTermGains: 12 },
    medium: { income: 22, longTermGains: 15, shortTermGains: 22 },
    high: { income: 32, longTermGains: 20, shortTermGains: 32 }
  };

  // Apply provider preset
  const applyProviderPreset = (provider) => {
    setExpenseRatio(provider.expenseRatio);
    setTradingCosts(provider.tradingCosts);
    setAdvisoryFee(provider.advisoryFee);
    setSelectedProvider(provider.name);
  };

  // Calculate investment growth
  const calculateGrowth = () => {
    // Calculate total fee percentage
    let totalFeePercentage = expenseRatio;
    
    if (advancedMode) {
      totalFeePercentage += advisoryFee + tradingCosts;
    }
    
    // Tax drag calculations for taxable accounts
    let taxDrag = 0;
    
    if (accountType === 'Taxable' && includeCapitalGainsTax) {
      // Simplified tax drag calculation for taxable accounts
      // Assume 2% dividend yield taxed at dividend rate
      const dividendYield = 2;
      const dividendTaxRate = taxRates[taxBracket].longTermGains / 100;
      const dividendTaxDrag = dividendYield * dividendTaxRate;
      
      // Assume 20% of portfolio is sold each year with 50% being gains
      const turnoverRate = 0.2;
      const gainPercentage = 0.5;
      const capitalGainsTaxRate = taxRates[taxBracket].longTermGains / 100;
      const cgtDrag = turnoverRate * gainPercentage * capitalGainsTaxRate * expectedReturn;
      
      taxDrag = dividendTaxDrag + cgtDrag;
      totalFeePercentage += taxDrag;
    }
    
    // Check contribution limits for tax-advantaged accounts
    let yearlyContribution = annualContribution;
    if (accountType === '401k' || accountType === '403b') {
      yearlyContribution = Math.min(annualContribution, contribution401kLimit);
    } else if (accountType === 'IRA' || accountType === 'Roth IRA') {
      yearlyContribution = Math.min(annualContribution, contributionIRALimit);
    }
    
    const withoutFees = calculateInvestmentGrowth(initialInvestment, yearlyContribution, investmentPeriod, expectedReturn, 0);
    const withFees = calculateInvestmentGrowth(initialInvestment, yearlyContribution, investmentPeriod, expectedReturn, totalFeePercentage);
    
    const totalFees = withoutFees - withFees;
    const feeImpactPercentage = (totalFees / withoutFees) * 100;
    const tRex = 100 - feeImpactPercentage;
    
    setWithoutFeesResult(withoutFees);
    setWithFeesResult(withFees);
    setFeesTotal(totalFees);
    setFeePercentage(feeImpactPercentage);
    setTRexScore(tRex);
    
    // Generate chart data
    const data = [];
    
    for (let year = 0; year <= investmentPeriod; year++) {
      const withoutFeesAtYear = calculateInvestmentGrowth(initialInvestment, yearlyContribution, year, expectedReturn, 0);
      const withFeesAtYear = calculateInvestmentGrowth(initialInvestment, yearlyContribution, year, expectedReturn, totalFeePercentage);
      const feesAtYear = withoutFeesAtYear - withFeesAtYear;
      
      data.push({
        year,
        withoutFees: Math.round(withoutFeesAtYear),
        withFees: Math.round(withFeesAtYear),
        feesLost: Math.round(feesAtYear),
        cumulativeFees: Math.round(feesAtYear)
      });
    }
    
    setChartData(data);
    setHasCalculated(true);
  };

  // Core calculation function
  const calculateInvestmentGrowth = (initial, annual, years, returnRate, feeRate) => {
    const effectiveReturn = (returnRate - feeRate) / 100;
    let totalAmount = initial;
    
    for (let i = 0; i < years; i++) {
      totalAmount = totalAmount * (1 + effectiveReturn) + annual;
    }
    
    return totalAmount;
  };
  
  // Save current scenario
  const saveScenario = () => {
    const newScenario = {
      id: Date.now(),
      name: scenarioName,
      accountType,
      initialInvestment,
      annualContribution,
      investmentPeriod,
      expectedReturn,
      expenseRatio,
      advisoryFee: advancedMode ? advisoryFee : 0,
      tradingCosts: advancedMode ? tradingCosts : 0,
      taxBracket: accountType === 'Taxable' ? taxBracket : null,
      includeCapitalGainsTax: accountType === 'Taxable' ? includeCapitalGainsTax : false,
      tRexScore,
      totalValue: withFeesResult,
      feesTotal
    };
    
    setSavedScenarios([...savedScenarios, newScenario]);
  };
  
  // Export results as PDF
  const exportResults = () => {
    // In a real implementation, this would use a library like jsPDF
    alert("PDF export feature would generate a detailed report of your calculations");
  };
  
  // Share results
  const shareResults = () => {
    // In a real implementation, this would use the Web Share API
    alert("Share feature would allow you to send these results via email or social media");
  };

  // Effect to update scenario name when account type changes
  useEffect(() => {
    setScenarioName(`My US ${accountType} Investment`);
  }, [accountType]);

  // Tooltip content
  const tooltipContent = {
    expenseRatio: "The annual fee charged by mutual funds and ETFs for operating expenses, expressed as a percentage of assets.",
    advisoryFee: "Annual fee charged by financial advisors or robo-advisors for investment management and advice.",
    tradingCosts: "Costs associated with buying and selling securities, including commissions and bid-ask spreads.",
    accountType: "Different account types have different tax treatment in the US. 401(k)/IRA accounts offer tax advantages, while taxable accounts are subject to capital gains tax.",
    k401Limit: "The maximum annual contribution allowed to 401(k) plans. For 2025, this is estimated at $23,000 for individuals under 50.",
    iraLimit: "The maximum annual contribution allowed to IRA accounts. For 2025, this is estimated at $7,000 for individuals under 50.",
    capitalGainsTax: "Tax on profits when you sell investments for more than you paid for them. Long-term capital gains (assets held over a year) are taxed at preferential rates.",
    taxBracket: "Your income tax bracket affects the rate of tax you pay on short-term capital gains and dividends.",
    trex: "The T-Rex Score, developed by Larry Bates, shows what percentage of your potential returns you keep after fees. Higher is better!"
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">US Investment Fee Calculator</h2>
        
        <div className="flex items-center">
          <span className="mr-2 text-sm text-gray-600">Simple</span>
          <button 
            onClick={() => setAdvancedMode(!advancedMode)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1 ${advancedMode ? 'bg-black' : 'bg-gray-200'}`}
          >
            <span
              className={`${
                advancedMode ? 'translate-x-6' : 'translate-x-1'
              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
          </button>
          <span className="ml-2 text-sm text-gray-600">Advanced</span>
        </div>
      </div>
    
      {/* Scenario Name */}
      <div className="mb-6">
        <label htmlFor="scenarioName" className="block text-sm font-medium text-gray-700 mb-1">
          Scenario Name
        </label>
        <input
          type="text"
          id="scenarioName"
          className="focus:ring-black focus:border-black block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
          value={scenarioName}
          onChange={(e) => setScenarioName(e.target.value)}
          placeholder="e.g., My 401(k) Plan"
        />
      </div>
      
      {/* US Account Type Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
          Account Type
          <button 
            className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
            onClick={() => setShowTooltip('accountType')}
          >
            <LucideIcons.HelpCircle size={16} />
          </button>
        </label>
        {showTooltip === 'accountType' && (
          <div className="absolute z-10 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
            {tooltipContent.accountType}
            <button 
              className="absolute top-1 right-1 text-white hover:text-gray-300"
              onClick={() => setShowTooltip(null)}
            >
              <LucideIcons.X size={14} />
            </button>
          </div>
        )}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setAccountType('401k')}
            className={`p-2 text-sm border rounded-md ${
              accountType === '401k'
                ? 'border-black bg-gray-100'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            401(k)/403(b)
          </button>
          <button
            onClick={() => setAccountType('IRA')}
            className={`p-2 text-sm border rounded-md ${
              accountType === 'IRA'
                ? 'border-black bg-gray-100'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            Traditional IRA
          </button>
          <button
            onClick={() => setAccountType('Roth IRA')}
            className={`p-2 text-sm border rounded-md ${
              accountType === 'Roth IRA'
                ? 'border-black bg-gray-100'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            Roth IRA
          </button>
          <button
            onClick={() => setAccountType('Taxable')}
            className={`p-2 text-sm border rounded-md ${
              accountType === 'Taxable'
                ? 'border-black bg-gray-100'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            Taxable Account
          </button>
          <button
            onClick={() => setAccountType('HSA')}
            className={`p-2 text-sm border rounded-md ${
              accountType === 'HSA'
                ? 'border-black bg-gray-100'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            HSA
          </button>
          <button
            onClick={() => setAccountType('529')}
            className={`p-2 text-sm border rounded-md ${
              accountType === '529'
                ? 'border-black bg-gray-100'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            529 Plan
          </button>
        </div>
      </div>
      
      {/* Fund/Provider Presets */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Fund Provider or Type
        </label>
        <div className="grid grid-cols-3 gap-2">
          {providerPresets.map((provider) => (
            <button
              key={provider.name}
              onClick={() => applyProviderPreset(provider)}
              className={`p-2 text-sm border rounded-md ${
                selectedProvider === provider.name
                  ? 'border-black bg-gray-100'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {provider.name}
            </button>
          ))}
          <button
            onClick={() => {
              setExpenseRatio(0.5);
              setAdvisoryFee(1);
              setTradingCosts(0.1);
              setSelectedProvider(null);
            }}
            className={`p-2 text-sm border rounded-md ${
              selectedProvider === null
                ? 'border-black bg-gray-100'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            Custom
          </button>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label htmlFor="initialInvestment" className="block text-sm font-medium text-gray-700 mb-1">
              Initial Investment
            </label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                id="initialInvestment"
                className="focus:ring-black focus:border-black block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md p-2 border"
                value={initialInvestment}
                onChange={(e) => setInitialInvestment(Number(e.target.value))}
                min="0"
                step="1000"
              />
            </div>
          </div>
          <div>
            <label htmlFor="annualContribution" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              Annual Contribution
              {(accountType === '401k' || accountType === '403b' || accountType === 'IRA' || accountType === 'Roth IRA') && (
                <button 
                  className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                  onClick={() => setShowTooltip(accountType === '401k' || accountType === '403b' ? 'k401Limit' : 'iraLimit')}
                >
                  <LucideIcons.HelpCircle size={16} />
                </button>
              )}
            </label>
            {(showTooltip === 'k401Limit' || showTooltip === 'iraLimit') && (
              <div className="absolute z-10 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
                {tooltipContent[showTooltip]}
                <button 
                  className="absolute top-1 right-1 text-white hover:text-gray-300"
                  onClick={() => setShowTooltip(null)}
                >
                  <LucideIcons.X size={14} />
                </button>
              </div>
            )}
            <div className="relative mt-1 rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                id="annualContribution"
                className="focus:ring-black focus:border-black block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md p-2 border"
                value={annualContribution}
                onChange={(e) => setAnnualContribution(Number(e.target.value))}
                min="0"
                step="100"
              />
            </div>
            {accountType === '401k' && annualContribution > contribution401kLimit && (
              <p className="mt-1 text-xs text-yellow-600">
                Contribution exceeds annual 401(k) limit of {formatCurrency(contribution401kLimit)}. Calculations will use the maximum allowed contribution.
              </p>
            )}
            {(accountType === 'IRA' || accountType === 'Roth IRA') && annualContribution > contributionIRALimit && (
              <p className="mt-1 text-xs text-yellow-600">
                Contribution exceeds annual IRA limit of {formatCurrency(contributionIRALimit)}. Calculations will use the maximum allowed contribution.
              </p>
            )}
          </div>
          
          <div>
            <label htmlFor="investmentPeriod" className="block text-sm font-medium text-gray-700 mb-1">
              Investment Period (years)
            </label>
            <input
              type="range"
              id="investmentPeriod"
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              min="1"
              max="50"
              value={investmentPeriod}
              onChange={(e) => setInvestmentPeriod(Number(e.target.value))}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1</span>
              <span>{investmentPeriod} years</span>
              <span>50</span>
            </div>
          </div>
          
          <div>
            <label htmlFor="expectedReturn" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              Expected Annual Return (%)
            </label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <input
                type="number"
                id="expectedReturn"
                className="focus:ring-black focus:border-black block w-full pr-12 sm:text-sm border-gray-300 rounded-md p-2 border"
                value={expectedReturn}
                onChange={(e) => setExpectedReturn(Number(e.target.value))}
                min="0"
                max="30"
                step="0.1"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">%</span>
              </div>
            </div>
          </div>
          
          {/* Taxable-specific tax settings */}
          {accountType === 'Taxable' && advancedMode && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-md font-medium text-gray-700 mb-3">Tax Settings</h3>
              
              <div className="space-y-3">
                <div>
                  <label htmlFor="taxBracket" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    Tax Bracket
                    <button 
                      className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                      onClick={() => setShowTooltip('taxBracket')}
                    >
                      <LucideIcons.HelpCircle size={16} />
                    </button>
                  </label>
                  {showTooltip === 'taxBracket' && (
                    <div className="absolute z-10 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
                      {tooltipContent.taxBracket}
                      <button 
                        className="absolute top-1 right-1 text-white hover:text-gray-300"
                        onClick={() => setShowTooltip(null)}
                      >
                        <LucideIcons.X size={14} />
                      </button>
                    </div>
                  )}
                  <select
                    id="taxBracket"
                    className="focus:ring-black focus:border-black block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                    value={taxBracket}
                    onChange={(e) => setTaxBracket(e.target.value)}
                  >
                    <option value="low">Low (10-12%)</option>
                    <option value="medium">Medium (22-24%)</option>
                    <option value="high">High (32-37%)</option>
                  </select>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="includeCapitalGainsTax"
                    type="checkbox"
                    className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                    checked={includeCapitalGainsTax}
                    onChange={(e) => setIncludeCapitalGainsTax(e.target.checked)}
                  />
                  <label htmlFor="includeCapitalGainsTax" className="ml-2 block text-sm text-gray-700 flex items-center">
                    Include Capital Gains Tax Impact
                    <button 
                      className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                      onClick={() => setShowTooltip('capitalGainsTax')}
                    >
                      <LucideIcons.HelpCircle size={16} />
                    </button>
                  </label>
                </div>
                
                <div className="pt-2 text-xs text-gray-500">
                  <p>Capital Gains Tax Rate:</p>
                  <ul className="list-disc pl-5 space-y-1 mt-1">
                    <li>Long-term: {taxRates[taxBracket].longTermGains}%</li>
                    <li>Short-term: Taxed at income rate ({taxRates[taxBracket].income}%)</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          {/* Account type benefits summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-md font-medium text-gray-700 mb-2">US Account Type Benefits</h3>
            
            <div className="space-y-2 text-sm">
              {accountType === '401k' && (
                <>
                  <p className="flex items-center">
                    <LucideIcons.Check className="text-green-500 mr-2" size={16} />
                    Pre-tax contributions reduce taxable income
                  </p>
                  <p className="flex items-center">
                    <LucideIcons.Check className="text-green-500 mr-2" size={16} />
                    Tax-deferred growth until withdrawal
                  </p>
                  <p className="flex items-center">
                    <LucideIcons.Check className="text-green-500 mr-2" size={16} />
                    Many employers offer matching contributions
                  </p>
                  <p className="flex items-center">
                    <LucideIcons.Minus className="text-red-500 mr-2" size={16} />
                    Withdrawals before age 59½ typically incur penalties
                  </p>
                </>
              )}
              
              {accountType === 'IRA' && (
                <>
                  <p className="flex items-center">
                    <LucideIcons.Check className="text-green-500 mr-2" size={16} />
                    Tax-deductible contributions (income limits may apply)
                  </p>
                  <p className="flex items-center">
                    <LucideIcons.Check className="text-green-500 mr-2" size={16} />
                    Tax-deferred growth until withdrawal
                  </p>
                  <p className="flex items-center">
                    <LucideIcons.Check className="text-green-500 mr-2" size={16} />
                    More investment options than most 401(k) plans
                  </p>
                  <p className="flex items-center">
                    <LucideIcons.Minus className="text-red-500 mr-2" size={16} />
                    Required minimum distributions (RMDs) starting at age 73
                  </p>
                </>
              )}
              
              {accountType === 'Roth IRA' && (
                <>
                  <p className="flex items-center">
                    <LucideIcons.Check className="text-green-500 mr-2" size={16} />
                    Tax-free growth and withdrawals in retirement
                  </p>
                  <p className="flex items-center">
                    <LucideIcons.Check className="text-green-500 mr-2" size={16} />
                    No required minimum distributions (RMDs)
                  </p>
                  <p className="flex items-center">
                    <LucideIcons.Check className="text-green-500 mr-2" size={16} />
                    Contributions can be withdrawn any time without penalty
                  </p>
                  <p className="flex items-center">
                    <LucideIcons.Minus className="text-red-500 mr-2" size={16} />
                    Contributions are not tax-deductible
                  </p>
                </>
              )}
              
              {accountType === 'Taxable' && (
                <>
                  <p className="flex items-center">
                    <LucideIcons.Check className="text-green-500 mr-2" size={16} />
                    No contribution limits
                  </p>
                  <p className="flex items-center">
                    <LucideIcons.Check className="text-green-500 mr-2" size={16} />
                    Complete liquidity and flexibility
                  </p>
                  <p className="flex items-center">
                    <LucideIcons.Check className="text-green-500 mr-2" size={16} />
                    Potential for preferential long-term capital gains rates
                  </p>
                  <p className="flex items-center">
                    <LucideIcons.Minus className="text-red-500 mr-2" size={16} />
                    No tax advantages for contributions
                  </p>
                  <p className="flex items-center">
                    <LucideIcons.Minus className="text-red-500 mr-2" size={16} />
                    Dividends and capital gains are taxable
                  </p>
                </>
              )}
              
              {accountType === 'HSA' && (
                <>
                  <p className="flex items-center">
                    <LucideIcons.Check className="text-green-500 mr-2" size={16} />
                    Triple tax advantage: tax-deductible contributions, tax-free growth, tax-free withdrawals for qualified medical expenses
                  </p>
                  <p className="flex items-center">
                    <LucideIcons.Check className="text-green-500 mr-2" size={16} />
                    Can be used as a retirement account after age 65
                  </p>
                  <p className="flex items-center">
                    <LucideIcons.Minus className="text-red-500 mr-2" size={16} />
                    Requires high-deductible health plan (HDHP)
                  </p>
                </>
              )}
              
              {accountType === '529' && (
                <>
                  <p className="flex items-center">
                    <LucideIcons.Check className="text-green-500 mr-2" size={16} />
                    Tax-free growth and withdrawals for qualified education expenses
                  </p>
                  <p className="flex items-center">
                    <LucideIcons.Check className="text-green-500 mr-2" size={16} />
                    Some states offer tax deductions for contributions
                  </p>
                  <p className="flex items-center">
                    <LucideIcons.Minus className="text-red-500 mr-2" size={16} />
                    Non-qualified withdrawals subject to taxes and 10% penalty
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="space-y-6">
          {/* Fee Inputs */}
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="expenseRatio" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                Expense Ratio (%)
                <button 
                  className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                  onClick={() => setShowTooltip('expenseRatio')}
                >
                  <LucideIcons.HelpCircle size={16} />
                </button>
              </label>
              {showTooltip === 'expenseRatio' && (
                <div className="absolute z-10 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
                  {tooltipContent.expenseRatio}
                  <button 
                    className="absolute top-1 right-1 text-white hover:text-gray-300"
                    onClick={() => setShowTooltip(null)}
                  >
                    <LucideIcons.X size={14} />
                  </button>
                </div>
              )}
            </div>
            <div className="relative mt-1 rounded-md shadow-sm">
              <input
                type="number"
                id="expenseRatio"
                className="focus:ring-black focus:border-black block w-full pr-12 sm:text-sm border-gray-300 rounded-md p-2 border"
                value={expenseRatio}
                onChange={(e) => setExpenseRatio(Number(e.target.value))}
                min="0"
                max="2"
                step="0.01"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">%</span>
              </div>
            </div>
          </div>
          
          {advancedMode && (
            <>
              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="advisoryFee" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    Advisory Fee (%)
                    <button 
                      className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                      onClick={() => setShowTooltip('advisoryFee')}
                    >
                      <LucideIcons.HelpCircle size={16} />
                    </button>
                  </label>
                  {showTooltip === 'advisoryFee' && (
                    <div className="absolute z-10 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
                      {tooltipContent.advisoryFee}
                      <button 
                        className="absolute top-1 right-1 text-white hover:text-gray-300"
                        onClick={() => setShowTooltip(null)}
                      >
                        <LucideIcons.X size={14} />
                      </button>
                    </div>
                  )}
                </div>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <input
                    type="number"
                    id="advisoryFee"
                    className="focus:ring-black focus:border-black block w-full pr-12 sm:text-sm border-gray-300 rounded-md p-2 border"
                    value={advisoryFee}
                    onChange={(e) => setAdvisoryFee(Number(e.target.value))}
                    min="0"
                    max="2"
                    step="0.01"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">%</span>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="tradingCosts" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    Trading Costs (%)
                    <button 
                      className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                      onClick={() => setShowTooltip('tradingCosts')}
                    >
                      <LucideIcons.HelpCircle size={16} />
                    </button>
                  </label>
                  {showTooltip === 'tradingCosts' && (
                    <div className="absolute z-10 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
                      {tooltipContent.tradingCosts}
                      <button 
                        className="absolute top-1 right-1 text-white hover:text-gray-300"
                        onClick={() => setShowTooltip(null)}
                      >
                        <LucideIcons.X size={14} />
                      </button>
                    </div>
                  )}
                </div>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <input
                    type="number"
                    id="tradingCosts"
                    className="focus:ring-black focus:border-black block w-full pr-12 sm:text-sm border-gray-300 rounded-md p-2 border"
                    value={tradingCosts}
                    onChange={(e) => setTradingCosts(Number(e.target.value))}
                    min="0"
                    max="2"
                    step="0.01"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">%</span>
                  </div>
                </div>
              </div>
            </>
          )}
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-md font-medium text-gray-700 mb-4">Fund Fee Benchmarks</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span>Index Funds/ETFs:</span>
                <span className="font-medium">0.03% - 0.25%</span>
              </div>
              <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '10%' }}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Target Date Funds:</span>
                <span className="font-medium">0.08% - 0.60%</span>
              </div>
              <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '30%' }}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Actively Managed Funds:</span>
                <span className="font-medium">0.50% - 1.50%</span>
              </div>
              <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: '70%' }}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Your Expense Ratio:</span>
                <span className={`font-medium ${
                  expenseRatio <= 0.25 ? 'text-green-600' : 
                  expenseRatio <= 0.60 ? 'text-blue-600' : 
                  expenseRatio <= 1.00 ? 'text-yellow-600' : 'text-red-600'
                }`}>{expenseRatio}%</span>
              </div>
              <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                <div className={`h-1.5 rounded-full ${
                  expenseRatio <= 0.25 ? 'bg-green-500' : 
                  expenseRatio <= 0.60 ? 'bg-blue-500' : 
                  expenseRatio <= 1.00 ? 'bg-yellow-500' : 'bg-red-500'
                }`} style={{ width: `${Math.min(expenseRatio * 100, 100)}%` }}></div>
              </div>
            </div>
          </div>
          
          <div className="pt-4">
            <button
              onClick={calculateGrowth}
              className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transition-colors"
            >
              Calculate Impact
            </button>
          </div>
        </div>
      </div>
      
      {hasCalculated && (
        <div className="mt-8 border-t border-gray-200 pt-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Results: {scenarioName}</h2>
            
            <div className="flex space-x-2">
              <button 
                onClick={saveScenario}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              >
                <LucideIcons.Save size={16} className="mr-2" />
                Save
              </button>
              <button 
                onClick={exportResults}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              >
                <LucideIcons.Download size={16} className="mr-2" />
                Export
              </button>
              <button 
                onClick={shareResults}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              >
                <LucideIcons.Share2 size={16} className="mr-2" />
                Share
              </button>
            </div>
          </div>

          {/* Key results boxes */}
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Investment Value</p>
              <p className="text-2xl font-bold">{formatCurrency(withFeesResult)}</p>
              <p className="text-xs text-gray-500 mt-2">Without fees: {formatCurrency(withoutFeesResult)}</p>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Total Fees Paid</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(feesTotal)}</p>
              <p className="text-xs text-gray-500 mt-2">{formatPercentage(feePercentage)} of potential returns</p>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <p className="text-sm text-gray-500 mb-1">T-Rex Score</p>
                <button 
                  className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                  onClick={() => setShowTooltip('trex')}
                >
                  <LucideIcons.HelpCircle size={12} />
                </button>
                {showTooltip === 'trex' && (
                  <div className="absolute z-10 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
                    {tooltipContent.trex}
                    <button 
                      className="absolute top-1 right-1 text-white hover:text-gray-300"
                      onClick={() => setShowTooltip(null)}
                    >
                      <LucideIcons.X size={14} />
                    </button>
                  </div>
                )}
              </div>
              <p className="text-2xl font-bold">{formatPercentage(tRexScore)}</p>
              <p className="text-xs text-gray-500 mt-2">Portion of returns you keep</p>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Annual Fee Impact</p>
              <p className="text-2xl font-bold">{formatCurrency(feesTotal / investmentPeriod)}</p>
              <p className="text-xs text-gray-500 mt-2">Average per year</p>
            </div>
          </div>
          
          {/* Charts */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Investment Growth Over Time</h3>
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" label={{ value: 'Years', position: 'insideBottomRight', offset: -10 }} />
                  <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} />
                  <Tooltip 
                    formatter={(value) => [`$${value.toLocaleString()}`, ""]}
                    labelFormatter={(label) => `Year ${label}`}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="withoutFees" name="Without Fees" stroke="#4F46E5" fill="#C7D2FE" />
                  <Area type="monotone" dataKey="withFees" name="With Fees" stroke="#047857" fill="#D1FAE5" />
                  <Area type="monotone" dataKey="feesLost" name="Fees Paid" stroke="#DC2626" fill="#FEE2E2" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {savedScenarios.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">Saved Scenarios</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Investment</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Fees</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">T-Rex Score</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Final Value</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {savedScenarios.map((scenario) => (
                      <tr key={scenario.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{scenario.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{scenario.accountType}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(scenario.initialInvestment)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{scenario.investmentPeriod} years</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(scenario.feesTotal)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatPercentage(scenario.tRexScore)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(scenario.totalValue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* US-specific tax benefits info */}
          <div className="mt-8 bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-gray-700 mb-4">US Tax-Efficient Investing</h3>
            
            <div className="space-y-4">
              <p>
                Making the most of US tax-advantaged accounts can significantly improve your long-term investment returns:
              </p>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-800 mb-2">Tax-Deferred Accounts</h4>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
                    <li>Traditional 401(k)/403(b)</li>
                    <li>Traditional IRA</li>
                    <li>SEP IRA, SIMPLE IRA</li>
                    <li>Tax-deductible contributions</li>
                    <li>Withdrawals taxed as income</li>
                  </ul>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-800 mb-2">Tax-Free Accounts</h4>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
                    <li>Roth 401(k)</li>
                    <li>Roth IRA</li>
                    <li>HSA (for medical expenses)</li>
                    <li>529 Plans (for education)</li>
                    <li>After-tax contributions, tax-free withdrawals</li>
                  </ul>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-800 mb-2">Taxable Accounts</h4>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
                    <li>Individual/Joint brokerage accounts</li>
                    <li>No contribution limits</li>
                    <li>Tax-efficient ETFs and index funds</li>
                    <li>Tax-loss harvesting opportunities</li>
                    <li>Step-up in basis at death</li>
                  </ul>
                </div>
              </div>
              
              <p className="text-sm text-gray-600">
                <strong>Investment Strategy Tip:</strong> Consider the "tax location" strategy by holding tax-inefficient investments (like bonds or REITs) in tax-advantaged accounts, and tax-efficient investments (like index ETFs) in taxable accounts.
              </p>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200 mt-4">
                <h4 className="font-medium text-gray-800 mb-2">Recommended Investment Priority</h4>
                <ol className="text-sm text-gray-600 space-y-1 list-decimal pl-5">
                  <li>401(k)/403(b) up to employer match (100% immediate return)</li>
                  <li>HSA if eligible (triple tax advantage)</li>
                  <li>Roth IRA or Traditional IRA (depending on income)</li>
                  <li>Max out 401(k)/403(b) contributions</li>
                  <li>529 Plan (if saving for education)</li>
                  <li>Taxable accounts for additional investments</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-8 bg-white p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Understanding Investment Fees in the US</h3>
        
        <div className="prose max-w-none">
          <p>
            Investment fees can significantly impact your long-term returns. Here's what you need to know about the common fees in US investment accounts:
          </p>
          
          <h4>Types of Investment Fees</h4>
          <ul>
            <li><strong>Expense Ratios:</strong> Annual fees charged by mutual funds and ETFs, ranging from as low as 0.03% for index funds to over 1% for actively managed funds.</li>
            <li><strong>Advisory Fees:</strong> Fees charged by financial advisors or robo-advisors, typically 0.25% to 1.5% annually.</li>
            <li><strong>Trading Commissions:</strong> While many brokerages now offer commission-free trades for stocks and ETFs, some specialized investments still incur trading costs.</li>
            <li><strong>Account Fees:</strong> Some brokerages charge annual account maintenance fees, particularly for specialized accounts.</li>
            <li><strong>Administrative Fees:</strong> 401(k) plans often include administrative fees charged by the plan provider.</li>
          </ul>
          
          <h4>The Impact of Fees</h4>
          <p>
            Even a seemingly small difference in fees can have a dramatic impact on your investment returns over time due to compounding. For example, a 1% higher annual fee can reduce your final portfolio value by 20-30% over a 30-year period.
          </p>
          
          <h4>How to Minimize Investment Fees</h4>
          <ul>
            <li>Choose low-cost index funds and ETFs instead of actively managed funds</li>
            <li>Compare expense ratios when selecting investments</li>
            <li>Use brokerages that offer commission-free trades</li>
            <li>Consider whether the services of a financial advisor justify their fees</li>
            <li>Review your 401(k) investment options and select low-fee alternatives when available</li>
            <li>Consider direct-to-consumer fund companies like Vanguard, Fidelity, and Schwab that are known for low-cost options</li>
          </ul>
          
          <h4>Fee Benchmarks</h4>
          <p>
            Use these benchmarks to evaluate the fees you're paying:
          </p>
          <ul>
            <li><strong>Excellent:</strong> Total investment fees under 0.2% annually</li>
            <li><strong>Good:</strong> Total investment fees of 0.2% to 0.5% annually</li>
            <li><strong>Average:</strong> Total investment fees of 0.5% to 1% annually</li>
            <li><strong>High:</strong> Total investment fees over 1% annually</li>
          </ul>
          
          <p>
            By being fee-conscious and making informed choices, you can potentially add hundreds of thousands of dollars to your retirement savings over your lifetime.
          </p>
        </div>
      </div>
    </div>
  );
};

export default USFeeCalculator;
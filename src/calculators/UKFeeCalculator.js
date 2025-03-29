import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import * as LucideIcons from 'lucide-react';

const UKFeeCalculator = () => {
  // State for form inputs
  const [initialInvestment, setInitialInvestment] = useState(10000);
  const [annualContribution, setAnnualContribution] = useState(5000);
  const [investmentPeriod, setInvestmentPeriod] = useState(30);
  const [expectedReturn, setExpectedReturn] = useState(7);
  const [platformFee, setPlatformFee] = useState(0.25);
  const [fundFee, setFundFee] = useState(0.22);
  const [tradingCosts, setTradingCosts] = useState(0.1);
  const [advancedMode, setAdvancedMode] = useState(false);
  const [showTooltip, setShowTooltip] = useState(null);
  
  // UK Specific settings
  const [accountType, setAccountType] = useState('ISA');
  const [isaAllowance, setIsaAllowance] = useState(20000); // Annual ISA allowance
  const [includeCapitalGainsTax, setIncludeCapitalGainsTax] = useState(false);
  const [includeDividendTax, setIncludeDividendTax] = useState(false);
  const [taxBracket, setTaxBracket] = useState('basic'); // basic, higher, additional
  const [usePersonalAllowance, setUsePersonalAllowance] = useState(true);
  
  // Selected platform preset
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  
  // UK Platform presets
  const platformPresets = [
    { name: "Vanguard Investor", platformFee: 0.15, fundFee: 0.22, tradingCosts: 0, cap: 375 },
    { name: "Hargreaves Lansdown", platformFee: 0.45, fundFee: 0.45, tradingCosts: 0, cap: null },
    { name: "AJ Bell", platformFee: 0.25, fundFee: 0.35, tradingCosts: 1.50, cap: null },
    { name: "Interactive Investor", platformFee: 0, fundFee: 0.35, tradingCosts: 0, cap: 240 }, // Fixed fee converted
    { name: "Fidelity", platformFee: 0.35, fundFee: 0.35, tradingCosts: 0, cap: 45 },
    { name: "iWeb", platformFee: 0, fundFee: 0.35, tradingCosts: 5, cap: 100 }, // One-off account opening fee
    { name: "Charles Stanley Direct", platformFee: 0.35, fundFee: 0.32, tradingCosts: 0, cap: null },
    { name: "Bestinvest", platformFee: 0.40, fundFee: 0.35, tradingCosts: 0, cap: null },
    { name: "Freetrade", platformFee: 0, fundFee: 0.12, tradingCosts: 0, cap: 60 }, // Plus subscription
  ];
  
  // State for calculation results
  const [withoutFeesResult, setWithoutFeesResult] = useState(0);
  const [withFeesResult, setWithFeesResult] = useState(0);
  const [feesTotal, setFeesTotal] = useState(0);
  const [feePercentage, setFeePercentage] = useState(0);
  const [tRexScore, setTRexScore] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [scenarioName, setScenarioName] = useState('My UK Investment');
  const [savedScenarios, setSavedScenarios] = useState([]);
  
  // Tax rates based on UK tax brackets (2025 estimates)
  const taxRates = {
    basic: { dividendTax: 8.75, capitalGainsTax: 10 },
    higher: { dividendTax: 33.75, capitalGainsTax: 20 },
    additional: { dividendTax: 39.35, capitalGainsTax: 20 }
  };
  
  // Tax allowances
  const [capitalGainsAllowance, setCapitalGainsAllowance] = useState(6000); // 2025 estimate
  const [dividendAllowance, setDividendAllowance] = useState(500); // 2025 estimate
  const [personalAllowance, setPersonalAllowance] = useState(12570); // 2025 estimate

  // Tooltip content
  const tooltipContent = {
    platformFee: "Platform fees are charged by the investment platform for administering your account. These are typically a percentage of your investments, sometimes with a cap.",
    fundFee: "Fund fees (also called OCF - Ongoing Charge Figure) cover the cost of the fund manager picking and managing the investments in the fund.",
    tradingCosts: "Trading costs include dealing charges when buying or selling shares/funds and forex charges for overseas investments.",
    accountType: "Different account types have different tax treatment in the UK. ISAs offer tax-free growth and withdrawals, SIPPs provide tax relief on contributions, and GIAs are subject to capital gains and dividend taxes.",
    isaAllowance: "The maximum amount you can contribute to ISAs in a tax year. For 2024/25, this is £20,000.",
    capitalGainsTax: "Tax on profits when you sell investments for more than you paid for them. Not applicable for ISAs or SIPPs.",
    dividendTax: "Tax on dividend income from investments. Not applicable for ISAs or SIPPs.",
    taxBracket: "Your income tax bracket affects the rate of tax you pay on dividends and capital gains.",
    personalAllowance: "The amount of income you can earn each year without paying income tax.",
    trex: "The T-Rex Score, developed by Larry Bates, shows what percentage of your potential returns you keep after fees. Higher is better!"
  };

  // Apply platform preset
  const applyPlatformPreset = (platform) => {
    setPlatformFee(platform.platformFee);
    setFundFee(platform.fundFee);
    if (platform.tradingCosts > 0) {
      // Convert fixed trading costs to approximate percentage impact
      const estimatedTradingCostsPercentage = (platform.tradingCosts * 12) / initialInvestment * 100;
      setTradingCosts(Math.min(estimatedTradingCostsPercentage, 0.5)); // Cap at 0.5% for reasonability
    } else {
      setTradingCosts(0);
    }
    setSelectedPlatform(platform.name);
  };

  // Calculate investment growth
  const calculateGrowth = () => {
    // Calculate total fee percentage
    let totalFeePercentage = platformFee + fundFee + tradingCosts;
    
    // Tax drag calculations for GIA accounts
    let taxDrag = 0;
    
    if (accountType === 'GIA') {
      // For GIA accounts, calculate tax drag
      if (includeDividendTax) {
        // Assume 2.5% dividend yield
        const dividendYield = 2.5;
        const annualDividend = initialInvestment * (dividendYield / 100);
        
        // Apply dividend allowance
        let taxableDividend = annualDividend - dividendAllowance;
        taxableDividend = Math.max(0, taxableDividend);
        
        // Calculate dividend tax
        const dividendTaxRate = taxRates[taxBracket].dividendTax / 100;
        const dividendTaxAmount = taxableDividend * dividendTaxRate;
        
        // Convert to percentage of portfolio
        const dividendTaxDrag = (dividendTaxAmount / initialInvestment) * 100;
        taxDrag += dividendTaxDrag;
      }
      
      if (includeCapitalGainsTax) {
        // Simplified capital gains tax calculation
        // Assume annual realization of gains equal to the expected return
        const annualGain = initialInvestment * (expectedReturn / 100);
        
        // Apply capital gains allowance
        let taxableGain = annualGain - capitalGainsAllowance;
        taxableGain = Math.max(0, taxableGain);
        
        // Calculate capital gains tax
        const cgtRate = taxRates[taxBracket].capitalGainsTax / 100;
        const cgtAmount = taxableGain * cgtRate;
        
        // Convert to percentage of portfolio
        const cgtDrag = (cgtAmount / initialInvestment) * 100;
        taxDrag += cgtDrag;
      }
    }
    
    // Add tax drag to total fee percentage
    totalFeePercentage += taxDrag;
    
    const withoutFees = calculateInvestmentGrowth(initialInvestment, annualContribution, investmentPeriod, expectedReturn, 0);
    const withFees = calculateInvestmentGrowth(initialInvestment, annualContribution, investmentPeriod, expectedReturn, totalFeePercentage);
    
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
      const withoutFeesAtYear = calculateInvestmentGrowth(initialInvestment, annualContribution, year, expectedReturn, 0);
      const withFeesAtYear = calculateInvestmentGrowth(initialInvestment, annualContribution, year, expectedReturn, totalFeePercentage);
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
      // Limit annual contribution to ISA allowance if applicable
      let yearlyContribution = annual;
      if (accountType === 'ISA') {
        yearlyContribution = Math.min(annual, isaAllowance);
      }
      
      totalAmount = totalAmount * (1 + effectiveReturn) + yearlyContribution;
    }
    
    return totalAmount;
  };
  
  // Format currency (GBP)
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
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
      platformFee,
      fundFee,
      tradingCosts,
      taxBracket: accountType === 'GIA' ? taxBracket : null,
      includeDividendTax: accountType === 'GIA' ? includeDividendTax : false,
      includeCapitalGainsTax: accountType === 'GIA' ? includeCapitalGainsTax : false,
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
    setScenarioName(`My UK ${accountType} Investment`);
  }, [accountType]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">UK Investment Fee Calculator</h2>
        
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
          placeholder="e.g., My ISA Plan"
        />
      </div>
      
      {/* UK Account Type Selector */}
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
            onClick={() => setAccountType('ISA')}
            className={`p-2 text-sm border rounded-md ${
              accountType === 'ISA'
                ? 'border-black bg-gray-100'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            ISA
          </button>
          <button
            onClick={() => setAccountType('SIPP')}
            className={`p-2 text-sm border rounded-md ${
              accountType === 'SIPP'
                ? 'border-black bg-gray-100'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            SIPP (Pension)
          </button>
          <button
            onClick={() => setAccountType('GIA')}
            className={`p-2 text-sm border rounded-md ${
              accountType === 'GIA'
                ? 'border-black bg-gray-100'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            General Account
          </button>
        </div>
      </div>
      
      {/* Platform Presets */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Investment Platform
        </label>
        <div className="grid grid-cols-3 gap-2">
          {platformPresets.map((platform) => (
            <button
              key={platform.name}
              onClick={() => applyPlatformPreset(platform)}
              className={`p-2 text-sm border rounded-md ${
                selectedPlatform === platform.name
                  ? 'border-black bg-gray-100'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {platform.name}
            </button>
          ))}
          <button
            onClick={() => {
              setPlatformFee(0.25);
              setFundFee(0.22);
              setTradingCosts(0);
              setSelectedPlatform(null);
            }}
            className={`p-2 text-sm border rounded-md ${
              selectedPlatform === null
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
                <span className="text-gray-500 sm:text-sm">£</span>
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
            <label htmlFor="annualContribution" className="block text-sm font-medium text-gray-700 mb-1">
              Annual Contribution
            </label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">£</span>
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
            {accountType === 'ISA' && (
              <p className="mt-1 text-xs text-gray-500">
                ISA annual allowance: {formatCurrency(isaAllowance)}
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
          
          {/* GIA-specific tax settings */}
          {accountType === 'GIA' && advancedMode && (
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
                    <option value="basic">Basic Rate (20%)</option>
                    <option value="higher">Higher Rate (40%)</option>
                    <option value="additional">Additional Rate (45%)</option>
                  </select>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="includeDividendTax"
                    type="checkbox"
                    className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                    checked={includeDividendTax}
                    onChange={(e) => setIncludeDividendTax(e.target.checked)}
                  />
                  <label htmlFor="includeDividendTax" className="ml-2 block text-sm text-gray-700 flex items-center">
                    Include Dividend Tax
                    <button 
                      className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                      onClick={() => setShowTooltip('dividendTax')}
                    >
                      <LucideIcons.HelpCircle size={16} />
                    </button>
                  </label>
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
                    Include Capital Gains Tax
                    <button 
                      className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                      onClick={() => setShowTooltip('capitalGainsTax')}
                    >
                      <LucideIcons.HelpCircle size={16} />
                    </button>
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="usePersonalAllowance"
                    type="checkbox"
                    className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                    checked={usePersonalAllowance}
                    onChange={(e) => setUsePersonalAllowance(e.target.checked)}
                  />
                  <label htmlFor="usePersonalAllowance" className="ml-2 block text-sm text-gray-700 flex items-center">
                    Use Personal Allowance
                    <button 
                      className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                      onClick={() => setShowTooltip('personalAllowance')}
                    >
                      <LucideIcons.HelpCircle size={16} />
                    </button>
                  </label>
                </div>
                
                <div className="pt-2 text-xs text-gray-500">
                  <p>UK Tax Allowances (2025 estimates):</p>
                  <ul className="list-disc pl-5 space-y-1 mt-1">
                    <li>Capital Gains: {formatCurrency(capitalGainsAllowance)}</li>
                    <li>Dividend: {formatCurrency(dividendAllowance)}</li>
                    <li>Personal: {formatCurrency(personalAllowance)}</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          {/* SIPP-specific info */}
          {accountType === 'SIPP' && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <LucideIcons.Info className="h-5 w-5 text-blue-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    SIPP benefits include tax relief on contributions and tax-free growth, but you can't access funds until age 55 (rising to 57 by 2028).
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="space-y-6">
          {/* Fee Inputs */}
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="platformFee" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                Platform Fee (%)
                <button 
                  className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                  onClick={() => setShowTooltip('platformFee')}
                >
                  <LucideIcons.HelpCircle size={16} />
                </button>
              </label>
              {showTooltip === 'platformFee' && (
                <div className="absolute z-10 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
                  {tooltipContent.platformFee}
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
                id="platformFee"
                className="focus:ring-black focus:border-black block w-full pr-12 sm:text-sm border-gray-300 rounded-md p-2 border"
                value={platformFee}
                onChange={(e) => setPlatformFee(Number(e.target.value))}
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
              <label htmlFor="fundFee" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                Fund Fee / OCF (%)
                <button 
                  className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                  onClick={() => setShowTooltip('fundFee')}
                >
                  <LucideIcons.HelpCircle size={16} />
                </button>
              </label>
              {showTooltip === 'fundFee' && (
                <div className="absolute z-10 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
                  {tooltipContent.fundFee}
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
                id="fundFee"
                className="focus:ring-black focus:border-black block w-full pr-12 sm:text-sm border-gray-300 rounded-md p-2 border"
                value={fundFee}
                onChange={(e) => setFundFee(Number(e.target.value))}
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
          )}
          
          {/* Account type benefits summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-md font-medium text-gray-700 mb-2">UK Account Type Benefits</h3>
            
            <div className="space-y-2 text-sm">
              {accountType === 'ISA' && (
                <>
                  <p className="flex items-center">
                    <LucideIcons.Check className="text-green-500 mr-2" size={16} />
                    Tax-free growth and withdrawals
                  </p>
                  <p className="flex items-center">
                    <LucideIcons.Check className="text-green-500 mr-2" size={16} />
                    Annual allowance of {formatCurrency(isaAllowance)}
                  </p>
                  <p className="flex items-center">
                    <LucideIcons.Check className="text-green-500 mr-2" size={16} />
                    Flexible access at any time
                  </p>
                </>
              )}
              
              {accountType === 'SIPP' && (
                <>
                  <p className="flex items-center">
                    <LucideIcons.Check className="text-green-500 mr-2" size={16} />
                    Tax relief on contributions (20-45%)
                  </p>
                  <p className="flex items-center">
                    <LucideIcons.Check className="text-green-500 mr-2" size={16} />
                    Tax-free growth within the pension
                  </p>
                  <p className="flex items-center">
                    <LucideIcons.Check className="text-green-500 mr-2" size={16} />
                    25% tax-free lump sum at retirement
                  </p>
                  <p className="flex items-center">
                    <LucideIcons.Minus className="text-red-500 mr-2" size={16} />
                    Cannot access until age 55 (57 by 2028)
                  </p>
                </>
              )}
              
              {accountType === 'GIA' && (
                <>
                  <p className="flex items-center">
                    <LucideIcons.Check className="text-green-500 mr-2" size={16} />
                    No contribution limits
                  </p>
                  <p className="flex items-center">
                    <LucideIcons.Check className="text-green-500 mr-2" size={16} />
                    Complete flexibility and access
                  </p>
                  <p className="flex items-start">
                    <LucideIcons.Minus className="text-red-500 mr-2 mt-1" size={16} />
                    <span>Subject to Capital Gains Tax ({taxRates[taxBracket].capitalGainsTax}%) and Dividend Tax ({taxRates[taxBracket].dividendTax}%)</span>
                  </p>
                </>
              )}
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
              <p className="text-xs text-gray-500 mt-2">{feePercentage.toFixed(1)}% of potential returns</p>
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
              <p className="text-2xl font-bold">{tRexScore.toFixed(1)}%</p>
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
                  <YAxis tickFormatter={(value) => `£${value.toLocaleString()}`} />
                  <Tooltip 
                    formatter={(value) => [`£${value.toLocaleString()}`, ""]}
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{scenario.tRexScore.toFixed(1)}%</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(scenario.totalValue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* UK-specific tax benefits info */}
          <div className="mt-8 bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-gray-700 mb-4">UK Tax-Efficient Investing</h3>
            
            <div className="space-y-4">
              <p>
                Making the most of UK tax wrappers can significantly improve your long-term investment returns:
              </p>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-800 mb-2">ISA (Individual Savings Account)</h4>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
                    <li>Annual allowance: {formatCurrency(isaAllowance)}</li>
                    <li>Tax-free growth and withdrawals</li>
                    <li>Flexible access at any time</li>
                    <li>No tax on dividends or capital gains</li>
                  </ul>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-800 mb-2">SIPP (Self-Invested Personal Pension)</h4>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
                    <li>Tax relief on contributions (20-45%)</li>
                    <li>Tax-free growth</li>
                    <li>25% tax-free lump sum at retirement</li>
                    <li>Remaining withdrawals taxed as income</li>
                  </ul>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-800 mb-2">General Investment Account (GIA)</h4>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
                    <li>No contribution limits</li>
                    <li>Annual CGT allowance: {formatCurrency(capitalGainsAllowance)}</li>
                    <li>Annual dividend allowance: {formatCurrency(dividendAllowance)}</li>
                    <li>Can use for investments exceeding ISA/SIPP limits</li>
                  </ul>
                </div>
              </div>
              
              <p className="text-sm text-gray-600">
                <strong>Investment Strategy Tip:</strong> Consider using your ISA allowance first, then your pension allowance, and finally a GIA for additional investments. This approach maximizes your tax-efficient investing opportunities.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UKFeeCalculator;
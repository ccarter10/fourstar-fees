import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import * as LucideIcons from 'lucide-react';

const RetirementCalculator = ({ region = 'us' }) => {
  // Analytics tracking (assuming similar to parent app)
  const trackCalculation = () => {
    // In a real implementation, this would use the analytics from props
    console.log("Tracking retirement calculation", {
      region,
      currentAge,
      retirementAge,
      lifeExpectancy,
      currentSavings,
      annualContribution,
      expectedReturn,
      inflationRate,
      withdrawalRate,
      monthlyStatePension: region === 'uk' ? statePension : undefined,
      monthlySocialSecurity: region === 'us' ? socialSecurityIncome : undefined,
      includeStateBenefits,
      otherIncome,
      includeInflation
    });
  };

  // State for form inputs
  const [currentAge, setCurrentAge] = useState(30);
  const [retirementAge, setRetirementAge] = useState(region === 'uk' ? 67 : 65); // UK retirement age defaults higher
  const [lifeExpectancy, setLifeExpectancy] = useState(90);
  const [currentSavings, setCurrentSavings] = useState(50000);
  const [annualContribution, setAnnualContribution] = useState(6000);
  const [annualContributionIncrease, setAnnualContributionIncrease] = useState(2);
  const [expectedReturn, setExpectedReturn] = useState(7);
  const [inflationRate, setInflationRate] = useState(2.5);
  const [withdrawalRate, setWithdrawalRate] = useState(4);
  
  // Region-specific state
  const [socialSecurityIncome, setSocialSecurityIncome] = useState(1500); // US
  const [statePension, setStatePension] = useState(800); // UK (around £800/month for full state pension)
  const [includeStateBenefits, setIncludeStateBenefits] = useState(true); // For both Social Security and State Pension
  
  const [otherIncome, setOtherIncome] = useState(0);
  const [includeInflation, setIncludeInflation] = useState(true);
  const [investmentFees, setInvestmentFees] = useState(1);
  const [isIsaWrapper, setIsIsaWrapper] = useState(true); // UK-specific: is in ISA tax wrapper
  const [isSipp, setIsSipp] = useState(true); // UK-specific: is in SIPP (pension)
  const [includePersonalAllowance, setIncludePersonalAllowance] = useState(true); // UK-specific: tax-free allowance
  
  // State for tooltips
  const [showTooltip, setShowTooltip] = useState(null);
  
  // State for scenario naming
  const [scenarioName, setScenarioName] = useState(`My ${region === 'uk' ? 'UK' : 'US'} Retirement Plan`);
  
  // State for calculation results
  const [retirementResults, setRetirementResults] = useState(null);
  const [balanceData, setBalanceData] = useState([]);
  const [contributionData, setContributionData] = useState([]);
  const [incomeBreakdown, setIncomeBreakdown] = useState({});
  const [hasCalculated, setHasCalculated] = useState(false);
  const [savedScenarios, setSavedScenarios] = useState([]);
  const [needsAnalysis, setNeedsAnalysis] = useState(null);
  
  // Handle region change (would be passed from parent component in real implementation)
  useEffect(() => {
    // Update default retirement age based on region
    setRetirementAge(region === 'uk' ? 67 : 65);
    
    // Update scenario name
    setScenarioName(`My ${region === 'uk' ? 'UK' : 'US'} Retirement Plan`);
  }, [region]);
  
  // Tooltip content - with region-specific differences
  const tooltipContent = {
    currentAge: "Your age today.",
    retirementAge: region === 'uk' 
      ? "The age when you plan to retire. UK State Pension age is currently between 66-68 depending on birth year."
      : "The age when you plan to retire and begin withdrawing from your retirement savings.",
    lifeExpectancy: "Your expected age at the end of life for planning purposes.",
    currentSavings: region === 'uk'
      ? "The total amount you've already saved for retirement (including pensions, ISAs, and other investments)."
      : "The total amount you've already saved for retirement.",
    annualContribution: region === 'uk'
      ? "How much you plan to contribute each year to your retirement savings (including pension contributions)."
      : "How much you plan to contribute each year to your retirement savings.",
    annualContributionIncrease: "The percentage your annual contribution will increase each year (e.g., with salary increases).",
    expectedReturn: "The annual rate of return you expect on your investments before inflation and fees.",
    inflationRate: "The expected annual inflation rate that will affect your purchasing power over time.",
    withdrawalRate: "The percentage of your retirement savings you plan to withdraw annually in retirement.",
    socialSecurityIncome: "Estimated monthly Social Security benefits during retirement.",
    statePension: "Estimated monthly State Pension you expect to receive. The full new State Pension is about £800 per month (as of 2025).",
    otherIncome: "Monthly income from other sources like private pensions, rental properties, or part-time work.",
    investmentFees: "Annual fees charged by investment funds or advisors as a percentage of assets.",
    isIsaWrapper: "ISAs (Individual Savings Accounts) allow tax-free growth and withdrawals.",
    isSipp: "SIPPs (Self-Invested Personal Pensions) provide tax relief on contributions but are taxable on withdrawal (25% tax-free).",
    includePersonalAllowance: "The UK tax-free Personal Allowance (currently £12,570 per year) can reduce tax on retirement income."
  };

  // Calculate retirement projections
  const calculateRetirement = () => {
    // Validate inputs
    if (retirementAge <= currentAge) {
      alert("Retirement age must be greater than current age.");
      return;
    }
    
    if (lifeExpectancy <= retirementAge) {
      alert("Life expectancy must be greater than retirement age.");
      return;
    }
    
    // Convert inflation-adjusted return rate if considering inflation
    const realReturnRate = includeInflation 
      ? (expectedReturn - inflationRate) / 100 
      : expectedReturn / 100;
    
    // Adjust return for fees
    const returnAfterFees = includeInflation 
      ? ((expectedReturn - inflationRate - investmentFees) / 100)
      : ((expectedReturn - investmentFees) / 100);
    
    // Years until retirement
    const yearsUntilRetirement = retirementAge - currentAge;
    // Years in retirement
    const yearsInRetirement = lifeExpectancy - retirementAge;
    // Total years to project
    const totalYears = lifeExpectancy - currentAge;
    
    // Calculate portfolio balance and contributions over time
    let balance = currentSavings;
    let totalContributions = currentSavings;
    let totalReturns = 0;
    
    const balanceByYear = [];
    const contributionsByYear = [];
    
    // UK-specific: Tax calculations for retirement savings
    const ukTaxImpact = region === 'uk' ? calculateUKTaxImpact(isSipp, isIsaWrapper, annualContribution) : 0;
    const effectiveAnnualContribution = region === 'uk' && isSipp 
      ? annualContribution * 1.25 // Adding basic tax relief of 25% for SIPP
      : annualContribution;
    
    // Pre-retirement phase: accumulation
    for (let year = 1; year <= yearsUntilRetirement; year++) {
      // Calculate this year's contribution with annual increase
      const yearlyContribution = year === 1 
        ? effectiveAnnualContribution 
        : effectiveAnnualContribution * Math.pow(1 + annualContributionIncrease / 100, year - 1);
      
      // Add contribution to balance
      balance += yearlyContribution;
      totalContributions += yearlyContribution;
      
      // Calculate return and add to balance
      const yearReturn = balance * returnAfterFees;
      balance += yearReturn;
      totalReturns += yearReturn;
      
      // Track data for charts
      balanceByYear.push({
        age: currentAge + year,
        year: year,
        balance: Math.round(balance),
        phase: 'accumulation',
        contribution: Math.round(yearlyContribution),
        totalContributions: Math.round(totalContributions),
        return: Math.round(yearReturn),
        totalReturns: Math.round(totalReturns)
      });
      
      contributionsByYear.push({
        age: currentAge + year,
        contribution: Math.round(yearlyContribution),
        cumulativeContribution: Math.round(totalContributions)
      });
    }
    
    // UK-specific: Tax adjustment for withdrawals if using SIPP
    const ukTaxAdjustment = region === 'uk' && isSipp ? 0.85 : 1; // Assuming 15% average tax rate on withdrawals (25% tax-free)
    
    // Retirement savings at retirement
    let retirementSavings = balance;
    
    // UK-specific: Apply tax adjustment to withdrawable amount if in SIPP
    const adjustedRetirementSavings = region === 'uk' && isSipp 
      ? (retirementSavings * 0.25) + (retirementSavings * 0.75 * ukTaxAdjustment) // 25% tax-free, rest taxed
      : retirementSavings;
    
    // Calculate income needed in retirement
    // Start with desired withdrawal as percentage of retirement savings
    const annualWithdrawal = adjustedRetirementSavings * (withdrawalRate / 100);
    
    // Monthly withdrawal from savings
    const monthlyWithdrawal = annualWithdrawal / 12;
    
    // Calculate other monthly income based on region
    const monthlyStateBenefits = includeStateBenefits 
      ? (region === 'uk' ? statePension : socialSecurityIncome) 
      : 0;
    
    const monthlyOtherIncome = otherIncome;
    
    // Total monthly retirement income
    const totalMonthlyIncome = monthlyWithdrawal + monthlyStateBenefits + monthlyOtherIncome;
    
    // Post-retirement phase: distribution
    let finalBalance = balance;
    let yearlyWithdrawal = annualWithdrawal;
    let lastSustainableAge = retirementAge;
    
    for (let year = 1; year <= yearsInRetirement; year++) {
      const currentAge = retirementAge + year;
      
      // Adjust withdrawal for inflation if selected
      if (includeInflation) {
        yearlyWithdrawal = annualWithdrawal * Math.pow(1 + inflationRate / 100, year);
      }
      
      // Calculate return for the year
      const yearReturn = finalBalance * returnAfterFees;
      
      // Update balance - use raw balance for calculations, but actual withdrawals are tax-adjusted
      finalBalance = finalBalance + yearReturn - yearlyWithdrawal / ukTaxAdjustment;
      
      // Track when savings are depleted
      if (finalBalance <= 0 && lastSustainableAge === retirementAge) {
        lastSustainableAge = currentAge - 1;
        finalBalance = 0;
      }
      
      // Track data for charts
      balanceByYear.push({
        age: currentAge,
        year: yearsUntilRetirement + year,
        balance: Math.max(0, Math.round(finalBalance)),
        phase: 'distribution',
        withdrawal: Math.round(yearlyWithdrawal),
        return: finalBalance > 0 ? Math.round(yearReturn) : 0
      });
    }
    
    // Calculate sustainability metrics
    const fundsSustainedUntilAge = finalBalance > 0 ? lifeExpectancy : lastSustainableAge;
    const fundingSurplus = Math.max(0, finalBalance);
    const fundingShortfall = fundsSustainedUntilAge < lifeExpectancy 
      ? (lifeExpectancy - fundsSustainedUntilAge) * yearlyWithdrawal 
      : 0;
    
    // Estimate yearly safe spending if funds need to last exactly to life expectancy
    const recalculatedSafeWithdrawalRate = calculateSafeWithdrawalRate(
      retirementSavings, 
      yearsInRetirement, 
      returnAfterFees, 
      inflationRate / 100
    );
    
    const safeAnnualSpending = retirementSavings * (recalculatedSafeWithdrawalRate / 100) * ukTaxAdjustment;
    const safeMonthlySpending = safeAnnualSpending / 12;
    
    // Calculate Monte Carlo simulation for success probability
    const successProbability = performMonteCarloSimulation(
      retirementSavings,
      withdrawalRate / 100,
      yearsInRetirement,
      expectedReturn / 100,
      inflationRate / 100,
      investmentFees / 100,
      region === 'uk' && isSipp ? ukTaxAdjustment : 1
    );
    
    // Calculate income breakdown
    const incomeBreakdownData = {
      portfolioWithdrawal: {
        monthly: monthlyWithdrawal,
        annual: annualWithdrawal,
        percentage: (monthlyWithdrawal / totalMonthlyIncome) * 100
      },
      stateBenefits: {
        monthly: monthlyStateBenefits,
        annual: monthlyStateBenefits * 12,
        percentage: (monthlyStateBenefits / totalMonthlyIncome) * 100,
        type: region === 'uk' ? 'State Pension' : 'Social Security'
      },
      otherIncome: {
        monthly: monthlyOtherIncome,
        annual: monthlyOtherIncome * 12,
        percentage: (monthlyOtherIncome / totalMonthlyIncome) * 100
      },
      total: {
        monthly: totalMonthlyIncome,
        annual: totalMonthlyIncome * 12
      }
    };
    
    // Needs analysis - how much of expenses will be covered
    const estimatedMonthlyExpenses = totalMonthlyIncome * 0.8; // Assuming 80% income replacement
    const needsCoverage = (totalMonthlyIncome / estimatedMonthlyExpenses) * 100;
    const needsAnalysisData = {
      estimatedMonthlyExpenses,
      coveragePercentage: needsCoverage,
      shortfall: Math.max(0, estimatedMonthlyExpenses - totalMonthlyIncome),
      surplus: Math.max(0, totalMonthlyIncome - estimatedMonthlyExpenses)
    };
    
    // Calculate fee impact
    const balanceWithoutFees = calculateBalanceWithoutFees(
      currentSavings,
      effectiveAnnualContribution,
      annualContributionIncrease / 100,
      yearsUntilRetirement,
      (expectedReturn - (includeInflation ? inflationRate : 0)) / 100,
      0
    );
    
    const feesImpact = {
      retirementBalanceWithFees: retirementSavings,
      retirementBalanceWithoutFees: balanceWithoutFees,
      feesAmount: balanceWithoutFees - retirementSavings,
      feesPercentage: ((balanceWithoutFees - retirementSavings) / balanceWithoutFees) * 100
    };
    
    // Set calculation results
    const results = {
      retirementSavings,
      adjustedRetirementSavings,
      annualWithdrawal,
      totalMonthlyIncome,
      fundsSustainedUntilAge,
      fundingSurplus,
      fundingShortfall,
      safeWithdrawalRate: recalculatedSafeWithdrawalRate,
      safeAnnualSpending,
      safeMonthlySpending,
      realReturnRate: returnAfterFees * 100,
      yearsUntilRetirement,
      yearsInRetirement,
      successProbability,
      feesImpact,
      ukTaxImpact
    };
    
    setRetirementResults(results);
    setBalanceData(balanceByYear);
    setContributionData(contributionsByYear);
    setIncomeBreakdown(incomeBreakdownData);
    setNeedsAnalysis(needsAnalysisData);
    setHasCalculated(true);
    
    // Track calculation in analytics
    trackCalculation();
  };
  
  // UK-specific tax impact calculation
  const calculateUKTaxImpact = (isSipp, isIsa, annualContribution) => {
    if (isSipp) {
      // Basic rate tax relief on pension contributions
      return annualContribution * 0.25; // 25% tax relief
    } else if (isIsa) {
      // No immediate tax benefit but tax-free growth and withdrawals
      return 0;
    } else {
      // No tax benefits
      return 0;
    }
  };
  
  // Calculate balance without fees
  const calculateBalanceWithoutFees = (
    initial, 
    annualContribution, 
    contributionGrowthRate, 
    years, 
    returnRate, 
    feeRate
  ) => {
    let balance = initial;
    
    for (let year = 1; year <= years; year++) {
      const yearlyContribution = annualContribution * Math.pow(1 + contributionGrowthRate, year - 1);
      balance += yearlyContribution;
      
      // Calculate return without fees
      balance *= (1 + returnRate);
    }
    
    return balance;
  };
  
  // Calculate safe withdrawal rate
  const calculateSafeWithdrawalRate = (principal, years, returnRate, inflationRate) => {
    // Binary search to find the withdrawal rate that depletes funds in exactly 'years'
    let low = 0.5;  // 0.5%
    let high = 20;  // 20%
    const tolerance = 0.01;
    
    while (high - low > tolerance) {
      const mid = (high + low) / 2;
      const rate = mid / 100;
      
      // Simulate retirement with this withdrawal rate
      let balance = principal;
      let withdrawal = principal * rate;
      
      for (let year = 1; year <= years; year++) {
        // Adjust withdrawal for inflation
        if (year > 1) {
          withdrawal *= (1 + inflationRate);
        }
        
        // Update balance
        balance = balance * (1 + returnRate) - withdrawal;
        
        // If balance goes negative, rate is too high
        if (balance < 0) {
          high = mid;
          break;
        }
        
        // If we've reached the end and have money left, rate might be too low
        if (year === years && balance > 0) {
          low = mid;
          break;
        }
      }
      
      // If the loop completed normally, the current rate is sustainable
      if (balance >= -0.01 * principal && balance <= 0.01 * principal) {
        return mid;
      }
      
      // If we didn't break out of the loop, adjust search space
      if (balance > 0.01 * principal) {
        low = mid;
      } else {
        high = mid;
      }
    }
    
    return (low + high) / 2;
  };
  
  // Monte Carlo simulation for retirement success probability
  const performMonteCarloSimulation = (
    initialBalance, 
    withdrawalRate, 
    years, 
    meanReturn, 
    inflationRate,
    feeRate,
    taxAdjustment = 1
  ) => {
    const numSimulations = 1000;
    let successCount = 0;
    
    for (let sim = 0; sim < numSimulations; sim++) {
      let balance = initialBalance;
      let withdrawal = initialBalance * withdrawalRate * taxAdjustment;
      
      let success = true;
      
      for (let year = 1; year <= years; year++) {
        // Adjust withdrawal for inflation
        if (year > 1) {
          withdrawal *= (1 + inflationRate);
        }
        
        // Add random variation to return
        const volatility = 0.1; // 10% standard deviation is typical
        const annualReturn = generateRandomReturn(meanReturn - feeRate, volatility);
        
        // Update balance - accounting for tax on withdrawals
        balance = balance * (1 + annualReturn) - (withdrawal / taxAdjustment);
        
        // Check if funds are depleted
        if (balance < 0) {
          success = false;
          break;
        }
      }
      
      if (success) {
        successCount++;
      }
    }
    
    return (successCount / numSimulations) * 100;
  };
  
  // Helper function to generate random returns
  const generateRandomReturn = (meanReturn, stdDev) => {
    // Box-Muller transform for normally distributed random numbers
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    
    // Apply mean and standard deviation
    return meanReturn + z0 * stdDev;
  };
  
  // Format currency based on region
  const formatCurrency = (value) => {
    return new Intl.NumberFormat(region === 'uk' ? 'en-GB' : 'en-US', {
      style: 'currency',
      currency: region === 'uk' ? 'GBP' : 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  // Format percentage
  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };
  
  // Save current scenario
  const saveScenario = () => {
    const newScenario = {
      id: Date.now(),
      name: scenarioName,
      region,
      currentAge,
      retirementAge,
      lifeExpectancy,
      currentSavings,
      annualContribution,
      annualContributionIncrease,
      expectedReturn,
      inflationRate,
      withdrawalRate,
      statePension: region === 'uk' ? statePension : undefined,
      socialSecurityIncome: region === 'us' ? socialSecurityIncome : undefined,
      includeStateBenefits,
      otherIncome,
      includeInflation,
      investmentFees,
      isIsaWrapper: region === 'uk' ? isIsaWrapper : undefined,
      isSipp: region === 'uk' ? isSipp : undefined,
      includePersonalAllowance: region === 'uk' ? includePersonalAllowance : undefined,
      results: retirementResults,
      balanceData,
      incomeBreakdown
    };
    
    setSavedScenarios([...savedScenarios, newScenario]);
    
    // You would add analytics tracking here in the real implementation
  };
  
  // Export results
  const exportResults = () => {
    alert("PDF export feature would generate a detailed report of your retirement plan");
    // You would add analytics tracking here
  };
  
  // Share results
  const shareResults = () => {
    alert("Share feature would allow you to send these results via email or social media");
    // You would add analytics tracking here
  };

  // Get color based on sustainability
  const getSustainabilityColor = (probability) => {
    if (probability >= 80) return "green";
    if (probability >= 60) return "yellow";
    return "red";
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          {region === 'uk' ? 'UK' : 'US'} Retirement Calculator
        </h2>
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
          placeholder="e.g., My Retirement Plan"
        />
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label htmlFor="currentAge" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              Current Age
              <button 
                className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={() => setShowTooltip('currentAge')}
              >
                <LucideIcons.HelpCircle size={16} />
              </button>
              {showTooltip === 'currentAge' && (
                <div className="absolute z-10 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
                  {tooltipContent.currentAge}
                  <button 
                    className="absolute top-1 right-1 text-white hover:text-gray-300"
                    onClick={() => setShowTooltip(null)}
                  >
                    <LucideIcons.X size={14} />
                  </button>
                </div>
              )}
            </label>
            <input
              type="number"
              id="currentAge"
              className="focus:ring-black focus:border-black block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
              value={currentAge}
              onChange={(e) => setCurrentAge(Number(e.target.value))}
              min="18"
              max="85"
            />
          </div>
          
          <div>
            <label htmlFor="retirementAge" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              Retirement Age
              <button 
                className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={() => setShowTooltip('retirementAge')}
              >
                <LucideIcons.HelpCircle size={16} />
              </button>
              {showTooltip === 'retirementAge' && (
                <div className="absolute z-10 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
                  {tooltipContent.retirementAge}
                  <button 
                    className="absolute top-1 right-1 text-white hover:text-gray-300"
                    onClick={() => setShowTooltip(null)}
                  >
                    <LucideIcons.X size={14} />
                  </button>
                </div>
              )}
            </label>
            <input
              type="range"
              id="retirementAge"
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              min={currentAge + 1}
              max="80"
              value={retirementAge}
              onChange={(e) => setRetirementAge(Number(e.target.value))}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{currentAge + 1}</span>
              <span>{retirementAge} years</span>
              <span>80</span>
            </div>
          </div>
          
          <div>
            <label htmlFor="lifeExpectancy" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              Life Expectancy
              <button 
                className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={() => setShowTooltip('lifeExpectancy')}
              >
                <LucideIcons.HelpCircle size={16} />
              </button>
              {showTooltip === 'lifeExpectancy' && (
                <div className="absolute z-10 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
                  {tooltipContent.lifeExpectancy}
                  <button 
                    className="absolute top-1 right-1 text-white hover:text-gray-300"
                    onClick={() => setShowTooltip(null)}
                  >
                    <LucideIcons.X size={14} />
                  </button>
                </div>
              )}
            </label>
            <input
              type="range"
              id="lifeExpectancy"
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              min={retirementAge + 1}
              max="105"
              value={lifeExpectancy}
              onChange={(e) => setLifeExpectancy(Number(e.target.value))}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{retirementAge + 1}</span>
              <span>{lifeExpectancy} years</span>
              <span>105</span>
            </div>
          </div>
          
          <div>
            <label htmlFor="currentSavings" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              Current Retirement Savings
              <button 
                className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={() => setShowTooltip('currentSavings')}
              >
                <LucideIcons.HelpCircle size={16} />
              </button>
              {showTooltip === 'currentSavings' && (
                <div className="absolute z-10 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
                  {tooltipContent.currentSavings}
                  <button 
                    className="absolute top-1 right-1 text-white hover:text-gray-300"
                    onClick={() => setShowTooltip(null)}
                  >
                    <LucideIcons.X size={14} />
                  </button>
                </div>
              )}
            </label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">{region === 'uk' ? '£' : '$'}</span>
              </div>
              <input
                type="number"
                id="currentSavings"
                className="focus:ring-black focus:border-black block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md p-2 border"
                value={currentSavings}
                onChange={(e) => setCurrentSavings(Number(e.target.value))}
                min="0"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="annualContribution" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              Annual Contribution
              <button 
                className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={() => setShowTooltip('annualContribution')}
              >
                <LucideIcons.HelpCircle size={16} />
              </button>
              {showTooltip === 'annualContribution' && (
                <div className="absolute z-10 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
                  {tooltipContent.annualContribution}
                  <button 
                    className="absolute top-1 right-1 text-white hover:text-gray-300"
                    onClick={() => setShowTooltip(null)}
                  >
                    <LucideIcons.X size={14} />
                  </button>
                </div>
              )}
            </label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">{region === 'uk' ? '£' : '$'}</span>
              </div>
              <input
                type="number"
                id="annualContribution"
                className="focus:ring-black focus:border-black block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md p-2 border"
                value={annualContribution}
                onChange={(e) => setAnnualContribution(Number(e.target.value))}
                min="0"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="annualContributionIncrease" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              Annual Contribution Increase (%)
              <button 
                className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={() => setShowTooltip('annualContributionIncrease')}
              >
                <LucideIcons.HelpCircle size={16} />
              </button>
              {showTooltip === 'annualContributionIncrease' && (
                <div className="absolute z-10 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
                  {tooltipContent.annualContributionIncrease}
                  <button 
                    className="absolute top-1 right-1 text-white hover:text-gray-300"
                    onClick={() => setShowTooltip(null)}
                  >
                    <LucideIcons.X size={14} />
                  </button>
                </div>
              )}
            </label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <input
                type="number"
                id="annualContributionIncrease"
                className="focus:ring-black focus:border-black block w-full pr-12 sm:text-sm border-gray-300 rounded-md p-2 border"
                value={annualContributionIncrease}
                onChange={(e) => setAnnualContributionIncrease(Number(e.target.value))}
                min="0"
                max="10"
                step="0.1"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">%</span>
              </div>
            </div>
          </div>
          
          {/* UK-specific inputs */}
          {region === 'uk' && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-md font-medium text-gray-700 mb-3">UK Tax Wrappers</h3>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    id="isSipp"
                    type="checkbox"
                    className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                    checked={isSipp}
                    onChange={(e) => setIsSipp(e.target.checked)}
                  />
                  <label htmlFor="isSipp" className="ml-2 block text-sm text-gray-700 flex items-center">
                    Include SIPP (Pension)
                    <button 
                      className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                      onClick={() => setShowTooltip('isSipp')}
                    >
                      <LucideIcons.HelpCircle size={14} />
                    </button>
                  </label>
                  {showTooltip === 'isSipp' && (
                    <div className="absolute z-10 ml-32 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
                      {tooltipContent.isSipp}
                      <button 
                        className="absolute top-1 right-1 text-white hover:text-gray-300"
                        onClick={() => setShowTooltip(null)}
                      >
                        <LucideIcons.X size={14} />
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center">
                  <input
                    id="isIsaWrapper"
                    type="checkbox"
                    className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                    checked={isIsaWrapper}
                    onChange={(e) => setIsIsaWrapper(e.target.checked)}
                  />
                  <label htmlFor="isIsaWrapper" className="ml-2 block text-sm text-gray-700 flex items-center">
                    Include ISA
                    <button 
                      className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                      onClick={() => setShowTooltip('isIsaWrapper')}
                    >
                      <LucideIcons.HelpCircle size={14} />
                    </button>
                  </label>
                  {showTooltip === 'isIsaWrapper' && (
                    <div className="absolute z-10 ml-32 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
                      {tooltipContent.isIsaWrapper}
                      <button 
                        className="absolute top-1 right-1 text-white hover:text-gray-300"
                        onClick={() => setShowTooltip(null)}
                      >
                        <LucideIcons.X size={14} />
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center">
                  <input
                    id="includePersonalAllowance"
                    type="checkbox"
                    className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                    checked={includePersonalAllowance}
                    onChange={(e) => setIncludePersonalAllowance(e.target.checked)}
                  />
                  <label htmlFor="includePersonalAllowance" className="ml-2 block text-sm text-gray-700 flex items-center">
                    Include Personal Allowance
                    <button 
                      className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                      onClick={() => setShowTooltip('includePersonalAllowance')}
                    >
                      <LucideIcons.HelpCircle size={14} />
                    </button>
                  </label>
                  {showTooltip === 'includePersonalAllowance' && (
                    <div className="absolute z-10 ml-32 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
                      {tooltipContent.includePersonalAllowance}
                      <button 
                        className="absolute top-1 right-1 text-white hover:text-gray-300"
                        onClick={() => setShowTooltip(null)}
                      >
                        <LucideIcons.X size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="space-y-6">
          <div>
            <label htmlFor="expectedReturn" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              Expected Annual Return (%)
              <button 
                className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={() => setShowTooltip('expectedReturn')}
              >
                <LucideIcons.HelpCircle size={16} />
              </button>
              {showTooltip === 'expectedReturn' && (
                <div className="absolute z-10 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
                  {tooltipContent.expectedReturn}
                  <button 
                    className="absolute top-1 right-1 text-white hover:text-gray-300"
                    onClick={() => setShowTooltip(null)}
                  >
                    <LucideIcons.X size={14} />
                  </button>
                </div>
              )}
            </label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <input
                type="number"
                id="expectedReturn"
                className="focus:ring-black focus:border-black block w-full pr-12 sm:text-sm border-gray-300 rounded-md p-2 border"
                value={expectedReturn}
                onChange={(e) => setExpectedReturn(Number(e.target.value))}
                min="0"
                max="20"
                step="0.1"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">%</span>
              </div>
            </div>
          </div>
          
          <div>
            <label htmlFor="inflationRate" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              Inflation Rate (%)
              <button 
                className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={() => setShowTooltip('inflationRate')}
              >
                <LucideIcons.HelpCircle size={16} />
              </button>
              {showTooltip === 'inflationRate' && (
                <div className="absolute z-10 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
                  {tooltipContent.inflationRate}
                  <button 
                    className="absolute top-1 right-1 text-white hover:text-gray-300"
                    onClick={() => setShowTooltip(null)}
                  >
                    <LucideIcons.X size={14} />
                  </button>
                </div>
              )}
            </label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <input
                type="number"
                id="inflationRate"
                className="focus:ring-black focus:border-black block w-full pr-12 sm:text-sm border-gray-300 rounded-md p-2 border"
                value={inflationRate}
                onChange={(e) => setInflationRate(Number(e.target.value))}
                min="0"
                max="10"
                step="0.1"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">%</span>
              </div>
            </div>
            <div className="mt-1 flex items-center">
              <input
                id="includeInflation"
                type="checkbox"
                className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                checked={includeInflation}
                onChange={(e) => setIncludeInflation(e.target.checked)}
              />
              <label htmlFor="includeInflation" className="ml-2 block text-sm text-gray-700">
                Account for inflation in calculations
              </label>
            </div>
          </div>
          
          <div>
            <label htmlFor="withdrawalRate" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              Withdrawal Rate (%)
              <button 
                className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={() => setShowTooltip('withdrawalRate')}
              >
                <LucideIcons.HelpCircle size={16} />
              </button>
              {showTooltip === 'withdrawalRate' && (
                <div className="absolute z-10 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
                  {tooltipContent.withdrawalRate}
                  <button 
                    className="absolute top-1 right-1 text-white hover:text-gray-300"
                    onClick={() => setShowTooltip(null)}
                  >
                    <LucideIcons.X size={14} />
                  </button>
                </div>
              )}
            </label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <input
                type="range"
                id="withdrawalRate"
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                min="2"
                max="10"
                step="0.1"
                value={withdrawalRate}
                onChange={(e) => setWithdrawalRate(Number(e.target.value))}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>2%</span>
                <span>{withdrawalRate}%</span>
                <span>10%</span>
              </div>
            </div>
          </div>
          
          <div>
            <label htmlFor="stateBenefits" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              Monthly {region === 'uk' ? 'State Pension' : 'Social Security'}
              <button 
                className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={() => setShowTooltip(region === 'uk' ? 'statePension' : 'socialSecurityIncome')}
              >
                <LucideIcons.HelpCircle size={16} />
              </button>
              {showTooltip === (region === 'uk' ? 'statePension' : 'socialSecurityIncome') && (
                <div className="absolute z-10 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
                  {region === 'uk' ? tooltipContent.statePension : tooltipContent.socialSecurityIncome}
                  <button 
                    className="absolute top-1 right-1 text-white hover:text-gray-300"
                    onClick={() => setShowTooltip(null)}
                  >
                    <LucideIcons.X size={14} />
                  </button>
                </div>
              )}
            </label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">{region === 'uk' ? '£' : '$'}</span>
              </div>
              <input
                type="number"
                id="stateBenefits"
                className="focus:ring-black focus:border-black block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md p-2 border"
                value={region === 'uk' ? statePension : socialSecurityIncome}
                onChange={(e) => {
                  if (region === 'uk') {
                    setStatePension(Number(e.target.value));
                  } else {
                    setSocialSecurityIncome(Number(e.target.value));
                  }
                }}
                min="0"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">/mo</span>
              </div>
            </div>
            <div className="mt-1 flex items-center">
              <input
                id="includeStateBenefits"
                type="checkbox"
                className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                checked={includeStateBenefits}
                onChange={(e) => setIncludeStateBenefits(e.target.checked)}
              />
              <label htmlFor="includeStateBenefits" className="ml-2 block text-sm text-gray-700">
                Include {region === 'uk' ? 'State Pension' : 'Social Security'} in retirement income
              </label>
            </div>
          </div>
          
          <div>
            <label htmlFor="otherIncome" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              Other Monthly Income
              <button 
                className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={() => setShowTooltip('otherIncome')}
              >
                <LucideIcons.HelpCircle size={16} />
              </button>
              {showTooltip === 'otherIncome' && (
                <div className="absolute z-10 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
                  {tooltipContent.otherIncome}
                  <button 
                    className="absolute top-1 right-1 text-white hover:text-gray-300"
                    onClick={() => setShowTooltip(null)}
                  >
                    <LucideIcons.X size={14} />
                  </button>
                </div>
              )}
            </label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">{region === 'uk' ? '£' : '$'}</span>
              </div>
              <input
                type="number"
                id="otherIncome"
                className="focus:ring-black focus:border-black block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md p-2 border"
                value={otherIncome}
                onChange={(e) => setOtherIncome(Number(e.target.value))}
                min="0"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">/mo</span>
              </div>
            </div>
          </div>
          
          <div>
            <label htmlFor="investmentFees" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              Investment Fees (%)
              <button 
                className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={() => setShowTooltip('investmentFees')}
              >
                <LucideIcons.HelpCircle size={16} />
              </button>
              {showTooltip === 'investmentFees' && (
                <div className="absolute z-10 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
                  {tooltipContent.investmentFees}
                  <button 
                    className="absolute top-1 right-1 text-white hover:text-gray-300"
                    onClick={() => setShowTooltip(null)}
                  >
                    <LucideIcons.X size={14} />
                  </button>
                </div>
              )}
            </label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <input
                type="number"
                id="investmentFees"
                className="focus:ring-black focus:border-black block w-full pr-12 sm:text-sm border-gray-300 rounded-md p-2 border"
                value={investmentFees}
                onChange={(e) => setInvestmentFees(Number(e.target.value))}
                min="0"
                max="3"
                step="0.01"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">%</span>
              </div>
            </div>
          </div>
          
          <div className="pt-4">
            <button
              onClick={calculateRetirement}
              className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transition-colors"
            >
              Calculate Retirement Plan
            </button>
          </div>
        </div>
      </div>
      
      {/* Results Section */}
      {hasCalculated && retirementResults && (
        <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
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
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-medium text-gray-700 mb-4">Retirement Overview</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white rounded-lg p-4 shadow-sm border-t-4 border-blue-500">
                    <h4 className="font-medium text-gray-700 mb-2">Retirement Savings at Age {retirementAge}</h4>
                    <p className="text-2xl font-semibold text-gray-800 mb-1">
                      {formatCurrency(retirementResults.retirementSavings)}
                    </p>
                    <p className="text-sm text-gray-600">
                      After {retirementResults.yearsUntilRetirement} years of saving
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 shadow-sm border-t-4 border-green-500">
                    <h4 className="font-medium text-gray-700 mb-2">Monthly Retirement Income</h4>
                    <p className="text-2xl font-semibold text-gray-800 mb-1">
                      {formatCurrency(retirementResults.totalMonthlyIncome)}
                    </p>
                    <p className="text-sm text-gray-600">
                      At {formatPercentage(withdrawalRate)} withdrawal rate
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 shadow-sm border-t-4 border-yellow-500">
                    <h4 className="font-medium text-gray-700 mb-2">Retirement Duration</h4>
                    <p className="text-2xl font-semibold text-gray-800 mb-1">
                      {retirementResults.yearsInRetirement} years
                    </p>
                    <p className="text-sm text-gray-600">
                      From age {retirementAge} to {lifeExpectancy}
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 shadow-sm border-t-4 border-purple-500">
                    <h4 className="font-medium text-gray-700 mb-2">Funds Last Until Age</h4>
                    <p className={`text-2xl font-semibold mb-1 ${
                      retirementResults.fundsSustainedUntilAge >= lifeExpectancy ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {retirementResults.fundsSustainedUntilAge}
                    </p>
                    <p className="text-sm text-gray-600">
                      {retirementResults.fundsSustainedUntilAge >= lifeExpectancy 
                        ? `With ${formatCurrency(retirementResults.fundingSurplus)} remaining` 
                        : `${lifeExpectancy - retirementResults.fundsSustainedUntilAge} years short of goal`}
                    </p>
                  </div>
                </div>
                
                {/* UK-specific tax info */}
                {region === 'uk' && (isSipp || isIsaWrapper) && (
                  <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
                    <h4 className="font-medium text-gray-700 mb-2">UK Tax Advantages</h4>
                    <div className="space-y-2">
                      {isSipp && (
                        <div className="flex items-start">
                          <LucideIcons.TrendingUp className="text-green-500 mr-2 mt-0.5 flex-shrink-0" size={16} />
                          <div>
                            <p className="text-sm text-gray-700 font-medium">SIPP Tax Relief</p>
                            <p className="text-sm text-gray-600">
                              Your pension contributions receive {formatPercentage(25)} tax relief, adding {formatCurrency(annualContribution * 0.25)} annually to your retirement savings.
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {isIsaWrapper && (
                        <div className="flex items-start">
                          <LucideIcons.Shield className="text-blue-500 mr-2 mt-0.5 flex-shrink-0" size={16} />
                          <div>
                            <p className="text-sm text-gray-700 font-medium">ISA Tax Protection</p>
                            <p className="text-sm text-gray-600">
                              Your ISA investments grow tax-free and withdrawals are not subject to income or capital gains tax.
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {isSipp && (
                        <div className="flex items-start">
                        <LucideIcons.PiggyBank className="text-purple-500 mr-2 mt-0.5 flex-shrink-0" size={16} />
                        <div>
                          <p className="text-sm text-gray-700 font-medium">Pension Withdrawal</p>
                          <p className="text-sm text-gray-600">
                            25% of your pension can be taken tax-free, with the remainder taxed at your income tax rate.
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {includePersonalAllowance && (
                      <div className="flex items-start">
                        <LucideIcons.Tag className="text-yellow-500 mr-2 mt-0.5 flex-shrink-0" size={16} />
                        <div>
                          <p className="text-sm text-gray-700 font-medium">Personal Allowance</p>
                          <p className="text-sm text-gray-600">
                            You'll have a £12,570 annual tax-free allowance in retirement (as of 2025).
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className={`p-4 rounded-md mb-6 ${
                retirementResults.successProbability >= 80 
                  ? 'bg-green-50 border border-green-200' 
                  : retirementResults.successProbability >= 60
                    ? 'bg-yellow-50 border border-yellow-200'
                    : 'bg-red-50 border border-red-200'
              }`}>
                <h4 className="font-medium text-gray-700 mb-2">Retirement Plan Probability of Success</h4>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">0%</span>
                  <span className="text-sm font-medium">100%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${
                      retirementResults.successProbability >= 80 
                        ? 'bg-green-500' 
                        : retirementResults.successProbability >= 60
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                    }`}
                    style={{ width: `${retirementResults.successProbability}%` }}
                  ></div>
                </div>
                <div className="mt-2 flex items-center">
                  <span className={`text-lg font-semibold ${
                    retirementResults.successProbability >= 80 
                      ? 'text-green-600' 
                      : retirementResults.successProbability >= 60
                        ? 'text-yellow-600'
                        : 'text-red-600'
                  }`}>
                    {formatPercentage(retirementResults.successProbability)}
                  </span>
                  <span className="text-sm text-gray-600 ml-2">success probability</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {retirementResults.successProbability >= 80 
                    ? "Your retirement plan is on solid ground! Your savings are likely to last throughout your retirement." 
                    : retirementResults.successProbability >= 60
                      ? "Your plan has a moderate chance of success, but consider increasing savings or adjusting expectations."
                      : "Your plan faces significant risks. Consider increasing savings, delaying retirement, or reducing expenses."}
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-medium text-gray-700 mb-2">Safe Withdrawal Analysis</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Based on your inputs, we've calculated a safe withdrawal rate to make your savings last exactly to age {lifeExpectancy}.
                </p>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Strategy</th>
                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Income</th>
                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Annual Income</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">Your Plan</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatPercentage(withdrawalRate)}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(retirementResults.annualWithdrawal / 12)}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(retirementResults.annualWithdrawal)}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">Safe Rate</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {formatPercentage(retirementResults.safeWithdrawalRate)}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(retirementResults.safeMonthlySpending)}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(retirementResults.safeAnnualSpending)}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">Difference</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {formatPercentage(withdrawalRate - retirementResults.safeWithdrawalRate)}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency((retirementResults.annualWithdrawal / 12) - retirementResults.safeMonthlySpending)}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(retirementResults.annualWithdrawal - retirementResults.safeAnnualSpending)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
  <h3 className="text-xl font-medium text-gray-700 mb-4">Retirement Income Breakdown</h3>
  
  {incomeBreakdown && (
    <div className="space-y-4">
      <div className="flex items-center">
        <div className="w-full bg-gray-200 rounded-full h-5 flex overflow-hidden">
          {incomeBreakdown.portfolioWithdrawal && (
            <div 
              className="h-5 rounded-l-full bg-blue-500" 
              style={{ 
                width: `${incomeBreakdown.portfolioWithdrawal.percentage}%`
              }}
            ></div>
          )}
          {incomeBreakdown.stateBenefits && includeStateBenefits && (
            <div 
              className="h-5 bg-green-500" 
              style={{ 
                width: `${incomeBreakdown.stateBenefits.percentage}%`
              }}
            ></div>
          )}
          {incomeBreakdown.otherIncome && incomeBreakdown.otherIncome.monthly > 0 && (
            <div 
              className="h-5 rounded-r-full bg-purple-500" 
              style={{ 
                width: `${incomeBreakdown.otherIncome.percentage}%`
              }}
            ></div>
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Annual</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm">
                  <span className="flex items-center">
                    <span className="h-3 w-3 rounded-full bg-blue-500 mr-2"></span>
                    <span className="text-gray-900">Portfolio Withdrawals</span>
                  </span>
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                  {formatCurrency(incomeBreakdown.portfolioWithdrawal.monthly)}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                  {formatCurrency(incomeBreakdown.portfolioWithdrawal.annual)}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                  {formatPercentage(incomeBreakdown.portfolioWithdrawal.percentage)}
                </td>
              </tr>
              {includeStateBenefits && (
                <tr>
                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                    <span className="flex items-center">
                      <span className="h-3 w-3 rounded-full bg-green-500 mr-2"></span>
                      <span className="text-gray-900">{incomeBreakdown.stateBenefits.type}</span>
                    </span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(incomeBreakdown.stateBenefits.monthly)}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(incomeBreakdown.stateBenefits.annual)}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                    {formatPercentage(incomeBreakdown.stateBenefits.percentage)}
                  </td>
                </tr>
              )}
              {incomeBreakdown.otherIncome && incomeBreakdown.otherIncome.monthly > 0 && (
                <tr>
                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                    <span className="flex items-center">
                      <span className="h-3 w-3 rounded-full bg-purple-500 mr-2"></span>
                      <span className="text-gray-900">Other Income</span>
                    </span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(incomeBreakdown.otherIncome.monthly)}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(incomeBreakdown.otherIncome.annual)}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                    {formatPercentage(incomeBreakdown.otherIncome.percentage)}
                  </td>
                </tr>
              )}
              <tr className="bg-gray-50">
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">Total</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  {formatCurrency(incomeBreakdown.total.monthly)}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  {formatCurrency(incomeBreakdown.total.annual)}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      {needsAnalysis && (
        <div className="bg-white rounded-lg p-4 shadow-sm mt-4">
          <h4 className="font-medium text-gray-700 mb-2">Retirement Needs Coverage</h4>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-600">Estimated Monthly Expenses</span>
            <span className="text-sm font-medium text-gray-800">
              {formatCurrency(needsAnalysis.estimatedMonthlyExpenses)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
            <div 
              className={`h-2.5 rounded-full ${
                needsAnalysis.coveragePercentage >= 100 ? 'bg-green-500' : 'bg-yellow-500'
              }`}
              style={{ 
                width: `${Math.min(100, needsAnalysis.coveragePercentage)}%`
              }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>0%</span>
            <span>{formatPercentage(Math.min(100, needsAnalysis.coveragePercentage))} covered</span>
            <span>100%</span>
          </div>
          
          {needsAnalysis.coveragePercentage >= 100 ? (
            <div className="text-sm text-green-600 flex items-center">
              <LucideIcons.CheckCircle className="mr-1" size={16} />
              You have a surplus of {formatCurrency(needsAnalysis.surplus)} per month.
            </div>
          ) : (
            <div className="text-sm text-yellow-600 flex items-center">
              <LucideIcons.AlertTriangle className="mr-1" size={16} />
              You have a shortfall of {formatCurrency(needsAnalysis.shortfall)} per month.
            </div>
          )}
        </div>
      )}
    </div>
  )}
</div>
</div>

<div>
  <div className="bg-gray-50 rounded-lg p-6 mb-6">
    <h3 className="text-xl font-medium text-gray-700 mb-4">Retirement Savings Growth</h3>
    
    <div className="h-64 md:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={balanceData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="age" 
            label={{ value: 'Age', position: 'insideBottomRight', offset: -10 }} 
          />
          <YAxis 
            tickFormatter={(value) => value.toLocaleString(region === 'uk' ? 'en-GB' : 'en-US', { 
              style: 'currency', 
              currency: region === 'uk' ? 'GBP' : 'USD',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
              notation: 'compact'
            })} 
          />
          <Tooltip 
            formatter={(value) => [value.toLocaleString(region === 'uk' ? 'en-GB' : 'en-US', { 
              style: 'currency', 
              currency: region === 'uk' ? 'GBP' : 'USD',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }), '']} 
            labelFormatter={(label) => `Age ${label}`}
          />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="balance" 
            name="Portfolio Balance" 
            stroke="#3b82f6" 
            fill="#93c5fd" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
    
    <p className="text-xs text-gray-500 mt-2 italic">
      Chart shows projected retirement savings balance over time, including accumulation and distribution phases.
    </p>
  </div>
  
  <div className="bg-gray-50 rounded-lg p-6">
    <h3 className="text-xl font-medium text-gray-700 mb-4">Impact of Investment Fees</h3>
    
    <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
      <h4 className="font-medium text-gray-700 mb-2">Fee Impact at Retirement</h4>
      <div className="flex items-center mb-2">
        <div className="w-full">
          <div className="flex justify-between mb-1">
            <span className="text-sm text-gray-600">With {formatPercentage(investmentFees)} Fees</span>
            <span className="text-sm font-medium">{formatCurrency(retirementResults.feesImpact.retirementBalanceWithFees)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
            <div 
              className="bg-blue-500 h-2.5 rounded-full"
              style={{ width: `${100 - retirementResults.feesImpact.feesPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center mb-2">
        <div className="w-full">
          <div className="flex justify-between mb-1">
            <span className="text-sm text-gray-600">Without Fees</span>
            <span className="text-sm font-medium">{formatCurrency(retirementResults.feesImpact.retirementBalanceWithoutFees)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
            <div 
              className="bg-green-500 h-2.5 rounded-full"
              style={{ width: '100%' }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-gray-50 rounded-md">
        <p className="text-sm font-medium text-gray-800">
          Fee Cost: {formatCurrency(retirementResults.feesImpact.feesAmount)}
        </p>
        <p className="text-sm text-gray-600">
          Fees reduce your retirement savings by {formatPercentage(retirementResults.feesImpact.feesPercentage)}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Even a small percentage in fees can significantly impact your retirement savings over time.
        </p>
      </div>
    </div>
    
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <h4 className="font-medium text-gray-700 mb-2">Retirement Plan Recommendations</h4>
      <div className="space-y-3">
        {retirementResults.successProbability < 80 && (
          <div className="flex items-start">
            <LucideIcons.AlertTriangle className="text-yellow-500 mr-2 mt-0.5 flex-shrink-0" size={16} />
            <p className="text-sm text-gray-600">
              Your plan has a {formatPercentage(retirementResults.successProbability)} chance of success. Consider adjusting your strategy.
            </p>
          </div>
        )}
        
        {withdrawalRate > retirementResults.safeWithdrawalRate && (
          <div className="flex items-start">
            <LucideIcons.TrendingDown className="text-red-500 mr-2 mt-0.5 flex-shrink-0" size={16} />
            <p className="text-sm text-gray-600">
              Your withdrawal rate ({formatPercentage(withdrawalRate)}) is higher than the calculated safe rate ({formatPercentage(retirementResults.safeWithdrawalRate)}). Consider reducing planned expenses.
            </p>
          </div>
        )}
        
        {retirementResults.fundsSustainedUntilAge < lifeExpectancy && (
          <div className="flex items-start">
            <LucideIcons.Clock className="text-red-500 mr-2 mt-0.5 flex-shrink-0" size={16} />
            <p className="text-sm text-gray-600">
              Your savings may run out at age {retirementResults.fundsSustainedUntilAge}, {lifeExpectancy - retirementResults.fundsSustainedUntilAge} years before your planned life expectancy.
            </p>
          </div>
        )}
        
        {annualContribution < (annualContribution * 1.25) && retirementResults.successProbability < 80 && (
          <div className="flex items-start">
            <LucideIcons.PiggyBank className="text-blue-500 mr-2 mt-0.5 flex-shrink-0" size={16} />
            <p className="text-sm text-gray-600">
              Increasing your annual contribution by 25% to {formatCurrency(annualContribution * 1.25)} could significantly improve your retirement outlook.
            </p>
          </div>
        )}
        
        {needsAnalysis && needsAnalysis.coveragePercentage < 100 && (
          <div className="flex items-start">
            <LucideIcons.DollarSign className="text-yellow-500 mr-2 mt-0.5 flex-shrink-0" size={16} />
            <p className="text-sm text-gray-600">
              Your retirement income may cover only {formatPercentage(needsAnalysis.coveragePercentage)} of your estimated expenses. Consider additional income sources.
            </p>
          </div>
        )}
        
        {investmentFees > 0.5 && retirementResults.feesImpact.feesPercentage > 10 && (
          <div className="flex items-start">
            <LucideIcons.Percent className="text-green-500 mr-2 mt-0.5 flex-shrink-0" size={16} />
            <p className="text-sm text-gray-600">
              Reducing your investment fees from {formatPercentage(investmentFees)} to 0.5% could add {formatCurrency(retirementResults.feesImpact.feesAmount * 0.5 / investmentFees)} to your retirement savings.
            </p>
          </div>
        )}
        
        {region === 'uk' && !isSipp && !isIsaWrapper && (
          <div className="flex items-start">
            <LucideIcons.Umbrella className="text-blue-500 mr-2 mt-0.5 flex-shrink-0" size={16} />
            <p className="text-sm text-gray-600">
              Consider using tax-efficient wrappers like SIPPs and ISAs to boost your retirement savings through tax relief and tax-free growth.
            </p>
          </div>
        )}
        
        {region === 'uk' && retirementAge < 67 && includeStateBenefits && (
          <div className="flex items-start">
            <LucideIcons.Info className="text-blue-500 mr-2 mt-0.5 flex-shrink-0" size={16} />
            <p className="text-sm text-gray-600">
              You've planned to retire at {retirementAge}, but State Pension is typically available from age 67. Plan for this gap in State Pension income.
            </p>
          </div>
        )}
        
        {region === 'us' && retirementAge < 62 && includeStateBenefits && (
          <div className="flex items-start">
            <LucideIcons.Info className="text-blue-500 mr-2 mt-0.5 flex-shrink-0" size={16} />
            <p className="text-sm text-gray-600">
              You've planned to retire at {retirementAge}, but Social Security benefits start at age 62 (reduced) or 67 (full). Plan for this gap in Social Security income.
            </p>
          </div>
        )}
        
        {retirementResults.successProbability >= 90 && (
          <div className="flex items-start">
            <LucideIcons.CheckCircle className="text-green-500 mr-2 mt-0.5 flex-shrink-0" size={16} />
            <p className="text-sm text-gray-600">
              Your retirement plan is on solid ground with a {formatPercentage(retirementResults.successProbability)} chance of success. Consider setting aside funds for legacy or additional lifestyle goals.
            </p>
          </div>
        )}
      </div>
    </div>
  </div>
</div>
</div>

{/* Saved Scenarios Section */}
{savedScenarios.length > 0 && (
  <div className="mt-8 border-t border-gray-200 pt-6">
    <h3 className="text-lg font-medium text-gray-700 mb-4">Saved Scenarios</h3>
    <div className="overflow-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Retirement Age</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Income</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Funds Last Until</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Success Probability</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {savedScenarios.map((scenario) => (
            <tr key={scenario.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{scenario.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 uppercase">{scenario.region}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{scenario.retirementAge}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Intl.NumberFormat(scenario.region === 'uk' ? 'en-GB' : 'en-US', {
                  style: 'currency',
                  currency: scenario.region === 'uk' ? 'GBP' : 'USD',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(scenario.results.totalMonthlyIncome)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  scenario.results.fundsSustainedUntilAge >= scenario.lifeExpectancy ? 
                    'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  Age {scenario.results.fundsSustainedUntilAge}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  scenario.results.successProbability >= 80 ? 'bg-green-100 text-green-800' : 
                  scenario.results.successProbability >= 60 ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-red-100 text-red-800'
                }`}>
                  {scenario.results.successProbability.toFixed(1)}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)}
</div>
)}
      
      <div className="bg-white rounded-lg p-6 mt-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          {region === 'uk' ? 'UK' : 'US'} Retirement Planning Guide
        </h2>
        
        <div className="prose max-w-none">
          <p>
            Retirement planning is a journey that requires careful consideration of various factors. 
            Use this calculator to experiment with different scenarios and develop a robust plan for your future.
          </p>
          
          <h3>Key Retirement Planning Concepts</h3>
          
          {/* Region-specific content */}
          {region === 'uk' ? (
            <div>
              <h4>UK Pension System</h4>
              <p>
                The UK retirement system consists of three main pillars: the State Pension, workplace pensions, 
                and private savings. Understanding how these work together is crucial for building a secure retirement.
              </p>
              
              <h4>State Pension</h4>
              <p>
                The UK State Pension provides a foundation for retirement income. The full new State Pension 
                is currently around £800 per month (as of 2025), but the amount you'll receive depends on your National 
                Insurance contribution record. Most people need at least 35 qualifying years to receive the full amount.
              </p>
              
              <h4>Tax-Efficient Savings</h4>
              <p>
                SIPPs (Self-Invested Personal Pensions) and ISAs (Individual Savings Accounts) offer powerful tax advantages:
              </p>
              <ul>
                <li><strong>SIPPs:</strong> Contributions receive tax relief at your income tax rate, and investments grow tax-free. 
                25% of withdrawals can be taken tax-free, with the remainder taxed at your income tax rate.</li>
                <li><strong>ISAs:</strong> Contributions are made from after-tax income, but all growth and withdrawals are completely tax-free.</li>
              </ul>
              
              <h4>Lifetime Allowance</h4>
              <p>
                The Lifetime Allowance that previously capped tax-advantaged pension savings has been abolished, but it's important to 
                stay informed about potential changes to pension tax rules that could affect your retirement planning.
              </p>
            </div>
          ) : (
            <div>
              <h4>The 4% Rule</h4>
              <p>
                A common guideline suggests that retirees can withdraw approximately 4% of their retirement savings annually 
                (adjusted for inflation) with a high probability of not outliving their money over a 30-year retirement. 
                However, this is just a starting point and should be adjusted based on your specific circumstances.
              </p>
              
              <h4>Social Security Benefits</h4>
              <p>
                Social Security provides retirement benefits based on your earnings history. While you can begin receiving 
                reduced benefits at age 62, waiting until your full retirement age (66-67 depending on birth year) or even 
                age 70 can significantly increase your monthly benefit amount.
              </p>
              
              <h4>Tax-Advantaged Accounts</h4>
              <p>
                The US offers several tax-advantaged retirement accounts:
              </p>
              <ul>
                <li><strong>401(k)/403(b):</strong> Employer-sponsored plans with potential matching contributions.</li>
                <li><strong>Traditional IRA:</strong> Contributions may be tax-deductible, and earnings grow tax-deferred.</li>
                <li><strong>Roth IRA:</strong> Contributions are made with after-tax dollars, but qualified withdrawals are tax-free.</li>
              </ul>
            </div>
          )}
          
          <h4>Inflation's Impact</h4>
          <p>
            Even modest inflation can significantly erode purchasing power over time. At 2.5% annual inflation, 
            the buying power of your money is cut in half in about 28 years. Accounting for inflation in your 
            retirement planning is essential for maintaining your lifestyle.
          </p>
          
          <h4>Investment Fees Matter</h4>
          <p>
            Even a 1% difference in investment fees can reduce your retirement savings by hundreds of thousands of {region === 'uk' ? 'pounds' : 'dollars'} over 
            a lifetime. Low-cost index funds and ETFs can help minimize these costs and potentially increase your retirement income.
          </p>
          
          <h3>Steps to Improve Your Retirement Outlook</h3>
          <ol>
            <li><strong>Increase your savings rate</strong> - Even small increases in your annual contributions can have a significant impact over time.</li>
            <li><strong>Extend your working years</strong> - Delaying retirement by even a few years can dramatically improve your financial situation.</li>
            <li><strong>Reduce investment fees</strong> - Look for low-cost investment options to maximize your returns.</li>
            <li><strong>Diversify your investments</strong> - A well-diversified portfolio can help manage risk while pursuing growth.</li>
            <li><strong>Plan for healthcare costs</strong> - Healthcare often represents a significant expense in retirement.</li>
            <li><strong>Consider tax-efficient withdrawal strategies</strong> - How you withdraw from different accounts can impact your tax burden.</li>
            <li><strong>Reevaluate regularly</strong> - Review and adjust your retirement plan at least annually.</li>
            {region === 'uk' && (
              <li><strong>Maximize tax wrappers</strong> - Make full use of SIPPs and ISAs to grow your retirement funds tax-efficiently.</li>
            )}
            {region === 'us' && (
              <li><strong>Optimize Social Security</strong> - Carefully consider when to claim benefits to maximize your lifetime income.</li>
            )}
          </ol>
          
          <p>
            Remember that retirement planning is not a one-time event but an ongoing process. As your life circumstances change, 
            your retirement strategy should evolve accordingly.
          </p>
          
          {/* Additional region-specific resources */}
          {region === 'uk' && (
            <div>
              <h3>UK Retirement Planning Resources</h3>
              <ul>
                <li><strong>Money Helper (formerly Pension Wise)</strong> - Free and impartial guidance about your pension options</li>
                <li><strong>Check your State Pension</strong> - Visit GOV.UK to check your State Pension forecast</li>
                <li><strong>Financial Conduct Authority (FCA)</strong> - Regulated financial advice register</li>
              </ul>
            </div>
          )}
          
          {region === 'us' && (
            <div>
              <h3>US Retirement Planning Resources</h3>
              <ul>
                <li><strong>Social Security Administration</strong> - Check your benefits and retirement age</li>
                <li><strong>IRS</strong> - Information on contribution limits and withdrawal rules for retirement accounts</li>
                <li><strong>Medicare</strong> - Healthcare coverage options in retirement</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RetirementCalculator;
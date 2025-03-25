import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import * as LucideIcons from 'lucide-react';
import './index.css';
import './App.css';
import RetirementCalculator from './RetirementCalculator';
import AssetAllocationOptimizer from './AssetAllocationOptimizer';
import PortfolioRebalancingCalculator from './PortfolioRebalancingCalculator';
import DollarCostAveragingCalculator from './DollarCostAveragingCalculator';
import UKFeeCalculator from './UKFeeCalculator';
import PlatformComparison from './PlatformComparison';
import SavedPortfolios from './SavedPortfolios';
import './firebase-config';


const FourStarFees = () => {
  // Navigation state
  const [activeTab, setActiveTab] = useState('calculator');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(null);
  const [advancedMode, setAdvancedMode] = useState(false);
  const [emailSignup, setEmailSignup] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [activeCalculator, setActiveCalculator] = useState('fees');
  const [region, setRegion] = useState('uk'); // Default to UK region

  // State for form inputs
  const [initialInvestment, setInitialInvestment] = useState(10000);
  const [annualContribution, setAnnualContribution] = useState(5000);
  const [investmentPeriod, setInvestmentPeriod] = useState(30);
  const [expectedReturn, setExpectedReturn] = useState(7);
  const [annualFee, setAnnualFee] = useState(2);
  const [advisoryFee, setAdvisoryFee] = useState(1);
  const [tradingCosts, setTradingCosts] = useState(0.2);
  const [taxDrag, setTaxDrag] = useState(0.5);
  
  // State for calculation results
  const [withoutFeesResult, setWithoutFeesResult] = useState(0);
  const [withFeesResult, setWithFeesResult] = useState(0);
  const [feesTotal, setFeesTotal] = useState(0);
  const [feePercentage, setFeePercentage] = useState(0);
  const [tRexScore, setTRexScore] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [scenarioName, setScenarioName] = useState('My Investment');
  const [savedScenarios, setSavedScenarios] = useState([]);

  // Blog post data
  const blogPosts = [
    {
      id: 1,
      title: "Understanding the Hidden Impact of Investment Fees",
      excerpt: "Most investors underestimate how fees erode their returns over time. Here's what you need to know about the true cost of investment fees.",
      date: "March 20, 2025",
      author: "Financial Education Team",
      category: "Fee Education",
      featuredImage: "/api/placeholder/800/400",
      content: `
        <h2>The Compounding Effect of Fees</h2>
        <p>When you invest your money, you're likely focused on the potential returns. But there's a silent factor working against you: fees. Investment fees might seem insignificant in the short term, but over decades, they can substantially reduce your wealth.</p>
        
        <p>Consider this: a 1% difference in annual fees can reduce your retirement savings by nearly 30% over 40 years. That's the difference between retiring comfortably and potentially struggling financially.</p>
        
        <h2>Types of Investment Fees</h2>
        <p>Understanding the different fees you pay is crucial:</p>
        <ul>
          <li><strong>Management Expense Ratio (MER):</strong> The annual fee charged by funds to cover operating expenses, management fees, and administrative costs.</li>
          <li><strong>Trading Costs:</strong> Expenses incurred when securities are bought and sold within a fund.</li>
          <li><strong>Advisor Fees:</strong> Charges for professional investment advice, typically a percentage of assets under management.</li>
          <li><strong>Account Fees:</strong> Fixed charges for maintaining your investment account.</li>
        </ul>
        
        <h2>The T-Rex Score: A Better Way to Understand Fee Impact</h2>
        <p>Developed by Larry Bates, the T-Rex Score is a simple yet powerful way to understand how much of your potential investment returns you actually keep after fees. A T-Rex Score of 80% means you keep 80% of your potential returns, while 20% goes to fees.</p>
        
        <p>Most investors are shocked to discover their T-Rex Score is often below 50%, meaning they're losing more than half of their potential returns to fees over long investment periods.</p>
        
        <h2>Steps to Minimize Fee Impact</h2>
        <p>Here are practical steps to reduce the impact of fees on your investments:</p>
        <ol>
          <li>Choose low-cost index funds or ETFs when possible</li>
          <li>Compare fee structures across different investment platforms</li>
          <li>Consider fee-based rather than commission-based financial advice</li>
          <li>Regularly review your portfolio for fee optimization opportunities</li>
          <li>Be wary of actively managed funds with high expense ratios</li>
        </ol>
        
        <p>Use our calculator to discover your personal T-Rex Score and take control of your investment future today.</p>
      `
    },
    {
      id: 2,
      title: "Index Funds vs. Actively Managed Funds: The Fee Difference",
      excerpt: "Is the higher cost of active management worth it? We break down the numbers and show you how to make an informed decision.",
      date: "March 15, 2025",
      author: "Investment Research Team",
      category: "Investment Strategy",
      featuredImage: "/api/placeholder/800/400",
      content: `
        <h2>Active vs. Passive: The Great Debate</h2>
        <p>One of the most significant choices investors face is between actively managed funds and passively managed index funds. This decision has major implications for both performance and the fees you'll pay.</p>
        
        <p>Actively managed funds employ portfolio managers who make specific investment decisions, attempting to outperform the market. Index funds, by contrast, simply track a market index like the S&P 500, requiring less management and resulting in lower fees.</p>
        
        <h2>The Fee Comparison</h2>
        <p>The difference in fees between these approaches is substantial:</p>
        <ul>
          <li><strong>Average actively managed equity fund:</strong> 1.0% - 1.5% annual expense ratio</li>
          <li><strong>Average index equity fund:</strong> 0.1% - 0.3% annual expense ratio</li>
        </ul>
        
        <p>This difference of roughly 1% might seem minor, but when compounded over decades, it can reduce your final investment value by 20-30%.</p>
        
        <h2>Performance Considerations</h2>
        <p>The higher fees of actively managed funds would be justified if they consistently outperformed index funds. However, research consistently shows that after accounting for fees, the majority of active funds underperform their benchmark indices over long periods.</p>
        
        <p>According to S&P Dow Jones Indices, over a 15-year period, approximately 90% of active managers failed to beat their benchmarks after fees. This means investors are often paying premium prices for underperforming products.</p>
        
        <h2>When Active Management Might Make Sense</h2>
        <p>Despite the fee disadvantage, there are specific situations where active management might be worth considering:</p>
        <ol>
          <li>In less efficient markets where research can provide an edge</li>
          <li>During highly volatile market periods</li>
          <li>For specialized investment strategies not available through index funds</li>
          <li>When factor-based or smart beta strategies align with your investment goals</li>
        </ol>
        
        <h2>Making Your Decision</h2>
        <p>The choice between active and passive investing isn't all-or-nothing. Many successful investors use a core-satellite approach—building the core of their portfolio with low-cost index funds while using select actively managed funds for specific market segments or strategies.</p>
        
        <p>Whichever approach you choose, understanding the impact of fees on your long-term returns is crucial. Use our calculator to see exactly how different fee levels affect your investment outcomes over time.</p>
      `
    },
    {
      id: 3,
      title: "The Real Cost of 401(k) Fees: What You Need to Know",
      excerpt: "Your workplace retirement plan might be costing you more than you think. Learn how to identify and minimize 401(k) fees for better returns.",
      date: "March 5, 2025",
      author: "Retirement Planning Team",
      category: "Retirement Planning",
      featuredImage: "/api/placeholder/800/400",
      content: `
        <h2>Understanding Your 401(k) Fee Structure</h2>
        <p>Most Americans rely on 401(k) plans as their primary retirement savings vehicle, yet few understand the fees associated with these accounts. These fees generally fall into three categories:</p>
        
        <ul>
          <li><strong>Plan Administration Fees:</strong> Charges for day-to-day operation of the plan, including recordkeeping, accounting, legal services, and trustee services.</li>
          <li><strong>Investment Fees:</strong> The largest component of 401(k) fees, covering the cost of managing the investments and operating the investment funds.</li>
          <li><strong>Service Fees:</strong> Charges for optional features like taking a loan from your plan.</li>
        </ul>
        
        <h2>The Long-term Impact of 401(k) Fees</h2>
        <p>According to the Department of Labor, a 1% difference in fees can reduce your 401(k) balance by 28% over a 35-year career. For the average worker, this could mean a difference of hundreds of thousands of dollars in retirement savings.</p>
        
        <p>For example, if you have $100,000 invested over 30 years with a 7% annual return:</p>
        <ul>
          <li>With a 0.5% annual fee, you'd have approximately $574,349 at retirement</li>
          <li>With a 1.5% annual fee, you'd have approximately $438,976 at retirement</li>
        </ul>
        <p>That's a difference of $135,373 - simply due to fees!</p>
        
        <h2>How to Identify Your 401(k) Fees</h2>
        <p>By law, your plan administrator must provide fee disclosures. Key documents to review include:</p>
        <ol>
          <li>The plan's Summary Plan Description (SPD)</li>
          <li>Annual Fee Disclosure Statement</li>
          <li>Quarterly Benefit Statements</li>
          <li>Fund prospectuses for individual investment options</li>
        </ol>
        
        <h2>Strategies to Minimize 401(k) Fees</h2>
        <p>While you can't control all aspects of your employer's 401(k) plan, there are several steps you can take to reduce fees:</p>
        <ol>
          <li>Select low-cost index funds within your plan when available</li>
          <li>Avoid funds with high expense ratios and sales charges (loads)</li>
          <li>Consider a direct rollover to an IRA when changing jobs, which may offer lower-cost investment options</li>
          <li>Advocate for better investment options in your company's plan</li>
          <li>Take advantage of any financial wellness programs offered by your employer</li>
        </ol>
        
        <h2>Beyond Your 401(k): A Comprehensive Retirement Strategy</h2>
        <p>While minimizing 401(k) fees is important, it's just one aspect of retirement planning. Consider diversifying your retirement savings across multiple account types, each with different fee structures and tax advantages:</p>
        <ul>
          <li>Traditional and Roth IRAs</li>
          <li>Health Savings Accounts (HSAs) for medical expenses in retirement</li>
          <li>Taxable brokerage accounts for more investment flexibility</li>
        </ul>
        
        <p>Use our calculator to see how different fee levels in your retirement accounts could impact your long-term financial security.</p>
      `
    },
    {
      id: 4,
      title: "Fee Negotiation: How to Lower Your Investment Costs",
      excerpt: "Many investors don't realize that advisory fees can be negotiated. Learn effective strategies for reducing your investment costs.",
      date: "February 25, 2025",
      author: "Investor Advocacy Team",
      category: "Fee Optimization",
      featuredImage: "/api/placeholder/800/400",
      content: `
        <h2>Why You Should Negotiate Investment Fees</h2>
        <p>While most people wouldn't hesitate to negotiate when buying a car or house, many are uncomfortable discussing fees with their financial advisors. However, investment fees are often more negotiable than you might think, and even small reductions can significantly impact your long-term returns.</p>
        
        <p>According to industry studies, about 58% of investors who attempt to negotiate fees receive some reduction. The average discount ranges from 0.25% to 0.5% annually - which can translate to tens or even hundreds of thousands of dollars over a lifetime of investing.</p>
        
        <h2>Which Fees Can Be Negotiated?</h2>
        <p>Not all investment fees have the same flexibility for negotiation:</p>
        <ul>
          <li><strong>Most Negotiable:</strong> Financial advisory fees, account management fees, commissions</li>
          <li><strong>Sometimes Negotiable:</strong> Account maintenance fees, trading costs, breakpoint discounts</li>
          <li><strong>Rarely Negotiable:</strong> Mutual fund expense ratios, ETF expense ratios</li>
        </ul>
        
        <h2>Preparation: Research Before You Negotiate</h2>
        <p>Successful negotiation requires solid groundwork:</p>
        <ol>
          <li>Know industry standards for accounts of your size</li>
          <li>Research what competitors are charging</li>
          <li>Understand the full range of services you're receiving</li>
          <li>Document your account's performance history</li>
          <li>Calculate the dollar impact of different fee levels</li>
        </ol>
        
        <h2>Effective Fee Negotiation Tactics</h2>
        <p>When approaching fee negotiations, consider these strategies:</p>
        <ol>
          <li><strong>Consolidate assets:</strong> Many advisors offer fee discounts for larger account balances</li>
          <li><strong>Request fee tiering:</strong> Ask for reduced rates on assets above certain thresholds</li>
          <li><strong>Highlight your loyalty:</strong> Long-term clients often qualify for preferred pricing</li>
          <li><strong>Be transparent about competitive offers:</strong> If other firms offer lower fees, mention it respectfully</li>
          <li><strong>Consider service adjustments:</strong> You might accept fewer meetings or reports in exchange for lower fees</li>
        </ol>
        
        <h2>When to Walk Away</h2>
        <p>Sometimes the best negotiation tactic is being willing to change providers. Consider switching if:</p>
        <ul>
          <li>Your advisor refuses to discuss fees entirely</li>
          <li>Fees are significantly above industry averages</li>
          <li>You're not receiving services commensurate with the fees</li>
          <li>Performance consistently lags appropriate benchmarks</li>
        </ul>
        
        <h2>Beyond Negotiation: Alternative Approaches</h2>
        <p>If direct negotiation isn't successful, consider these alternatives:</p>
        <ul>
          <li>Switch to a different fee structure (e.g., from AUM-based to flat fee)</li>
          <li>Move to a robo-advisor for lower-cost automated investing</li>
          <li>Use a hybrid service that combines digital tools with human advice</li>
          <li>Consider fee-only financial planning for specific needs</li>
        </ul>
        
        <p>Use our calculator to quantify exactly how much different fee levels could save you over your investment lifetime - powerful information to have during any negotiation.</p>
      `
    }
  ];
  
  // Testimonials data
  const testimonials = [
    {
      id: 1,
      text: "The FourStar Fees calculator helped me understand how much I was really paying in investment fees. I was able to reduce my fees by 0.7% and will save over $120,000 by retirement!",
      name: "Sarah K.",
      title: "Retirement Planner"
    },
    {
      id: 2,
      text: "As a financial advisor, I use this tool with clients to demonstrate the importance of fee awareness. It's been instrumental in helping my clients make better investment decisions.",
      name: "Michael T.",
      title: "Certified Financial Planner"
    },
    {
      id: 3,
      text: "The visualization of fee impact over time was eye-opening. I never realized how much of my returns were being consumed by seemingly small fees.",
      name: "David L.",
      title: "Individual Investor"
    }
  ];
  
  // State for blog functionality
  const [selectedPost, setSelectedPost] = useState(null);

  // Tooltip content
  const tooltipContent = {
    mer: "Management Expense Ratio (MER) is the annual fee charged by mutual funds and ETFs to cover operating expenses and management fees.",
    advisoryFee: "Advisory fees are charges for investment advice and portfolio management, typically 0.5% to 1.5% annually.",
    tradingCosts: "Trading costs include commissions and bid-ask spreads when buying or selling investments within your portfolio.",
    taxDrag: "Tax drag refers to the reduction in investment returns due to taxes on dividends, interest, and capital gains.",
    trex: "The T-Rex Score, developed by Larry Bates, shows what percentage of your potential returns you keep after fees. Higher is better!"
  };

  // Calculate investment growth
  const calculateGrowth = () => {
    // For simple mode, use only annualFee
    let totalFeePercentage = annualFee;
    
    // For advanced mode, add up all fees
    if (advancedMode) {
      totalFeePercentage = annualFee + advisoryFee + tradingCosts + taxDrag;
    }
    
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
        // Add cumulative fees for stacked area chart
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

  // Format currency based on region
  const formatCurrency = (value) => {
    return new Intl.NumberFormat(region === 'uk' ? 'en-GB' : 'en-US', {
      style: 'currency',
      currency: region === 'uk' ? 'GBP' : 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Save current scenario
  const saveScenario = () => {
    const newScenario = {
      id: Date.now(),
      name: scenarioName,
      initialInvestment,
      annualContribution,
      investmentPeriod,
      expectedReturn,
      annualFee,
      advisoryFee: advancedMode ? advisoryFee : 0,
      tradingCosts: advancedMode ? tradingCosts : 0,
      taxDrag: advancedMode ? taxDrag : 0,
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
    // For demonstration purposes, we'll just show what would be included
    console.log("Exporting results:", {
      scenario: scenarioName,
      initialInvestment,
      annualContribution,
      investmentPeriod,
      expectedReturn,
      fees: advancedMode ? 
        { annualFee, advisoryFee, tradingCosts, taxDrag, total: annualFee + advisoryFee + tradingCosts + taxDrag } : 
        { annualFee },
      results: {
        withoutFeesResult,
        withFeesResult,
        feesTotal,
        feePercentage,
        tRexScore
      }
    });
  };
  
  // Share results
  const shareResults = () => {
    // In a real implementation, this would use the Web Share API
    alert("Share feature would allow you to send these results via email or social media");
  };
  
  // Handle newsletter signup
  const handleNewsletterSignup = (e) => {
    e.preventDefault();
    if (emailSignup.trim()) {
      // In a real implementation, this would connect to a mailing list service
      console.log("Email signup:", emailSignup);
      setEmailSubmitted(true);
      setTimeout(() => setEmailSubmitted(false), 3000);
      setEmailSignup('');
    }
  };

  // Render the US Fee Calculator content
  const renderUSFeeCalculator = () => {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Investment Fee Calculator</h2>

          <div className="flex items-center">
            <span className="mr-2 text-sm text-gray-600">Standard</span>
            <button
              onClick={() => setAdvancedMode(!advancedMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1 ${advancedMode ? 'bg-black' : 'bg-gray-200'}`}
            >
              <span
                className={`${advancedMode ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
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
            placeholder="e.g., My Retirement Plan" />
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
                  min="0" />
              </div>
            </div>

            <div>
              <label htmlFor="annualContribution" className="block text-sm font-medium text-gray-700 mb-1">
                Annual Contribution
              </label>
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
                  min="0" />
              </div>
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
                onChange={(e) => setInvestmentPeriod(Number(e.target.value))} />
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
                  max="50"
                  step="0.1" />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Standard Mode Fee Input */}
            {!advancedMode && (
              <div className="relative">
                <div className="flex items-center justify-between">
                  <label htmlFor="annualFee" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    Annual Fee (%)
                    <button
                      className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                      onClick={() => setShowTooltip('mer')}
                    >
                      <LucideIcons.HelpCircle size={16} />
                    </button>
                  </label>
                  {showTooltip === 'mer' && (
                    <div className="absolute z-10 top-0 right-0 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
                      {tooltipContent.mer}
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
                    id="annualFee"
                    className="focus:ring-black focus:border-black block w-full pr-12 sm:text-sm border-gray-300 rounded-md p-2 border"
                    value={annualFee}
                    onChange={(e) => setAnnualFee(Number(e.target.value))}
                    min="0"
                    max="20"
                    step="0.01"/>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">%</span>
                    </div>
                  </div>
                </div>
              )}
  
              {/* Advanced Mode Fee Inputs */}
              {advancedMode && (
                <>
                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <label htmlFor="annualFee" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        Fund Expense Ratio (%)
                        <button
                          className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                          onClick={() => setShowTooltip('mer')}
                        >
                          <LucideIcons.HelpCircle size={16} />
                        </button>
                      </label>
                      {showTooltip === 'mer' && (
                        <div className="absolute z-10 top-0 right-0 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
                          {tooltipContent.mer}
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
                        id="annualFee"
                        className="focus:ring-black focus:border-black block w-full pr-12 sm:text-sm border-gray-300 rounded-md p-2 border"
                        value={annualFee}
                        onChange={(e) => setAnnualFee(Number(e.target.value))}
                        min="0"
                        max="20"
                        step="0.01" />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">%</span>
                      </div>
                    </div>
                  </div>
  
                  <div className="relative">
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
                        <div className="absolute z-10 top-0 right-0 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
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
                        max="5"
                        step="0.01" />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">%</span>
                      </div>
                    </div>
                  </div>
  
                  <div className="relative">
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
                        <div className="absolute z-10 top-0 right-0 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
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
                        max="5"
                        step="0.01" />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">%</span>
                      </div>
                    </div>
                  </div>
  
                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <label htmlFor="taxDrag" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        Tax Drag (%)
                        <button
                          className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                          onClick={() => setShowTooltip('taxDrag')}
                        >
                          <LucideIcons.HelpCircle size={16} />
                        </button>
                      </label>
                      {showTooltip === 'taxDrag' && (
                        <div className="absolute z-10 top-0 right-0 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
                          {tooltipContent.taxDrag}
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
                        id="taxDrag"
                        className="focus:ring-black focus:border-black block w-full pr-12 sm:text-sm border-gray-300 rounded-md p-2 border"
                        value={taxDrag}
                        onChange={(e) => setTaxDrag(Number(e.target.value))}
                        min="0"
                        max="5"
                        step="0.01" />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">%</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
  
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
        </div>
      );
    };
  
    // Render function for results section
    const renderResults = () => {
      if (!hasCalculated) return null;
      
      return (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
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
  
          {/* Results Content */}
          {/* Rest of the results rendering code... */}
        </div>
      );
    };
  
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-4 py-4">
          {/* Announcement Banner */}
          <div className="bg-black text-white text-center py-2 px-4 rounded-lg mb-6 shadow-md">
            <p className="text-sm md:text-base">
              <span className="font-semibold">New:</span> {region === 'uk'
                ? "Compare UK investment platforms and optimize your portfolio costs!"
                : "Try our advanced calculator to see how all types of fees impact your returns!"}
              <button
                onClick={() => region === 'uk' ? setActiveCalculator('platforms') : setAdvancedMode(true)}
                className="ml-2 underline hover:text-gray-300 focus:outline-none"
              >
                Try Now
              </button>
            </p>
          </div>
  
          {/* Header */}
          <header className="relative text-center mb-8">
            {/* Logo */}
            <div className="flex justify-center items-center mb-2">
              <img
                src="/logo-full.png"
                alt="FourStar Fees"
                className="h-12" />
            </div>
            
            {/* Region Selector */}
            <div className="flex justify-center mb-4">
              <div className="inline-flex rounded-md shadow-sm" role="group">
                <button
                  type="button"
                  onClick={() => setRegion('uk')}
                  className={`px-4 py-2 text-sm font-medium rounded-l-lg ${region === 'uk'
                    ? 'bg-black text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'}`}
                >
                  UK
                </button>
                <button
                  type="button"
                  onClick={() => setRegion('us')}
                  className={`px-4 py-2 text-sm font-medium rounded-r-lg ${region === 'us'
                    ? 'bg-black text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'}`}
                >
                  US
                </button>
              </div>
            </div>
  
            <p className="text-xl text-gray-600 mb-4">Understand how investment fees impact your long-term returns</p>
          </header>
  
          {/* Main Content */}
          <div>
            {activeTab === 'calculator' && (
              <>
                {/* Calculator Selection UI */}
                <div className="flex justify-center space-x-4 mb-6">
                  <button
                    onClick={() => setActiveCalculator('fees')}
                    className={`px-4 py-2 rounded-md ${activeCalculator === 'fees' ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                  >
                    Fee Calculator
                  </button>
  
                  {region === 'uk' && (
                    <button
                      onClick={() => setActiveCalculator('platforms')}
                      className={`px-4 py-2 rounded-md ${activeCalculator === 'platforms' ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                    >
                      Platform Comparison
                    </button>
                  )}
  
                  {region === 'uk' && (
                    <button
                      onClick={() => setActiveCalculator('portfolios')}
                      className={`px-4 py-2 rounded-md ${activeCalculator === 'portfolios' ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                    >
                      My Portfolios
                    </button>
                  )}
  
                  <button
                    onClick={() => setActiveCalculator('retirement')}
                    className={`px-4 py-2 rounded-md ${activeCalculator === 'retirement' ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                  >
                    Retirement
                  </button>
  
                  <button
                    onClick={() => setActiveCalculator('allocation')}
                    className={`px-4 py-2 rounded-md ${activeCalculator === 'allocation' ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                  >
                    Asset Allocation
                  </button>
  
                  <button
                    onClick={() => setActiveCalculator('rebalancing')}
                    className={`px-4 py-2 rounded-md ${activeCalculator === 'rebalancing' ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                  >
                    Rebalancing
                  </button>
  
                  <button
                    onClick={() => setActiveCalculator('dca')}
                    className={`px-4 py-2 rounded-md ${activeCalculator === 'dca' ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                  >
                    Dollar Cost Averaging
                  </button>
                </div>
  
                {/* Mobile calculator selector */}
                <div className="md:hidden mb-6">
                  <select
                    className="block w-full p-2 border border-gray-300 rounded-md"
                    value={activeCalculator}
                    onChange={(e) => setActiveCalculator(e.target.value)}
                  >
                    <option value="fees">Fee Calculator</option>
                    {region === 'uk' && <option value="platforms">Platform Comparison</option>}
                    {region === 'uk' && <option value="portfolios">My Portfolios</option>}
                    <option value="retirement">Retirement Calculator</option>
                    <option value="allocation">Asset Allocation</option>
                    <option value="rebalancing">Portfolio Rebalancing</option>
                    <option value="dca">Dollar Cost Averaging</option>
                  </select>
                </div>
  
                {/* Calculators */}
                {activeCalculator === 'fees' && (
                  <>
                    {region === 'uk' ? <UKFeeCalculator /> : renderUSFeeCalculator()}
                    {hasCalculated && renderResults()}
                  </>
                )}
  
                {activeCalculator === 'platforms' && region === 'uk' && (
                  <PlatformComparison />
                )}
  
                {activeCalculator === 'portfolios' && region === 'uk' && (
                  <SavedPortfolios />
                )}
  
                {activeCalculator === 'retirement' && (
                  <RetirementCalculator />
                )}
  
                {activeCalculator === 'allocation' && (
                  <AssetAllocationOptimizer />
                )}
  
                {activeCalculator === 'rebalancing' && (
                  <PortfolioRebalancingCalculator />
                )}
  
                {activeCalculator === 'dca' && (
                  <DollarCostAveragingCalculator />
                )}
              </>
            )}
  
            {activeTab === 'blog' && (
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {!selectedPost ? (
                  <div className="p-6">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Blog</h2>
                    {/* Blog post listing */}
                  </div>
                ) : (
                  <div className="p-6">
                    {/* Individual blog post view */}
                  </div>
                )}
              </div>
            )}
  
            {activeTab === 'about' && (
              <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">About FourStar Fees</h2>
                {/* About content */}
              </div>
            )}
  
            {activeTab === 'testimonials' && (
              <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">What Others Are Saying</h2>
                {/* Testimonials content */}
              </div>
            )}
  
            {/* Footer */}
            <footer className="text-center text-gray-500 text-sm mt-12">
              <p>FourStar Fees | Investment Fee Impact Calculator</p>
              <p className="mt-1">Inspired by Larry Bates' T-Rex Score concept</p>
              <div className="mt-3 flex justify-center space-x-4">
                <a href="#" className="hover:text-gray-700">Privacy Policy</a>
                <a href="#" className="hover:text-gray-700">Terms of Use</a>
                <a href="#" className="hover:text-gray-700">Contact</a>
              </div>
              <p className="mt-4 text-xs">© {new Date().getFullYear()} FourStar Fees. All rights reserved.</p>
            </footer>
          </div>
        </div>
      </div>
    );
  };
  
  export default FourStarFees;
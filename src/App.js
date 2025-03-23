import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import * as LucideIcons from 'lucide-react';
import './index.css';
import './App.css';  // Make sure this import exists


const FourStarFees = () => {
  // Navigation state
  const [activeTab, setActiveTab] = useState('calculator');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(null);
  const [advancedMode, setAdvancedMode] = useState(false);
  const [emailSignup, setEmailSignup] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  
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

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Announcement Banner */}
        <div className="bg-black text-white text-center py-2 px-4 rounded-lg mb-6 shadow-md">
          <p className="text-sm md:text-base">
            <span className="font-semibold">New:</span> Try our advanced calculator to see how all types of fees impact your returns! 
            <button 
              onClick={() => setAdvancedMode(true)} 
              className="ml-2 underline hover:text-gray-300 focus:outline-none"
            >
              Try Now
            </button>
          </p>
        </div>
        
        <header className="relative text-center mb-8">
          {/* Logo and Title */}
          <div className="flex justify-center items-center mb-2">
            <div className="w-10 h-10 mr-2 bg-black rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">4★</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900">FourStar Fees</h1>
          </div>
          <p className="text-xl text-gray-600 mb-4">Understand how investment fees impact your long-term returns</p>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:block mt-8">
            <ul className="flex justify-center space-x-6 border-b border-gray-200">
              <li>
                <button 
                  onClick={() => setActiveTab('calculator')}
                  className={`px-4 py-2 font-medium text-sm ${activeTab === 'calculator' ? 'text-black border-b-2 border-black' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Calculator
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {setActiveTab('blog'); setSelectedPost(null);}}
                  className={`px-4 py-2 font-medium text-sm ${activeTab === 'blog' ? 'text-black border-b-2 border-black' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Blog
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('about')}
                  className={`px-4 py-2 font-medium text-sm ${activeTab === 'about' ? 'text-black border-b-2 border-black' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  About
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('testimonials')}
                  className={`px-4 py-2 font-medium text-sm ${activeTab === 'testimonials' ? 'text-black border-b-2 border-black' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Testimonials
                </button>
              </li>
            </ul>
          </nav>
          
          {/* Mobile Menu Button */}
<div className="md:hidden absolute right-0 top-0">
  <button 
    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
    className="p-2 focus:outline-none"
  >
    {mobileMenuOpen ? <LucideIcons.X size={24} /> : <LucideIcons.Menu size={24} />}
  </button>
</div>
          
          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden absolute top-12 right-0 w-48 bg-white shadow-lg rounded-lg z-10">
              <ul className="py-2">
                <li>
                  <button 
                    onClick={() => {setActiveTab('calculator'); setMobileMenuOpen(false);}}
                    className={`block w-full text-left px-4 py-2 text-sm ${activeTab === 'calculator' ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'}`}
                  >
                    Calculator
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {setActiveTab('blog'); setSelectedPost(null); setMobileMenuOpen(false);}}
                    className={`block w-full text-left px-4 py-2 text-sm ${activeTab === 'blog' ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'}`}
                  >
                    Blog
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {setActiveTab('about'); setMobileMenuOpen(false);}}
                    className={`block w-full text-left px-4 py-2 text-sm ${activeTab === 'about' ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'}`}
                  >
                    About
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {setActiveTab('testimonials'); setMobileMenuOpen(false);}}
                    className={`block w-full text-left px-4 py-2 text-sm ${activeTab === 'testimonials' ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'}`}
                  >
                    Testimonials
                  </button>
                </li>
              </ul>
            </div>
          )}
        </header>

        {activeTab === 'calculator' && (
          <>
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
                  placeholder="e.g., My Retirement Plan"
                />
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
/>
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
                          min="0"
                        />
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
                          max="50"
                          step="0.1"
                        />
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
                            step="0.01"
                          />
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
                              step="0.01"
                            />
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
                              step="0.01"
                            />
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
                              step="0.01"
                            />
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
                              step="0.01"
                            />
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
              
              {hasCalculated && (
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
                  
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <div className="bg-gray-50 rounded-lg p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-medium text-gray-700">T-Rex Score: {tRexScore.toFixed(1)}%</h3>
                          <button 
                            className="text-gray-400 hover:text-gray-600 focus:outline-none"
                            onClick={() => setShowTooltip('trex')}
                          >
                            <LucideIcons.HelpCircle size={16} />
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
                        <p className="text-gray-600 mb-4">
                          Your T-Rex Score shows what percentage of your potential returns you actually keep. 
                          Higher is better; the rest goes to fees.
                        </p>
                        
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Investment without fees:</span>
                              <span className="font-medium">{formatCurrency(withoutFeesResult)}</span>
                            </div>
                            <div className="w-full bg-green-100 rounded-full h-4">
                              <div className="bg-green-500 h-4 rounded-full" style={{ width: '100%' }}></div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Investment with fees:</span>
                              <span className="font-medium">{formatCurrency(withFeesResult)}</span>
                            </div>
                            <div className="w-full bg-green-100 rounded-full h-4">
                              <div 
                                className="bg-green-500 h-4 rounded-full" 
                                style={{ width: `${tRexScore}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Total fees paid:</span>
                              <span className="font-medium text-red-500">{formatCurrency(feesTotal)}</span>
                            </div>
                            <div className="w-full bg-red-100 rounded-full h-4">
                              <div 
                                className="bg-red-500 h-4 rounded-full" 
                                style={{ width: `${feePercentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-700 mb-4">Key Takeaways</h3>
                        <div className="text-gray-600 text-sm space-y-3">
                          <p><strong>Fee impact:</strong> {feePercentage.toFixed(1)}% of your potential returns</p>
                          <p><strong>Annual fee:</strong> {advancedMode ? 
                            `${(annualFee + advisoryFee + tradingCosts + taxDrag).toFixed(2)}%` : 
                            `${annualFee.toFixed(2)}%`} total</p>
                          <p><strong>Lost to fees:</strong> {formatCurrency(feesTotal)} over {investmentPeriod} years</p>
                          <p>
                            {annualFee > 1.5 ? 
                              "Your fees are higher than average. Consider lower-cost alternatives to improve your returns." : 
                              annualFee > 0.75 ? 
                              "Your fees are about average. There may be opportunities to reduce costs further." : 
                              "Your fees are lower than average. You're keeping more of your returns than most investors."}
                          </p>
                          {advancedMode && (
                            <p>
                              <strong>Biggest fee factor:</strong> {
                                Math.max(annualFee, advisoryFee, tradingCosts, taxDrag) === annualFee ? 
                                "Fund expenses" : 
                                Math.max(annualFee, advisoryFee, tradingCosts, taxDrag) === advisoryFee ? 
                                "Advisory fees" : 
                                Math.max(annualFee, advisoryFee, tradingCosts, taxDrag) === tradingCosts ? 
                                "Trading costs" : 
                                "Tax drag"
                              }
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div>
                    <h3 className="text-xl font-medium text-gray-700 mb-4">Investment Growth Comparison</h3>
                    <div className="h-64 md:h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={chartData}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis 
                            dataKey="year" 
                            label={{ value: 'Years', position: 'insideBottomRight', offset: -10 }} 
                          />
                          <YAxis 
                            tickFormatter={(value) => value.toLocaleString('en-US', { 
                              style: 'currency', 
                              currency: 'USD',
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                              notation: 'compact'
                            })} 
                          />
                          <Tooltip 
                            formatter={(value) => [value.toLocaleString('en-US', { 
                              style: 'currency', 
                              currency: 'USD',
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0
                            }), '']} 
                            labelFormatter={(label) => `Year ${label}`}
                            contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '4px' }}
                          />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="withoutFees" 
                            name="Without Fees" 
                            stroke="#10B981" 
                            strokeWidth={3} 
                            activeDot={{ r: 8 }} 
                          />
                          <Line 
                            type="monotone" 
                            dataKey="withFees" 
                            name="With Fees" 
                            stroke="#EF4444" 
                            strokeWidth={3} 
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <h3 className="text-xl font-medium text-gray-700 my-6">Fees Impact Visualization</h3>
                    <div className="h-64 md:h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={chartData}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis 
                            dataKey="year" 
                            label={{ value: 'Years', position: 'insideBottomRight', offset: -10 }} 
                          />
                          <YAxis 
                            tickFormatter={(value) => value.toLocaleString('en-US', { 
                              style: 'currency', 
                              currency: 'USD',
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                              notation: 'compact'
                            })} 
                          />
                          <Tooltip 
                            formatter={(value) => [value.toLocaleString('en-US', { 
                              style: 'currency', 
                              currency: 'USD',
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0
                            }), '']} 
                            labelFormatter={(label) => `Year ${label}`}
                            contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '4px' }}
                          />
                          <Legend />
                          <Area 
                            type="monotone" 
                            dataKey="withFees" 
                            name="Your Investment" 
                            fill="#10B981" 
                            stroke="#10B981"
                            stackId="1"
                          />
                          <Area 
                            type="monotone" 
                            dataKey="feesLost" 
                            name="Lost to Fees" 
                            fill="#EF4444" 
                            stroke="#EF4444"
                            stackId="1"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
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
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Initial</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Return</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fees</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">T-Rex</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {savedScenarios.map((scenario) => (
                            <tr key={scenario.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{scenario.name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(scenario.initialInvestment)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{scenario.investmentPeriod} yrs</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{scenario.expectedReturn}%</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {scenario.advisoryFee ? 
                                  `${(scenario.annualFee + scenario.advisoryFee + scenario.tradingCosts + scenario.taxDrag).toFixed(2)}%` : 
                                  `${scenario.annualFee}%`}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{scenario.tRexScore.toFixed(1)}%</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(scenario.totalValue)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Understanding Investment Fees</h2>
              
              <div className="prose max-w-none">
                <p>
                  Investment fees might seem small at first glance, but their impact compounds dramatically over time. 
                  A difference of just 1-2% in annual fees can reduce your final investment value by 20-40% over several decades.
                </p>
                
                <h3>Types of Investment Fees</h3>
                <ul>
                  <li><strong>Management Expense Ratio (MER):</strong> Annual fee charged by mutual funds and ETFs</li>
                  <li><strong>Advisory Fees:</strong> Charges for investment advice and portfolio management</li>
                  <li><strong>Trading Commissions:</strong> Costs per transaction when buying or selling investments</li>
                  <li><strong>Account Fees:</strong> Administrative charges for maintaining your investment account</li>
                  <li><strong>Tax Costs:</strong> Reduction in returns due to taxes on dividends and capital gains</li>
                </ul>
                
                <h3>The T-Rex Score</h3>
                <p>
                  The T-Rex Score was developed by Larry Bates to help investors understand the true impact of fees. 
                  It represents the percentage of your potential investment returns that you actually keep, with the rest being consumed by fees.
                  A higher score is better—ideally, you want to keep as much of your returns as possible.
                </p>
                
                <h3>How to Improve Your T-Rex Score</h3>
                <ul>
                  <li>Consider low-cost index funds or ETFs instead of actively managed funds</li>
                  <li>Compare fee structures when selecting investment platforms</li>
                  <li>Be wary of "hidden" fees that may not be immediately obvious</li>
                  <li>Review your investment costs annually to ensure they remain competitive</li>
                  <li>Hold tax-inefficient investments in tax-advantaged accounts</li>
                  <li>Minimize portfolio turnover to reduce trading costs</li>
                </ul>
              </div>
            </div>
            
            {/* Newsletter Signup */}
            <div className="bg-black rounded-lg shadow-lg p-8 mb-8 text-white">
              <div className="md:flex items-center justify-between">
                <div className="md:w-2/3 mb-6 md:mb-0">
                  <h3 className="text-xl font-bold mb-2">Stay Updated on Investment Fee Strategies</h3>
                  <p className="text-gray-300">Get our latest insights on minimizing fees and maximizing your returns.</p>
                </div>
                <div className="md:w-1/3">
                  <form onSubmit={handleNewsletterSignup} className="flex">
                    <input
                      type="email"
                      placeholder="Your email address"
                      className="flex-grow p-2 border border-transparent rounded-l focus:outline-none focus:ring-2 focus:ring-white text-black"
                      value={emailSignup}
                      onChange={(e) => setEmailSignup(e.target.value)}
                      required
                    />
                    <button 
                      type="submit"
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-r font-medium"
                    >
                      Subscribe
                    </button>
                  </form>
                  {emailSubmitted && (
                    <div className="mt-2 text-sm text-green-400">
                      Thank you for subscribing!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
        
        {activeTab === 'blog' && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {!selectedPost ? (
              <div className="p-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Blog</h2>
                
                <div className="grid md:grid-cols-2 gap-8">
                  {blogPosts.map((post) => (
                    <div key={post.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-6">
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                        <LucideIcons.Calendar size={14} className="mr-1" />
                          <span>{post.date}</span>
                          <span className="mx-2">•</span>
                          <span>{post.category}</span>
                        </div>
                        <h3 className="text-xl font-semibold mb-2 text-gray-800">{post.title}</h3>
                        <p className="text-gray-600 mb-4">{post.excerpt}</p>
                        <button
                          onClick={() => setSelectedPost(post)}
                          className="text-black font-medium inline-flex items-center"
                        >
                          Read More
                          <LucideIcons.ChevronRight size={16} className="ml-1" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-6">
                <button
                  onClick={() => setSelectedPost(null)}
                  className="text-gray-600 hover:text-gray-900 mb-4 inline-flex items-center"
                >
                  ← Back to all posts
                </button>
                
                <article className="max-w-3xl mx-auto">
                  <img
                    src={selectedPost.featuredImage}
                    alt={selectedPost.title}
                    className="w-full h-64 object-cover rounded-lg mb-6"
                  />
                  
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                  <LucideIcons.Calendar size={14} className="mr-1" />
                    <span>{selectedPost.date}</span>
                    <span className="mx-2">•</span>
                    <span>{selectedPost.category}</span>
                    <span className="mx-2">•</span>
                    <span>By {selectedPost.author}</span>
                  </div>
                  
                  <h1 className="text-3xl font-bold mb-4 text-gray-900">{selectedPost.title}</h1>
                  
                  <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: selectedPost.content }} />
                  
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <h3 className="text-xl font-semibold mb-4">Calculate Your Personal Fee Impact</h3>
                    <p className="mb-4">Use our calculator to see how fees are affecting your own investments over time.</p>
                    <button
                      onClick={() => setActiveTab('calculator')}
                      className="bg-black hover:bg-gray-900 text-white font-medium py-2 px-6 rounded"
                    >
                      Try the Calculator
                    </button>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold mb-2">Share this article</h3>
                    <div className="flex space-x-4">
                      <button className="text-gray-500 hover:text-gray-700">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path></svg>
                      </button>
                      <button className="text-gray-500 hover:text-gray-700">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path></svg>
                      </button>
                      <button className="text-gray-500 hover:text-gray-700">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2 16h-2v-6h2v6zm-1-6.891c-.607 0-1.1-.496-1.1-1.109 0-.612.492-1.109 1.1-1.109s1.1.497 1.1 1.109c0 .613-.493 1.109-1.1 1.109zm8 6.891h-1.998v-2.861c0-1.881-2.002-1.722-2.002 0v2.861h-2v-6h2v1.093c.872-1.616 4-1.736 4 1.548v3.359z"></path></svg>
                      </button>
                      <button className="text-gray-500 hover:text-gray-700">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path></svg>
                      </button>
                    </div>
                  </div>
                </article>
              </div>
            )}
          </div>
        )}{activeTab === 'about' && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">About FourStar Fees</h2>
            
            <div className="prose max-w-none">
              <p>
                <strong>FourStar Fees</strong> was created to help investors understand how fees affect their long-term financial outcomes.
                Most investment calculators focus exclusively on returns but ignore the significant impact that fees have on wealth accumulation.
              </p>
              
              <h3>Our Mission</h3>
              <p>
                Our mission is simple: to provide investors with transparent, easy-to-understand tools that quantify the true impact of
                investment fees. We believe that every investor deserves to know exactly how much of their returns they're giving away to 
                fees over the lifetime of their investments.
              </p>
              
              <h3>The T-Rex Score</h3>
              <p>
                The T-Rex Score concept was developed by Larry Bates, author of "Beat the Bank," as a simple way to understand the 
                percentage of your investment returns you actually keep after fees. It's a powerful metric that helps investors make
                better decisions about their investments.
              </p>
              
              <h3>How We're Different</h3>
              <p>
                Unlike many financial calculators, we don't shy away from showing the uncomfortable truth about fees. We provide:
              </p>
              <ul>
                <li>Clear visualizations of fee impact over time</li>
                <li>Detailed breakdown of all types of investment costs</li>
                <li>Educational content to help you make better investment decisions</li>
                <li>No hidden agenda or product promotion</li>
              </ul>
              
              <h3>Commitment to Financial Education</h3>
              <p>
                We're committed to improving financial literacy by helping investors understand concepts that are often
                deliberately made complex by the financial industry. We believe that educated investors make better decisions
                and achieve better outcomes.
              </p>
              
              <h3>Contact Us</h3>
              <p>
                Have questions, suggestions, or feedback about our calculator? We'd love to hear from you! Contact us at:
                <br />
                <a href="mailto:contact@fourstarfees.com" className="text-black font-medium">contact@fourstarfees.com</a>
              </p>
            </div>
          </div>
        )}
        
        {activeTab === 'testimonials' && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">What Others Are Saying</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="bg-gray-50 p-6 rounded-lg shadow-sm">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600 italic mb-4">"{testimonial.text}"</p>
                  <div className="mt-auto">
                    <p className="font-medium text-gray-800">{testimonial.name}</p>
                    <p className="text-gray-500 text-sm">{testimonial.title}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-12 pt-6 border-t border-gray-200">
              <h3 className="text-xl font-semibold mb-4">See For Yourself</h3>
              <p className="mb-4">
                Try our calculator today to discover your personal T-Rex Score and see how much of your investment 
                returns you're actually keeping.
              </p>
              <button
                onClick={() => setActiveTab('calculator')}
                className="bg-black hover:bg-gray-900 text-white font-medium py-2 px-6 rounded"
              >
                Try the Calculator
              </button>
            </div>
          </div>
        )}
        
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
  );
};

export default FourStarFees;
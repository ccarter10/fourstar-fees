import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import * as LucideIcons from 'lucide-react';
import './index.css';
import './App.css';
import RetirementCalculator from './RetirementCalculator';
import AssetAllocationOptimizer from './AssetAllocationOptimizer';
import PortfolioRebalancingCalculator from './PortfolioRebalancingCalculator';
import DollarCostAveragingCalculator from './DollarCostAveragingCalculator';
import PlatformComparison from './PlatformComparison';
import SavedPortfolios from './SavedPortfolios';
import './firebase-config';
import { RegionProvider, useRegion } from './RegionContext';

// Import the individual fee calculators
import UKFeeCalculator from './calculators/UKFeeCalculator';
import USFeeCalculator from './calculators/USFeeCalculator';
import CAFeeCalculator from './calculators/CAFeeCalculator';
import AUFeeCalculator from './calculators/AUFeeCalculator';
import NZFeeCalculator from './calculators/NZFeeCalculator';
import ExpatFeeCalculator from './calculators/ExpatFeeCalculator';

// Import Firebase Analytics
import { getAnalytics, logEvent } from 'firebase/analytics';

const FourStarFees = () => {
  const { region, setRegion, isExpat, currentRegionData, formatCurrency } = useRegion();
  
  // Initialize analytics
  const analytics = getAnalytics();

  // Navigation state
  const [activeTab, setActiveTab] = useState('calculator');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(null);
  const [advancedMode, setAdvancedMode] = useState(false);
  const [emailSignup, setEmailSignup] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [activeCalculator, setActiveCalculator] = useState('fees');
  
  // State for showing expat options
  const [showExpatOptions, setShowExpatOptions] = useState(false);
  
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
  const [scenarioName, setScenarioName] = useState(`My ${currentRegionData.name} Investment`);
  const [savedScenarios, setSavedScenarios] = useState([]);

  // Analytics tracking functions
  const logPageView = (pageName) => {
    logEvent(analytics, 'page_view', {
      page_title: pageName,
      page_location: window.location.href,
      page_path: window.location.pathname
    });
  };

  const trackCalculatorChange = (calculatorType) => {
    logEvent(analytics, 'calculator_changed', {
      calculator_type: calculatorType,
      region: region
    });
  };

  const trackRegionChange = (newRegion) => {
    logEvent(analytics, 'region_changed', {
      previous_region: region,
      new_region: newRegion
    });
  };

  const trackModeToggle = (isAdvanced) => {
    logEvent(analytics, 'mode_toggle', {
      mode: isAdvanced ? 'advanced' : 'standard'
    });
  };

  const trackCalculation = () => {
    logEvent(analytics, 'calculation_performed', {
      calculator_type: activeCalculator,
      region: region,
      is_advanced_mode: advancedMode,
      investment_period: investmentPeriod,
      initial_investment: initialInvestment,
      annual_contribution: annualContribution,
      expected_return: expectedReturn,
      annual_fee: annualFee,
      total_fees: advancedMode ? annualFee + advisoryFee + tradingCosts + taxDrag : annualFee
    });
  };

  const trackScenarioSaved = (scenarioDetails) => {
    logEvent(analytics, 'scenario_saved', {
      scenario_name: scenarioDetails.name,
      investment_period: scenarioDetails.investmentPeriod,
      total_value: scenarioDetails.totalValue,
      trex_score: scenarioDetails.tRexScore
    });
  };

  const trackExport = (exportType) => {
    logEvent(analytics, 'result_exported', {
      export_type: exportType,
      calculator_type: activeCalculator
    });
  };

  const trackEmailSignup = () => {
    logEvent(analytics, 'email_signup', {
      current_page: activeTab,
      current_calculator: activeCalculator
    });
  };

  // Log initial page view when component mounts
  useEffect(() => {
    logPageView('FourStar Fees Home');
  }, []);

  // Track tab changes
  useEffect(() => {
    if (activeTab) {
      logPageView(`FourStar Fees - ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`);
    }
  }, [activeTab]);

  // Track calculator changes
  useEffect(() => {
    if (activeCalculator) {
      trackCalculatorChange(activeCalculator);
    }
  }, [activeCalculator]);

  // Update scenario name when region changes
  useEffect(() => {
    setScenarioName(`My ${currentRegionData.name} Investment`);
  }, [region, currentRegionData]);

  // Handle region change with analytics tracking
  const handleRegionChange = (newRegion) => {
    // Track the change
    trackRegionChange(newRegion);
    
    // Update region
    setRegion(newRegion);
    
    // Close expat dropdown if it's open
    if (showExpatOptions) {
      setShowExpatOptions(false);
    }
  };

  // Blog post data - truncated for brevity
  const blogPosts = [
    {
      id: 1,
      title: "Understanding the Hidden Impact of Investment Fees",
      excerpt: "Most investors underestimate how fees erode their returns over time. Here's what you need to know about the true cost of investment fees.",
      date: "March 20, 2025",
      author: "Financial Education Team",
      category: "Fee Education",
      featuredImage: "/api/placeholder/800/400",
      content: `...` // Content truncated
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

  // Get appropriate fee calculator based on region
  const renderFeeCalculator = () => {
    switch (region) {
      case 'uk':
        return <UKFeeCalculator />;
      case 'us':
        return <USFeeCalculator />;
      case 'ca':
        return <CAFeeCalculator />;
      case 'au':
        return <AUFeeCalculator />;
      case 'nz':
        return <NZFeeCalculator />;
      // For expat regions
      case 'ae':
      case 'es':
      case 'sg':
        return <ExpatFeeCalculator region={region} />;
      default:
        return <UKFeeCalculator />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-4">
        {/* Announcement Banner */}
        <div className="bg-black text-white text-center py-2 px-4 rounded-lg mb-6 shadow-md">
          <p className="text-sm md:text-base">
            <span className="font-semibold">New:</span> Now available for UAE, Spain, and Singapore expats!
            <button
              onClick={() => {
                setShowExpatOptions(!showExpatOptions);
                logEvent(analytics, 'banner_click', { action: 'toggle_expat_options' });
              }}
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
              {/* Main countries */}
              <button
                type="button"
                onClick={() => handleRegionChange('uk')}
                className={`px-4 py-2 text-sm font-medium rounded-l-lg ${region === 'uk'
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'}`}
              >
                UK
              </button>
              <button
                type="button"
                onClick={() => handleRegionChange('us')}
                className={`px-4 py-2 text-sm font-medium ${region === 'us'
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'}`}
              >
                US
              </button>
              <button
                type="button"
                onClick={() => handleRegionChange('ca')}
                className={`px-4 py-2 text-sm font-medium ${region === 'ca'
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'}`}
              >
                Canada
              </button>
              <button
                type="button"
                onClick={() => handleRegionChange('au')}
                className={`px-4 py-2 text-sm font-medium ${region === 'au'
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'}`}
              >
                Australia
              </button>
              <button
                type="button"
                onClick={() => handleRegionChange('nz')}
                className={`px-4 py-2 text-sm font-medium ${region === 'nz'
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'}`}
              >
                NZ
              </button>
              
              {/* Expat dropdown toggle */}
              <button
                type="button"
                onClick={() => setShowExpatOptions(!showExpatOptions)}
                className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                  isExpat ? 'bg-black text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'}`}
              >
                Expat <LucideIcons.ChevronDown size={14} className="inline ml-1" />
              </button>
            </div>
          </div>

          {/* Expat Options Dropdown - Only shows when clicked */}
          {showExpatOptions && (
            <div className="bg-white shadow-md rounded-md p-2 absolute z-10 mt-1 left-1/2 transform -translate-x-1/2">
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => handleRegionChange('ae')}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md ${region === 'ae' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                  >
                    <span className="flex items-center">
                      <span className="font-medium">UAE</span>
                      <span className="text-xs text-gray-500 ml-2">(Dubai/Abu Dhabi)</span>
                    </span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleRegionChange('es')}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md ${region === 'es' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                  >
                    <span className="flex items-center">
                      <span className="font-medium">Spain</span>
                    </span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleRegionChange('sg')}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md ${region === 'sg' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                  >
                    <span className="flex items-center">
                      <span className="font-medium">Singapore</span>
                    </span>
                  </button>
                </li>
              </ul>
            </div>
          )}

          <p className="text-xl text-gray-600 mb-4">Understand how investment fees impact your long-term returns</p>
        </header>

        {/* Main Content */}
        <div>
          {activeTab === 'calculator' && (
            <>
              {/* Calculator Selection UI */}
              <div className="flex justify-center space-x-4 mb-6 overflow-x-auto pb-2">
                <button
                  onClick={() => setActiveCalculator('fees')}
                  className={`px-4 py-2 rounded-md whitespace-nowrap ${activeCalculator === 'fees' ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  Fee Calculator
                </button>

                <button
                  onClick={() => setActiveCalculator('platforms')}
                  className={`px-4 py-2 rounded-md whitespace-nowrap ${activeCalculator === 'platforms' ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  Platform Comparison
                </button>

                <button
                  onClick={() => setActiveCalculator('portfolios')}
                  className={`px-4 py-2 rounded-md whitespace-nowrap ${activeCalculator === 'portfolios' ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  My Portfolios
                </button>

                <button
                  onClick={() => setActiveCalculator('retirement')}
                  className={`px-4 py-2 rounded-md whitespace-nowrap ${activeCalculator === 'retirement' ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  Retirement
                </button>

                <button
                  onClick={() => setActiveCalculator('allocation')}
                  className={`px-4 py-2 rounded-md whitespace-nowrap ${activeCalculator === 'allocation' ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  Asset Allocation
                </button>

                <button
                  onClick={() => setActiveCalculator('rebalancing')}
                  className={`px-4 py-2 rounded-md whitespace-nowrap ${activeCalculator === 'rebalancing' ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  Rebalancing
                </button>

                <button
                  onClick={() => setActiveCalculator('dca')}
                  className={`px-4 py-2 rounded-md whitespace-nowrap ${activeCalculator === 'dca' ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  {region === 'uk' ? 'Pound' : 'Dollar'} Cost Averaging
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
                  <option value="platforms">Platform Comparison</option>
                  <option value="portfolios">My Portfolios</option>
                  <option value="retirement">Retirement Calculator</option>
                  <option value="allocation">Asset Allocation</option>
                  <option value="rebalancing">Portfolio Rebalancing</option>
                  <option value="dca">{region === 'uk' ? 'Pound' : 'Dollar'} Cost Averaging</option>
                </select>
              </div>

              {/* Calculators */}
              {activeCalculator === 'fees' && renderFeeCalculator()}

              {activeCalculator === 'platforms' && (
                <PlatformComparison region={region} />
              )}

              {activeCalculator === 'portfolios' && (
                <SavedPortfolios region={region} />
              )}

              {activeCalculator === 'retirement' && (
                <RetirementCalculator region={region} />
              )}

              {activeCalculator === 'allocation' && (
                <AssetAllocationOptimizer region={region} />
              )}

              {activeCalculator === 'rebalancing' && (
                <PortfolioRebalancingCalculator region={region} />
              )}

              {activeCalculator === 'dca' && (
                <DollarCostAveragingCalculator region={region} />
              )}
            </>
          )}

          {activeTab === 'blog' && (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {!selectedPost ? (
                <div className="p-6">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6">Blog</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    {blogPosts.map(post => (
                      <div 
                        key={post.id} 
                        className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => {
                          setSelectedPost(post);
                          logEvent(analytics, 'blog_post_clicked', { post_id: post.id, post_title: post.title });
                        }}
                      >
                        <img src={post.featuredImage} alt={post.title} className="w-full h-48 object-cover" />
                        <div className="p-4">
                          <span className="text-xs font-semibold text-blue-600">{post.category}</span>
                          <h3 className="text-lg font-medium mt-1">{post.title}</h3>
                          <p className="text-gray-600 text-sm mt-2">{post.excerpt}</p>
                          <div className="flex justify-between items-center mt-4">
                            <span className="text-xs text-gray-500">{post.date}</span>
                            <span className="text-xs text-gray-500">{post.author}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-6">
                  <button
                    onClick={() => {
                      setSelectedPost(null);
                      logEvent(analytics, 'blog_back_clicked');
                    }}
                    className="flex items-center text-blue-600 mb-4"
                  >
                    <LucideIcons.ArrowLeft size={16} className="mr-1" />
                    Back to all posts
                  </button>
                  <h1 className="text-3xl font-bold mb-2">{selectedPost.title}</h1>
                  <div className="flex items-center text-gray-600 mb-6">
                    <span>{selectedPost.date}</span>
                    <span className="mx-2">•</span>
                    <span>{selectedPost.author}</span>
                    <span className="mx-2">•</span>
                    <span>{selectedPost.category}</span>
                  </div>
                  <img src={selectedPost.featuredImage} alt={selectedPost.title} className="w-full h-64 object-cover rounded mb-6" />
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: selectedPost.content }}
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'about' && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">About FourStar Fees</h2>
              <div className="space-y-4">
                <p>
                  FourStar Fees is dedicated to helping investors understand and minimize the impact of fees on their investment returns. Our easy-to-use calculators provide clear visualizations of how different fee structures affect your wealth over time.
                </p>
                <p>
                  Our mission is to empower everyday investors with the knowledge and tools to make informed decisions about their financial future. We believe that fee transparency is essential for successful long-term investing.
                </p>
                <p>
                  The T-Rex Score featured in our calculators was developed by Larry Bates, author of "Beat the Bank," and provides a simple metric to understand what percentage of your investment returns you actually keep after fees.
                </p>
                <p>
                  Our team consists of financial educators, investment professionals, and technology experts committed to making investment fee knowledge accessible to everyone.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'testimonials' && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">What Others Are Saying</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {testimonials.map(testimonial => (
                  <div key={testimonial.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <LucideIcons.Star key={i} size={16} className="text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-700 italic mb-4">"{testimonial.text}"</p>
                    <div>
                      <p className="font-medium">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">{testimonial.title}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-12 bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Join Our Newsletter</h3>
                <p className="mb-4">Get the latest updates on investment fee research and tips to optimize your portfolio.</p>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (emailSignup.trim()) {
                    console.log("Email signup:", emailSignup);
                    setEmailSubmitted(true);
                    setTimeout(() => setEmailSubmitted(false), 3000);
                    setEmailSignup('');
                    trackEmailSignup();
                  }
                }} className="flex">
                  <input
                    type="email"
                    className="flex-grow focus:ring-black focus:border-black block sm:text-sm border-gray-300 rounded-l-md p-2 border"
                    placeholder="Your email address"
                    value={emailSignup}
                    onChange={(e) => setEmailSignup(e.target.value)}
                    required
                  />
                  <button
                    type="submit"
                    className="bg-black text-white px-4 py-2 rounded-r-md hover:bg-gray-800 transition-colors"
                  >
                    Subscribe
                  </button>
                </form>
                {emailSubmitted && (
                  <p className="text-green-600 mt-2">Thank you for subscribing!</p>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <footer className="text-center text-gray-500 text-sm mt-12">
            <p>FourStar Fees | Investment Fee Impact Calculator</p>
            <p className="mt-1">
              Available for UK, US, Canada, Australia, New Zealand, and expatriates in UAE, Spain, and Singapore
            </p>
            <div className="mt-3 flex justify-center space-x-4">
              <a 
                href="#" 
                className="hover:text-gray-700"
                onClick={(e) => {
                  e.preventDefault();
                  logPageView('Privacy Policy');
                }}
              >
                Privacy Policy
              </a>
              <a 
                href="#" 
                className="hover:text-gray-700"
                onClick={(e) => {
                  e.preventDefault();
                  logPageView('Terms of Use');
                }}
              >
                Terms of Use
              </a>
              <a 
                href="#" 
                className="hover:text-gray-700"
                onClick={(e) => {
                  e.preventDefault();
                  logPageView('Contact');
                }}
              >
                Contact
              </a>
            </div>
            <p className="mt-4 text-xs">© {new Date().getFullYear()} FourStar Fees. All rights reserved.</p>
          </footer>
        </div>
      </div>
    </div>
  );
};

// Wrap the app with the RegionProvider
const App = () => {
  return (
    <RegionProvider>
      <FourStarFees />
    </RegionProvider>
  );
};

export default App;
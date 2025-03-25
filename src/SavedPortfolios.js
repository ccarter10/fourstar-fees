import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import * as LucideIcons from 'lucide-react';

const SavedPortfolios = () => {
  const [portfolios, setPortfolios] = useState([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Platform data for form
  const platformOptions = [
    { id: 'vanguard', name: "Vanguard Investor", fee: 0.15, cap: 375 },
    { id: 'hl', name: "Hargreaves Lansdown", fee: 0.45, cap: null },
    { id: 'ajbell', name: "AJ Bell", fee: 0.25, cap: null },
    { id: 'ii', name: "Interactive Investor", fee: 0, fixedFee: 19.99 * 12 },
    { id: 'fidelity', name: "Fidelity", fee: 0.35, cap: 45 },
    { id: 'iweb', name: "iWeb", fee: 0, oneOffFee: 100 },
    { id: 'freetrade', name: "Freetrade", fee: 0, fixedFee: 59.88 },
    { id: 'charles-stanley', name: "Charles Stanley Direct", fee: 0.35, cap: null },
    { id: 'bestinvest', name: "Bestinvest", fee: 0.40, cap: null },
    { id: 'custom', name: "Custom Platform", fee: 0.30, cap: null }
  ];
  
  // Account types
  const accountTypes = ['ISA', 'SIPP', 'GIA', 'LISA', 'JISA'];
  
  // Form state
  const [form, setForm] = useState({
    id: Date.now(),
    name: '',
    platformId: 'vanguard',
    platformName: 'Vanguard Investor',
    accountType: 'ISA',
    investmentAmount: 20000,
    platformFee: 0.15,
    fundFee: 0.22,
    tradingCosts: 0,
    feeCap: 375,
    fixedFee: null,
    oneOffFee: null,
    funds: [
      { name: 'Global Index Fund', allocation: 60, fee: 0.22 },
      { name: 'UK Index Fund', allocation: 40, fee: 0.15 }
    ]
  });
  
  // Load saved portfolios from localStorage on initial render
  useEffect(() => {
    const savedPortfolios = localStorage.getItem('ukPortfolios');
    if (savedPortfolios) {
      try {
        setPortfolios(JSON.parse(savedPortfolios));
      } catch (error) {
        console.error('Error parsing saved portfolios', error);
        setPortfolios([]);
      }
    }
  }, []);
  
  // Save portfolios to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('ukPortfolios', JSON.stringify(portfolios));
  }, [portfolios]);
  
  // Handle form input changes
  const handleFormChange = (field, value) => {
    if (field === 'platformId') {
      const selectedPlatform = platformOptions.find(p => p.id === value);
      setForm({
        ...form,
        platformId: value,
        platformName: selectedPlatform.name,
        platformFee: selectedPlatform.fee,
        feeCap: selectedPlatform.cap || null,
        fixedFee: selectedPlatform.fixedFee || null,
        oneOffFee: selectedPlatform.oneOffFee || null
      });
    } else {
      setForm({
        ...form,
        [field]: value
      });
    }
  };
  
  // Add/update fund in the form
  const handleFundChange = (index, field, value) => {
    const updatedFunds = [...form.funds];
    updatedFunds[index] = {
      ...updatedFunds[index],
      [field]: field === 'allocation' || field === 'fee' ? Number(value) : value
    };
    setForm({
      ...form,
      funds: updatedFunds
    });
  };
  
  // Add a new fund to the form
  const addFund = () => {
    if (form.funds.length < 10) {
      setForm({
        ...form,
        funds: [...form.funds, { name: '', allocation: 0, fee: 0.20 }]
      });
    }
  };
  
  // Remove a fund from the form
  const removeFund = (index) => {
    const updatedFunds = [...form.funds];
    updatedFunds.splice(index, 1);
    setForm({
      ...form,
      funds: updatedFunds
    });
  };
  
  // Submit form to add/edit portfolio
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!form.name) {
      alert('Please enter a name for your portfolio');
      return;
    }
    
    // Ensure fund allocations sum to 100%
    const totalAllocation = form.funds.reduce((sum, fund) => sum + Number(fund.allocation), 0);
    if (Math.abs(totalAllocation - 100) > 0.1) {
      alert('Fund allocations must sum to 100%');
      return;
    }
    
    if (isEditing) {
      // Update existing portfolio
      const updatedPortfolios = portfolios.map(p => 
        p.id === form.id ? { ...form, lastUpdated: new Date().toISOString() } : p
      );
      setPortfolios(updatedPortfolios);
      setSelectedPortfolio({ ...form, lastUpdated: new Date().toISOString() });
    } else {
      // Add new portfolio
      const newPortfolio = {
        ...form,
        id: Date.now(),
        created: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
      setPortfolios([...portfolios, newPortfolio]);
      setSelectedPortfolio(newPortfolio);
    }
    
    setShowAddForm(false);
    setIsEditing(false);
  };
  
  // Delete a portfolio
  const deletePortfolio = (id) => {
    if (window.confirm('Are you sure you want to delete this portfolio?')) {
      const updatedPortfolios = portfolios.filter(p => p.id !== id);
      setPortfolios(updatedPortfolios);
      
      if (selectedPortfolio && selectedPortfolio.id === id) {
        setSelectedPortfolio(null);
      }
    }
  };
  
  // Edit a portfolio
  const editPortfolio = (portfolio) => {
    setForm(portfolio);
    setIsEditing(true);
    setShowAddForm(true);
  };
  
  // Calculate annual fee cost for a portfolio
  const calculateAnnualFee = (portfolio) => {
    let platformCost = 0;
    
    // Calculate platform fee
    if (portfolio.platformFee > 0) {
      platformCost = portfolio.investmentAmount * (portfolio.platformFee / 100);
      if (portfolio.feeCap && platformCost > portfolio.feeCap) {
        platformCost = portfolio.feeCap;
      }
    } else if (portfolio.fixedFee) {
      platformCost = portfolio.fixedFee;
    }
    
    // Calculate average fund fee
    const avgFundFee = portfolio.funds.reduce((sum, fund) => {
      return sum + (fund.fee * fund.allocation / 100);
    }, 0);
    
    const fundCost = portfolio.investmentAmount * (avgFundFee / 100);
    
    // Calculate trading costs (simplified estimate)
    const tradingCost = portfolio.tradingCosts * 4; // Assume 4 trades per year
    
    // Total annual cost
    const totalCost = platformCost + fundCost + tradingCost;
    
    // If there's a one-off fee, amortize it over 10 years for comparison
    const oneOffPerYear = portfolio.oneOffFee ? portfolio.oneOffFee / 10 : 0;
    
    return {
      platformCost,
      fundCost,
      tradingCost,
      oneOffPerYear,
      totalCost: totalCost + oneOffPerYear,
      costPercentage: (totalCost / portfolio.investmentAmount * 100).toFixed(2)
    };
  };
  
  // Calculate 20-year projection with fees
  const calculateProjection = (portfolio, years = 20) => {
    const annualCosts = calculateAnnualFee(portfolio);
    const totalFeePercentage = Number(annualCosts.costPercentage);
    const growthRate = 7; // Assumed annual growth rate
    
    const effectiveGrowth = growthRate - totalFeePercentage;
    
    const projection = [];
    let valueWithFees = portfolio.investmentAmount;
    let valueWithoutFees = portfolio.investmentAmount;
    
    for (let year = 0; year <= years; year++) {
      valueWithFees = year === 0 ? valueWithFees : valueWithFees * (1 + effectiveGrowth / 100);
      valueWithoutFees = year === 0 ? valueWithoutFees : valueWithoutFees * (1 + growthRate / 100);
      
      projection.push({
        year,
        valueWithFees: Math.round(valueWithFees),
        valueWithoutFees: Math.round(valueWithoutFees),
        feesLost: Math.round(valueWithoutFees - valueWithFees)
      });
    }
    
    return projection;
  };
  
  // Find the lowest cost platform for the current amount
  const findLowestCostPlatform = (amount) => {
    let lowestCost = Infinity;
    let lowestPlatform = null;
    
    platformOptions.forEach(platform => {
      let cost = 0;
      if (platform.fee > 0) {
        cost = amount * (platform.fee / 100);
        if (platform.cap && cost > platform.cap) {
          cost = platform.cap;
        }
      } else if (platform.fixedFee) {
        cost = platform.fixedFee;
      }
      
      // Amortize one-off fees
      if (platform.oneOffFee) {
        cost += platform.oneOffFee / 10;
      }
      
      if (cost < lowestCost) {
        lowestCost = cost;
        lowestPlatform = platform;
      }
    });
    
    return { platform: lowestPlatform, cost: lowestCost };
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
  
  // Format percentage
  const formatPercent = (value) => {
    return `${value.toFixed(2)}%`;
  };
  
  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  
  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#FF6B6B', '#54A0FF', '#5F27CD'];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">My UK Investment Portfolios</h2>
        
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            if (!showAddForm) {
              setForm({
                id: Date.now(),
                name: '',
                platformId: 'vanguard',
                platformName: 'Vanguard Investor',
                accountType: 'ISA',
                investmentAmount: 20000,
                platformFee: 0.15,
                fundFee: 0.22,
                tradingCosts: 0,
                feeCap: 375,
                fixedFee: null,
                oneOffFee: null,
                funds: [
                  { name: 'Global Index Fund', allocation: 60, fee: 0.22 },
                  { name: 'UK Index Fund', allocation: 40, fee: 0.15 }
                ]
              });
              setIsEditing(false);
            }
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
        >
          {showAddForm ? 'Cancel' : 'Add Portfolio'}
        </button>
      </div>
      
      {showAddForm ? (
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-700 mb-4">
            {isEditing ? 'Edit Portfolio' : 'Add New Portfolio'}
          </h3>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Portfolio Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="focus:ring-black focus:border-black block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                  value={form.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  placeholder="e.g., My Vanguard ISA"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="accountType" className="block text-sm font-medium text-gray-700 mb-1">
                  Account Type
                </label>
                <select
                  id="accountType"
                  className="focus:ring-black focus:border-black block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                  value={form.accountType}
                  onChange={(e) => handleFormChange('accountType', e.target.value)}
                >
                  {accountTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="platformId" className="block text-sm font-medium text-gray-700 mb-1">
                  Investment Platform
                </label>
                <select
                  id="platformId"
                  className="focus:ring-black focus:border-black block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                  value={form.platformId}
                  onChange={(e) => handleFormChange('platformId', e.target.value)}
                >
                  {platformOptions.map(platform => (
                    <option key={platform.id} value={platform.id}>{platform.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="investmentAmount" className="block text-sm font-medium text-gray-700 mb-1">
                  Investment Amount
                </label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">£</span>
                  </div>
                  <input
                    type="number"
                    id="investmentAmount"
                    className="focus:ring-black focus:border-black block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md p-2 border"
                    value={form.investmentAmount}
                    onChange={(e) => handleFormChange('investmentAmount', Number(e.target.value))}
                    min="1000"
                    step="1000"
                    required
                  />
                </div>
              </div>
              
              {form.platformId === 'custom' && (
                <>
                  <div>
                    <label htmlFor="platformFee" className="block text-sm font-medium text-gray-700 mb-1">
                      Platform Fee (%)
                    </label>
                    <div className="relative mt-1 rounded-md shadow-sm">
                      <input
                        type="number"
                        id="platformFee"
                        className="focus:ring-black focus:border-black block w-full pr-12 sm:text-sm border-gray-300 rounded-md p-2 border"
                        value={form.platformFee}
                        onChange={(e) => handleFormChange('platformFee', Number(e.target.value))}
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
                    <label htmlFor="feeCap" className="block text-sm font-medium text-gray-700 mb-1">
                      Fee Cap (£, leave empty if none)
                    </label>
                    <div className="relative mt-1 rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">£</span>
                      </div>
                      <input
                        type="number"
                        id="feeCap"
                        className="focus:ring-black focus:border-black block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md p-2 border"
                        value={form.feeCap || ''}
                        onChange={(e) => handleFormChange('feeCap', e.target.value ? Number(e.target.value) : null)}
                        min="0"
                        step="1"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="fixedFee" className="block text-sm font-medium text-gray-700 mb-1">
                      Fixed Annual Fee (£, leave empty if none)
                    </label>
                    <div className="relative mt-1 rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">£</span>
                      </div>
                      <input
                        type="number"
                        id="fixedFee"
                        className="focus:ring-black focus:border-black block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md p-2 border"
                        value={form.fixedFee || ''}
                        onChange={(e) => handleFormChange('fixedFee', e.target.value ? Number(e.target.value) : null)}
                        min="0"
                        step="1"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="tradingCosts" className="block text-sm font-medium text-gray-700 mb-1">
                      Trading Cost Per Trade (£)
                    </label>
                    <div className="relative mt-1 rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">£</span>
                      </div>
                      <input
                        type="number"
                        id="tradingCosts"
                        className="focus:ring-black focus:border-black block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md p-2 border"
                        value={form.tradingCosts}
                        onChange={(e) => handleFormChange('tradingCosts', Number(e.target.value))}
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <h4 className="text-md font-medium text-gray-700 mb-2">Fund Allocation</h4>
            <p className="text-sm text-gray-500 mb-4">
              Add the funds in your portfolio with their allocations (should sum to 100%).
            </p>
            
            <div className="space-y-4 mb-6">
              {form.funds.map((fund, index) => (
                <div key={index} className="flex flex-wrap items-center gap-4 p-3 bg-white rounded-md border border-gray-200">
                  <div className="flex-grow min-w-[200px]">
                    <label htmlFor={`fund-${index}-name`} className="block text-xs font-medium text-gray-700 mb-1">
                      Fund Name
                    </label>
                    <input
                      type="text"
                      id={`fund-${index}-name`}
                      className="focus:ring-black focus:border-black block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                      value={fund.name}
                      onChange={(e) => handleFundChange(index, 'name', e.target.value)}
                      placeholder="e.g., FTSE Global All Cap"
                      required
                    />
                  </div>
                  
                  <div className="w-24">
                    <label htmlFor={`fund-${index}-allocation`} className="block text-xs font-medium text-gray-700 mb-1">
                      Allocation %
                    </label>
                    <div className="relative mt-1 rounded-md shadow-sm">
                      <input
                        type="number"
                        id={`fund-${index}-allocation`}
                        className="focus:ring-black focus:border-black block w-full pr-8 sm:text-sm border-gray-300 rounded-md p-2 border"
                        value={fund.allocation}
                        onChange={(e) => handleFundChange(index, 'allocation', Number(e.target.value))}
                        min="0"
                        max="100"
                        step="1"
                        required
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-24">
                    <label htmlFor={`fund-${index}-fee`} className="block text-xs font-medium text-gray-700 mb-1">
                      OCF %
                    </label>
                    <div className="relative mt-1 rounded-md shadow-sm">
                      <input
                        type="number"
                        id={`fund-${index}-fee`}
                        className="focus:ring-black focus:border-black block w-full pr-8 sm:text-sm border-gray-300 rounded-md p-2 border"
                        value={fund.fee}
                        onChange={(e) => handleFundChange(index, 'fee', Number(e.target.value))}
                        min="0"
                        max="2"
                        step="0.01"
                        required
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="self-end pb-1.5">
                    <button
                      type="button"
                      onClick={() => removeFund(index)}
                      className="inline-flex items-center p-2 border border-transparent rounded-md text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      disabled={form.funds.length <= 1}
                    >
                      <LucideIcons.Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
              
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={addFund}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                  disabled={form.funds.length >= 10}
                >
                  <LucideIcons.Plus size={16} className="mr-2" />
                  Add Fund
                </button>
                
                <div className="text-sm text-gray-500">
                  Total allocation: <span className={`font-medium ${Math.abs(form.funds.reduce((sum, fund) => sum + Number(fund.allocation), 0) - 100) > 0.1 ? 'text-red-600' : 'text-green-600'}`}>
                    {form.funds.reduce((sum, fund) => sum + Number(fund.allocation), 0)}%
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              >
                {isEditing ? 'Update Portfolio' : 'Save Portfolio'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-1 bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-700 mb-4">My Portfolios</h3>
            
            {portfolios.length === 0 ? (
              <div className="text-center py-8">
                <LucideIcons.FolderPlus className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No portfolios</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new portfolio.</p>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                  >
                    <LucideIcons.Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                    Add Portfolio
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {portfolios.map(portfolio => (
                  <div 
                    key={portfolio.id}
                    className={`p-3 rounded-md cursor-pointer ${selectedPortfolio && selectedPortfolio.id === portfolio.id ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'}`}
                    onClick={() => setSelectedPortfolio(portfolio)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className={`font-medium ${selectedPortfolio && selectedPortfolio.id === portfolio.id ? 'text-white' : 'text-gray-900'}`}>
                          {portfolio.name}
                        </h4>
                        <p className={`text-xs ${selectedPortfolio && selectedPortfolio.id === portfolio.id ? 'text-gray-300' : 'text-gray-500'}`}>
                          {portfolio.accountType} • {portfolio.platformName}
                        </p>
                      </div>
                      <div className={`text-sm font-medium ${selectedPortfolio && selectedPortfolio.id === portfolio.id ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(portfolio.investmentAmount)}
                      </div>
                    </div>
                    <div className="mt-2 flex justify-between items-center">
                      <div className={`text-xs ${selectedPortfolio && selectedPortfolio.id === portfolio.id ? 'text-gray-300' : 'text-gray-500'}`}>
                        Updated {formatDate(portfolio.lastUpdated)}
                      </div>
                      <div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            editPortfolio(portfolio);
                          }}
                          className={`p-1 ml-2 rounded-md ${selectedPortfolio && selectedPortfolio.id === portfolio.id ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-200 text-gray-500'}`}
                        >
                          <LucideIcons.Edit3 size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deletePortfolio(portfolio.id);
                          }}
                          className={`p-1 ml-1 rounded-md ${selectedPortfolio && selectedPortfolio.id === portfolio.id ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-200 text-gray-500'}`}
                        >
                          <LucideIcons.Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="md:col-span-2">
            {selectedPortfolio ? (
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-medium text-gray-800">{selectedPortfolio.name}</h3>
                    <p className="text-gray-500">
                      {selectedPortfolio.accountType} • {selectedPortfolio.platformName} • 
                      {formatCurrency(selectedPortfolio.investmentAmount)}
                    </p>
                  </div>
                  <div className="flex">
                    <button
                      onClick={() => editPortfolio(selectedPortfolio)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                    >
                      <LucideIcons.Edit3 size={16} className="mr-2" />
                      Edit
                    </button>
                  </div>
                </div>
                
                {/* Fee Analysis */}
                {(() => {
                  const annualCosts = calculateAnnualFee(selectedPortfolio);
                  const lowestCostOption = findLowestCostPlatform(selectedPortfolio.investmentAmount);
                  const isCheapest = Math.abs(annualCosts.platformCost - lowestCostOption.cost) < 1;
                  
                  return (
                    <div className="mb-8">
                      <h4 className="text-lg font-medium text-gray-700 mb-4">Fee Analysis</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white rounded-md p-4 shadow-sm">
                          <p className="text-sm text-gray-500 mb-1">Annual Cost</p>
                          <p className="text-2xl font-semibold text-gray-800">{formatCurrency(annualCosts.totalCost)}</p>
                          <p className="text-xs text-gray-500">{annualCosts.costPercentage}% of portfolio</p>
                        </div>
                        
                        <div className="bg-white rounded-md p-4 shadow-sm">
                          <p className="text-sm text-gray-500 mb-1">Platform Fee</p>
                          <p className="text-2xl font-semibold text-gray-800">{formatCurrency(annualCosts.platformCost)}</p>
                          <p className="text-xs text-gray-500">
                            {selectedPortfolio.platformFee}% 
                            {selectedPortfolio.feeCap ? ` (capped at £${selectedPortfolio.feeCap})` : ''}
                            {selectedPortfolio.fixedFee ? ` Fixed £${selectedPortfolio.fixedFee}/yr` : ''}
                          </p>
                        </div>
                        
                        <div className="bg-white rounded-md p-4 shadow-sm">
                          <p className="text-sm text-gray-500 mb-1">Average Fund Fee</p>
                          <p className="text-2xl font-semibold text-gray-800">
                            {formatCurrency(annualCosts.fundCost)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatPercent(selectedPortfolio.funds.reduce((sum, fund) => sum + (fund.fee * fund.allocation / 100), 0))} weighted average
                          </p>
                        </div>
                      </div>
                      
                      {!isCheapest && (
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <LucideIcons.AlertTriangle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                            </div>
                            <div className="ml-3">
                              <p className="text-sm text-yellow-700">
                                <strong>You could save by switching platforms.</strong> {lowestCostOption.platform.name} would cost approximately {formatCurrency(lowestCostOption.cost)} per year for this portfolio size, saving you {formatCurrency(annualCosts.platformCost - lowestCostOption.cost)}.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Fee Breakdown Pie Chart */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Fee Breakdown</h5>
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={[
                                    { name: 'Platform Fee', value: annualCosts.platformCost },
                                    { name: 'Fund Fees', value: annualCosts.fundCost },
                                    { name: 'Trading Costs', value: annualCosts.tradingCost },
                                    ...(annualCosts.oneOffPerYear > 0 ? [{ name: 'One-Off Fee (Amortized)', value: annualCosts.oneOffPerYear }] : [])
                                  ]}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="value"
                                  nameKey="name"
                                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                >
                                  {[
                                    { name: 'Platform Fee', value: annualCosts.platformCost },
                                    { name: 'Fund Fees', value: annualCosts.fundCost },
                                    { name: 'Trading Costs', value: annualCosts.tradingCost },
                                    ...(annualCosts.oneOffPerYear > 0 ? [{ name: 'One-Off Fee (Amortized)', value: annualCosts.oneOffPerYear }] : [])
                                  ].map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Fund Allocation</h5>
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={selectedPortfolio.funds.map(fund => ({
                                    name: fund.name,
                                    value: fund.allocation
                                  }))}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="value"
                                  nameKey="name"
                                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                >
                                  {selectedPortfolio.funds.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip formatter={(value) => `${value}%`} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
                
                {/* 20-Year Projection */}
                <div>
                  <h4 className="text-lg font-medium text-gray-700 mb-4">20-Year Projection</h4>
                  
                  <div className="h-64 md:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={calculateProjection(selectedPortfolio)}
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
                          tickFormatter={(value) => value.toLocaleString('en-GB', { 
                            style: 'currency', 
                            currency: 'GBP',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                            notation: 'compact'
                          })} 
                        />
                        <Tooltip 
                          formatter={(value) => [value.toLocaleString('en-GB', { 
                            style: 'currency', 
                            currency: 'GBP',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                          }), '']} 
                          labelFormatter={(label) => `Year ${label}`}
                          contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '4px' }}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="valueWithoutFees" 
                          name="Without Fees" 
                          stroke="#10B981" 
                          strokeWidth={3} 
                          activeDot={{ r: 8 }} 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="valueWithFees" 
                          name="With Fees" 
                          stroke="#6366F1" 
                          strokeWidth={3} 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="feesLost" 
                          name="Lost to Fees" 
                          stroke="#EF4444" 
                          strokeWidth={2} 
                          strokeDasharray="5 5"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="mt-4 bg-white rounded-md p-4 shadow-sm">
                    <h5 className="text-md font-medium text-gray-700 mb-2">Key Insights</h5>
                    
                    {(() => {
                      const projection = calculateProjection(selectedPortfolio);
                      const finalValue = projection[projection.length - 1].valueWithFees;
                      const finalWithoutFees = projection[projection.length - 1].valueWithoutFees;
                      const feesLost = projection[projection.length - 1].feesLost;
                      const feeImpactPercent = (feesLost / finalWithoutFees * 100).toFixed(1);
                      
                      return (
                        <div className="text-sm text-gray-600 space-y-2">
                          <p>• Your {formatCurrency(selectedPortfolio.investmentAmount)} could grow to approximately <strong>{formatCurrency(finalValue)}</strong> over 20 years.</p>
                          <p>• You would pay approximately <strong>{formatCurrency(feesLost)}</strong> in fees over this period.</p>
                          <p>• Fees would reduce your potential returns by <strong>{feeImpactPercent}%</strong>.</p>
                          <p>• For comparison, with zero fees, your investment would grow to <strong>{formatCurrency(finalWithoutFees)}</strong>.</p>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-6 flex flex-col items-center justify-center" style={{ minHeight: '400px' }}>
                <LucideIcons.BarChart size={48} className="text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">Select a portfolio</h3>
                <p className="text-gray-500 text-center mb-6">
                  Choose a portfolio from the list or create a new one to view detailed analysis and projections.
                </p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                >
                  <LucideIcons.Plus size={16} className="mr-2" />
                  Create Portfolio
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Understanding UK Portfolio Management</h2>
        
        <div className="prose max-w-none">
          <p>
            Effective portfolio management involves more than just picking the right investments. 
            Understanding and minimizing costs is crucial for maximizing your long-term returns.
          </p>
          
          <h3>UK Investment Account Types</h3>
          <ul>
            <li><strong>ISA (Individual Savings Account)</strong>: Tax-efficient wrapper allowing you to invest up to £20,000 per tax year with no tax on gains or income.</li>
            <li><strong>SIPP (Self-Invested Personal Pension)</strong>: Tax-advantaged pension account with tax relief on contributions.</li>
            <li><strong>GIA (General Investment Account)</strong>: Standard taxable investment account with no tax benefits.</li>
            <li><strong>LISA (Lifetime ISA)</strong>: For those aged 18-39, with government bonuses for first home or retirement.</li>
            <li><strong>JISA (Junior ISA)</strong>: Tax-free savings account for children under 18.</li>
          </ul>
          
          <h3>Understanding Fees</h3>
          <p>
            Investment costs in the UK typically fall into these categories:
          </p>
          <ul>
            <li><strong>Platform Fees</strong>: Charges for using the investment platform, typically 0.15% to 0.45% of your investments annually, sometimes with caps for larger portfolios.</li>
            <li><strong>Fund Fees (OCF - Ongoing Charge Figure)</strong>: Charges by the fund managers, ranging from 0.05% for simple index trackers to 1%+ for active funds.</li>
            <li><strong>Trading Costs</strong>: Per-trade charges when buying or selling investments, ranging from free to £12+ per trade.</li>
            <li><strong>Fixed Account Fees</strong>: Some platforms charge fixed monthly fees instead of percentage-based fees.</li>
          </ul>
          
          <h3>Platform Selection Strategy</h3>
          <p>
            The optimal platform depends on your portfolio size and investment style:
          </p>
          <ul>
            <li><strong>Small Portfolios (under £40,000)</strong>: Percentage-based platforms are often cheaper.</li>
            <li><strong>Medium Portfolios (£40,000-£100,000)</strong>: Compare fixed-fee vs percentage platforms carefully.</li>
            <li><strong>Large Portfolios (over £100,000)</strong>: Fixed-fee platforms or those with fee caps typically offer better value.</li>
            <li><strong>Frequent traders</strong> should prioritize low trading costs.</li>
            <li><strong>Buy-and-hold investors</strong> should focus more on platform fees than trading costs.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SavedPortfolios;
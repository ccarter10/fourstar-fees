import React, { createContext, useState, useContext, useEffect } from 'react';

// Region data with relevant information for each supported region
export const regionData = {
  uk: {
    name: 'UK',
    currency: 'GBP',
    currencySymbol: '£',
    locale: 'en-GB',
    taxAccounts: ['ISA', 'SIPP', 'GIA', 'LISA', 'JISA'],
    allowances: {
      isa: 20000,
      pension: 60000,
      capitalGains: 6000,
      dividend: 500,
      personal: 12570
    },
    taxRates: {
      basic: { income: 20, dividend: 8.75, capitalGains: 10 },
      higher: { income: 40, dividend: 33.75, capitalGains: 20 },
      additional: { income: 45, dividend: 39.35, capitalGains: 20 }
    },
    retirementAge: 67,
    stateRetirementBenefit: 800 // monthly
  },
  us: {
    name: 'US',
    currency: 'USD',
    currencySymbol: '$',
    locale: 'en-US',
    taxAccounts: ['401k', 'IRA', 'Roth IRA', 'Taxable', '529', 'HSA'],
    allowances: {
      ira: 7000,
      roth: 7000,
      k401: 23000,
      hsa: 4150
    },
    taxRates: {
      low: { income: 12, longTermGains: 0, shortTermGains: 12 },
      medium: { income: 22, longTermGains: 15, shortTermGains: 22 },
      high: { income: 32, longTermGains: 20, shortTermGains: 32 }
    },
    retirementAge: 65,
    stateRetirementBenefit: 1500 // monthly Social Security estimate
  },
  ca: {
    name: 'Canada',
    currency: 'CAD',
    currencySymbol: '$',
    locale: 'en-CA',
    taxAccounts: ['RRSP', 'TFSA', 'Non-Registered', 'RESP', 'FHSA'],
    allowances: {
      rrsp: 31250, // 2025 estimate, 18% of prior year earned income up to this limit
      tfsa: 7000,   // Annual contribution room
      fhsa: 8000    // First Home Savings Account
    },
    taxRates: {
      federal: { income: [15, 20.5, 26, 29, 33] }, // Simplified, actual brackets vary
      capitalGains: 50 // Only 50% of capital gains are taxable at income rate
    },
    retirementAge: 65,
    stateRetirementBenefit: 1200 // monthly CPP/OAS estimate
  },
  au: {
    name: 'Australia',
    currency: 'AUD',
    currencySymbol: '$',
    locale: 'en-AU',
    taxAccounts: ['Superannuation', 'Personal', 'Trusts'],
    allowances: {
      super: 32500,  // Concessional contributions cap
      nonConcessional: 110000 // After-tax super contributions
    },
    taxRates: {
      income: [0, 19, 32.5, 37, 45], // Simplified
      super: 15, // Superannuation tax rate
      capitalGains: 50 // Discount for assets held > 12 months (then taxed at income rate)
    },
    retirementAge: 67,
    stateRetirementBenefit: 1000 // Age Pension estimate
  },
  nz: {
    name: 'New Zealand',
    currency: 'NZD',
    currencySymbol: '$',
    locale: 'en-NZ',
    taxAccounts: ['KiwiSaver', 'PIE', 'Personal'],
    allowances: {},
    taxRates: {
      income: [10.5, 17.5, 30, 33, 39], // Simplified
      pie: [10.5, 17.5, 28], // Portfolio Investment Entity rates
      noCapitalGains: true // NZ generally has no capital gains tax
    },
    retirementAge: 65,
    stateRetirementBenefit: 900 // NZ Superannuation estimate
  },
  ae: {
    name: 'UAE',
    currency: 'AED',
    currencySymbol: 'AED',
    locale: 'en-AE',
    taxAccounts: ['Personal', 'Investment Bonds', 'Offshore'],
    allowances: {},
    taxRates: {
      noIncomeTax: true,
      noCapitalGains: true,
      noDividendTax: true
    },
    retirementAge: 60,
    stateRetirementBenefit: 0 // No state pension for expats
  },
  es: {
    name: 'Spain',
    currency: 'EUR',
    currencySymbol: '€',
    locale: 'es-ES',
    taxAccounts: ['Personal', 'Investment Bonds', 'SICAVs', 'Pension Plans'],
    allowances: {
      pensionPlan: 8500 // Annual tax-efficient pension contribution
    },
    taxRates: {
      income: [19, 24, 30, 37, 45, 47], // Simplified
      savings: [19, 21, 23, 27], // Tax on investment income (varies by region)
      wealthTax: true // Wealth tax varies by region
    },
    retirementAge: 65,
    stateRetirementBenefit: 500 // For expats with sufficient contributions
  },
  sg: {
    name: 'Singapore',
    currency: 'SGD',
    currencySymbol: 'S$',
    locale: 'en-SG',
    taxAccounts: ['SRS', 'CPF', 'Personal'],
    allowances: {
      srs: 15300, // Supplementary Retirement Scheme
      cpf: 37740  // Ordinary and Special Account combined cap
    },
    taxRates: {
      income: [0, 2, 3.5, 7, 11.5, 15, 18, 19, 20, 22], // Simplified
      noCapitalGains: true, // No capital gains tax in Singapore
      dividend: 0 // No dividend tax for Singapore companies
    },
    retirementAge: 63,
    stateRetirementBenefit: 0 // CPF for locals, not applicable to most expats
  }
};

// Create the context
const RegionContext = createContext();

// Custom hook to use the region context
export const useRegion = () => {
  const context = useContext(RegionContext);
  if (!context) {
    throw new Error('useRegion must be used within a RegionProvider');
  }
  return context;
};

// Provider component
export const RegionProvider = ({ children }) => {
  const [region, setRegion] = useState('uk'); // Default to UK
  const [isExpat, setIsExpat] = useState(false);
  
  // Format currency based on current region
  const formatCurrency = (value, options = {}) => {
    const currentRegion = regionData[region];
    return new Intl.NumberFormat(currentRegion.locale, {
      style: 'currency',
      currency: currentRegion.currency,
      minimumFractionDigits: options.minimumFractionDigits ?? 0,
      maximumFractionDigits: options.maximumFractionDigits ?? 0,
      notation: options.compact ? 'compact' : 'standard'
    }).format(value);
  };
  
  // Format percentage
  const formatPercentage = (value, decimals = 1) => {
    return `${value.toFixed(decimals)}%`;
  };
  
  // Check if region is an expat location
  useEffect(() => {
    setIsExpat(['ae', 'es', 'sg'].includes(region));
  }, [region]);
  
  // Get current region data
  const currentRegionData = regionData[region];
  
  return (
    <RegionContext.Provider value={{
      region,
      setRegion,
      isExpat,
      currentRegionData,
      formatCurrency,
      formatPercentage,
      regionData
    }}>
      {children}
    </RegionContext.Provider>
  );
};

export default RegionContext;
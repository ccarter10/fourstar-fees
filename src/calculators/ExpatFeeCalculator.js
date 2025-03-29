// Create this file at src/calculators/ExpatFeeCalculator.js

import React from 'react';
import { useRegion } from '../RegionContext';

const ExpatFeeCalculator = ({ region }) => {
  const { formatCurrency } = useRegion();

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          {region === 'ae' ? 'UAE' : region === 'es' ? 'Spain' : 'Singapore'} Expat Investment Fee Calculator
        </h2>
      </div>
      
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              We're still building our expat calculator for {region === 'ae' ? 'UAE' : region === 'es' ? 'Spain' : 'Singapore'}. Check back soon for a detailed fee calculator specific to expat investment options.
            </p>
          </div>
        </div>
      </div>
      
      <div className="prose max-w-none">
        <p>
          Investing as an expat in {region === 'ae' ? 'UAE' : region === 'es' ? 'Spain' : 'Singapore'} comes with unique considerations. We're working on a comprehensive fee calculator that will include:
        </p>
        
        <ul>
          <li>Local investment platforms and their fee structures</li>
          <li>Offshore investment options</li>
          <li>Tax implications for {region === 'ae' ? 'UAE' : region === 'es' ? 'Spanish' : 'Singapore'} residents</li>
          <li>Currency considerations</li>
          <li>Insurance-wrapped investment products</li>
        </ul>
        
        <p>
          In the meantime, our {region === 'ae' ? 'UK' : region === 'es' ? 'UK' : 'Australia'} calculator can provide a good starting point for understanding fee impacts on long-term returns.
        </p>
      </div>
    </div>
  );
};

export default ExpatFeeCalculator;
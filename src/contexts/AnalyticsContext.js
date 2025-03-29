// 1. First, create an Analytics Context to make analytics available throughout your app
// Create this file as src/contexts/AnalyticsContext.js

import React, { createContext, useContext } from 'react';
import { getAnalytics, logEvent } from 'firebase/analytics';
import { app } from '../firebase-config';

// Initialize analytics
const analytics = getAnalytics(app);

// Create the context
const AnalyticsContext = createContext(null);

// Create a provider component
export const AnalyticsProvider = ({ children }) => {
  // Define tracking functions
  const trackEvent = (eventName, eventParams = {}) => {
    logEvent(analytics, eventName, eventParams);
  };

  const trackComponentView = (componentName, additionalParams = {}) => {
    logEvent(analytics, 'component_view', {
      component_name: componentName,
      ...additionalParams
    });
  };

  const trackComponentInteraction = (componentName, interactionType, additionalParams = {}) => {
    logEvent(analytics, 'component_interaction', {
      component_name: componentName,
      interaction_type: interactionType,
      ...additionalParams
    });
  };

  const value = {
    analytics,
    trackEvent,
    trackComponentView,
    trackComponentInteraction
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};

// Create a custom hook for using analytics
export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (context === null) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};
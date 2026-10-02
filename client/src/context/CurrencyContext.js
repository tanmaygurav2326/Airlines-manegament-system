import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const CurrencyContext = createContext();

const DEFAULT_RATES = {
  INR: 1.0,
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0094,
  AED: 0.044,
  SGD: 0.016,
  JPY: 1.77
};

const SYMBOLS = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  AED: 'AED ',
  SGD: 'S$',
  JPY: '¥'
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrencyState] = useState(() => {
    return localStorage.getItem('enum_currency') || 'INR';
  });
  const [rates, setRates] = useState(DEFAULT_RATES);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await api.get('/currency/rates');
        if (res?.data?.rates) {
          setRates(res.data.rates);
        }
      } catch (e) {
        // Fall back to default rates
      }
    };
    fetchRates();
  }, []);

  const setCurrency = (c) => {
    setCurrencyState(c);
    localStorage.setItem('enum_currency', c);
  };

  /**
   * Convert and format an INR amount into the currently selected currency.
   * e.g. 5490 → "₹5,490" or "$66"
   */
  const formatPrice = (amountInINR) => {
    if (amountInINR === undefined || amountInINR === null || isNaN(amountInINR)) {
      return `${SYMBOLS[currency] || '₹'}0`;
    }
    const num = Number(amountInINR);
    const rate = rates[currency] || 1;
    const converted = Math.round(num * rate);
    const symbol = SYMBOLS[currency] || '₹';

    if (currency === 'INR') {
      return `${symbol}${converted.toLocaleString('en-IN')}`;
    }
    return `${symbol}${converted.toLocaleString()}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, rates, formatPrice, symbols: SYMBOLS }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);

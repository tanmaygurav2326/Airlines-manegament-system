import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ fullPage = false, text = 'Loading...' }) => {
  if (fullPage) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-600 font-medium text-sm animate-pulse">{text}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4 space-x-2">
      <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
      {text && <span className="text-gray-600 text-sm font-medium">{text}</span>}
    </div>
  );
};

export default LoadingSpinner;

import React from 'react';
import FinancialDashboard from './components/FinancialDashboard';
import { FinancialProvider } from './contexts/FinancialContext';
import './App.css';

function App() {
  return (
    <div className="App">
      <FinancialProvider>
        <FinancialDashboard />
      </FinancialProvider>
    </div>
  );
}

export default App;
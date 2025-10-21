import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Web3Provider, useWeb3 } from './contexts/Web3Context';
import UserDashboard from './components/UserDashboard';
import ValidatorDashboard from './components/ValidatorDashboard';
import WalletConnect from './components/WalletConnect';
import './App.css';

function App() {
  return (
    <Web3Provider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
          <Routes>
            <Route path="/" element={<WalletConnect />} />
            <Route path="/user" element={<UserDashboard />} />
            <Route path="/validator" element={<ValidatorDashboard />} />
            <Route path="/both" element={<BothDashboards />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </Web3Provider>
  );
}

// New component to show both dashboards side by side
function BothDashboards() {
  const { isOwner } = useWeb3();
  
  if (!isOwner) {
    return <Navigate to="/user" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Dual Dashboard View - Validator & User Perspective
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Validator Dashboard */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-blue-600">Validator Dashboard</h2>
            <ValidatorDashboard />
          </div>
          
          {/* User Dashboard */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-green-600">User Dashboard</h2>
            <UserDashboard />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;


import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Wallet, Shield, FileText, TrendingUp } from 'lucide-react';

const WalletConnect = () => {
  const { account, isOwner, connectWallet, loading, error } = useWeb3();
  const navigate = useNavigate();

  useEffect(() => {
    if (account) {
      if (isOwner) {
        navigate('/validator');
      } else {
        navigate('/user');
      }
    }
  }, [account, isOwner, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          {/* Header Section */}
          <div className="text-center space-y-6 mb-12">
            <div className="mx-auto w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-blue-600">
              Credit Scoring System
            </h1>
            <p className="text-lg text-gray-600">
              Document Validation & Credit Score Management Platform
            </p>
          </div>
          
          {/* Three Step Process */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="flex flex-col items-center p-6 bg-blue-50 rounded-xl">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-lg text-gray-800 mb-2">Submit Documents</h3>
              <p className="text-sm text-gray-600 text-center">
                Upload and verify your credentials
              </p>
            </div>
            
            <div className="flex flex-col items-center p-6 bg-purple-50 rounded-xl">
              <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-bold text-lg text-gray-800 mb-2">Get Validated</h3>
              <p className="text-sm text-gray-600 text-center">
                Secure validation by authorized validators
              </p>
            </div>
            
            <div className="flex flex-col items-center p-6 bg-pink-50 rounded-xl">
              <div className="w-16 h-16 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-bold text-lg text-gray-800 mb-2">Build Credit Score</h3>
              <p className="text-sm text-gray-600 text-center">
                Improve your creditworthiness score
              </p>
            </div>
          </div>

        {/* Connect Wallet Section */}
        <div className="space-y-6">
          <Button
            onClick={connectWallet}
            disabled={loading}
            className="w-full h-16 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg transition-all duration-200"
          >
            <Wallet className="mr-3 h-6 w-6" />
            {loading ? 'Connecting...' : 'Connect Wallet'}
          </Button>
          
          {/* Dual Dashboard Link for Validators */}
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">Validator? Access both dashboards:</p>
            <a 
              href="/both" 
              className="inline-block px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              View Both Dashboards
            </a>
          </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 text-center">
                  {error}
                </p>
              </div>
            )}

            <div className="text-center text-sm text-gray-500 space-y-1">
              <p>Connect your wallet to access the dashboard</p>
              <p>Validators will see the admin panel</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletConnect;


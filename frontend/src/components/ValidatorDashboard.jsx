import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import { ethers } from 'ethers';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { 
  LogOut, 
  Shield, 
  Users, 
  FileCheck, 
  TrendingUp,
  CheckCircle,
  XCircle,
  Search,
  Wallet,
  Calculator
} from 'lucide-react';
import { DOCUMENT_TYPE_NAMES } from '../contract';

const ValidatorDashboard = () => {
  const { account, contract, isOwner, disconnectWallet } = useWeb3();
  const navigate = useNavigate();
  
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchAddress, setSearchAddress] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDocuments, setUserDocuments] = useState([]);
  const [userCredit, setUserCredit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [allPendingDocs, setAllPendingDocs] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    if (!account) {
      navigate('/');
    } else if (!isOwner) {
      navigate('/user');
    } else {
      loadValidatorData();
    }
  }, [account, isOwner, navigate]);

  const loadValidatorData = async () => {
    if (!contract) return;
    
    setLoading(true);
    try {
      const total = await contract.totalUsers();
      setTotalUsers(total.toNumber());
      
      // Load all pending documents
      await loadAllPendingDocuments();
    } catch (error) {
      console.error('Error loading validator data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllPendingDocuments = async () => {
    if (!contract) return;
    
    try {
      // For now, we'll show a message that users need to search for specific users
      // In a real implementation, you'd need to maintain a list of all user addresses
      setAllPendingDocs([]);
      setRecentUsers([]);
    } catch (error) {
      console.error('Error loading pending documents:', error);
    }
  };

  const searchUser = async () => {
    if (!contract || !searchAddress) return;
    
    setLoading(true);
    try {
      const userCredit = await contract.getUserCredit(searchAddress);
      const userDocs = await contract.getUserDocuments(searchAddress);
      
      // Check if user exists (has any credit data)
      if (userCredit.creditScore.toNumber() === 0 && userCredit.validatedDocs.toNumber() === 0 && !userCredit.isActive) {
        console.log('User does not exist yet, initializing with default values');
        setUserCredit({
          creditScore: 0,
          validatedDocs: 0,
          isActive: false
        });
        setUserDocuments([]);
        setSelectedUser(searchAddress);
        return;
      }
      
      setUserCredit({
        creditScore: userCredit.creditScore.toNumber(),
        validatedDocs: userCredit.validatedDocs.toNumber(),
        isActive: userCredit.isActive
      });

      // Check if user has any documents
      if (userDocs[0].length === 0) {
        console.log('No documents found for user');
        setUserDocuments([]);
        return;
      }
      
      // Get detailed document information
      const userDocDetails = await contract.getUserDocumentDetails(searchAddress);
      console.log('User document details:', userDocDetails);
      
      // Map the basic and detailed information together
      const formattedDocs = userDocs[0].map((docHash, index) => ({
        id: index,
        docHash: docHash,
        docType: userDocs[1][index], // docTypes array
        salary: userDocDetails[0][index].toNumber(), // salaries array
        employmentYears: userDocDetails[1][index].toNumber(), // employmentYears array
        repaymentHistoryScore: userDocDetails[2][index].toNumber(), // repaymentHistoryScores array
        currentBalance: userDocDetails[3][index].toNumber(), // currentBalances array
        lastTotalUtilityBills: userDocDetails[4][index].toNumber(), // lastTotalUtilityBills array
        documentAuthenticity: userDocDetails[5][index], // documentAuthenticities array
        isValidated: userDocs[2][index], // isValidatedArray array
        submissionTime: new Date(userDocs[3][index].toNumber() * 1000), // submissionTimes array
        validationTime: userDocDetails[6][index].toNumber() > 0 ? new Date(userDocDetails[6][index].toNumber() * 1000) : null // validationTimes array
      }));
      
      setUserDocuments(formattedDocs);

      setSelectedUser(searchAddress);
    } catch (error) {
      console.error('Error searching user:', error);
      alert('User not found or error occurred');
    } finally {
      setLoading(false);
    }
  };

  const validateDocument = async (docIndex) => {
    if (!contract || !selectedUser) return;
    
    setValidating(true);
    try {
      const tx = await contract.validateDocument(selectedUser, docIndex);
      await tx.wait();
      
      // Reload user data
      await searchUser();
      
      // Also reload validator data to update total users count
      await loadValidatorData();
      
      alert('Document validated successfully!');
    } catch (error) {
      console.error('Error validating document:', error);
      alert('Error validating document: ' + error.message);
    } finally {
      setValidating(false);
    }
  };

  const calculateCreditScore = async () => {
    if (!contract || !selectedUser) return;
    
    setValidating(true);
    try {
      const tx = await contract.calculateCreditScore(selectedUser);
      await tx.wait();
      
      // Reload user data
      await searchUser();
      
      // Also reload validator data to update total users count
      await loadValidatorData();
      
      alert('Credit score calculated successfully!');
    } catch (error) {
      console.error('Error calculating credit score:', error);
      alert('Error calculating credit score: ' + error.message);
    } finally {
      setValidating(false);
    }
  };

  const toggleUserStatus = async (activate) => {
    if (!contract || !selectedUser) return;
    
    setValidating(true);
    try {
      const tx = activate 
        ? await contract.reactivateUser(selectedUser)
        : await contract.deactivateUser(selectedUser);
      
      await tx.wait();
      
      // Reload user data
      await searchUser();
      
      // Also reload validator data to update total users count
      await loadValidatorData();
      
      alert(`User ${activate ? 'activated' : 'deactivated'} successfully!`);
    } catch (error) {
      console.error('Error toggling user status:', error);
      alert('Error updating user status: ' + error.message);
    } finally {
      setValidating(false);
    }
  };

  const refreshData = async () => {
    if (selectedUser) {
      await searchUser();
    } else {
      await loadValidatorData();
    }
  };

  // Auto-refresh disabled per request. Use the Refresh button to update.

  // Auto-search when searchAddress changes
  useEffect(() => {
    if (searchAddress && searchAddress.length === 42 && searchAddress.startsWith('0x')) {
      searchUser();
    }
  }, [searchAddress]);

  // Function to get current user's address from User Dashboard
  // Removed quick-access helper; validators can search directly using an address

  if (loading && !selectedUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg">Loading validator dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Validator Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Wallet className="h-4 w-4" />
                <span className="font-mono">{account?.slice(0, 6)}...{account?.slice(-4)}</span>
              </div>
              <Button onClick={refreshData} variant="outline" size="sm" disabled={loading}>
                {loading ? 'Refreshing...' : 'Refresh'}
              </Button>
              <Button onClick={disconnectWallet} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Disconnect
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Validations</CardTitle>
              <FileCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {selectedUser ? userDocuments.filter(doc => !doc.isValidated).length : 'Search User'}
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedUser ? 'Documents to review' : 'Search for user to see pending docs'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Active</div>
              <p className="text-xs text-muted-foreground">All systems operational</p>
            </CardContent>
          </Card>
        </div>

        {/* User Search */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Search User
            </CardTitle>
            <CardDescription>
              Enter a wallet address to view user details and manage their documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex space-x-4">
                <Input
                  placeholder="Enter wallet address (0x...)"
                  value={searchAddress}
                  onChange={(e) => setSearchAddress(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={searchUser} disabled={loading || !searchAddress}>
                  {loading ? 'Searching...' : 'Search'}
                </Button>
              </div>
              
              {/* Helpful message */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <FileCheck className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      How to find pending documents:
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <ul className="list-disc list-inside space-y-1">
                        <li>Users submit documents through the User Dashboard</li>
                        <li>Search for their wallet address above to see their documents</li>
                        <li>Pending documents will show "Pending" status and can be validated</li>
                        <li>After validation, documents will show "Validated" status</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Access removed per request */}

        {/* User Details */}
        {selectedUser && userCredit && (
          <div className="space-y-6">
            {/* User Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>User Information</span>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => toggleUserStatus(!userCredit.isActive)}
                      variant={userCredit.isActive ? "destructive" : "default"}
                      size="sm"
                      disabled={validating}
                    >
                      {userCredit.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      onClick={calculateCreditScore}
                      disabled={validating}
                      size="sm"
                    >
                      <Calculator className="h-4 w-4 mr-2" />
                      Calculate Score
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Wallet Address</p>
                    <p className="font-mono text-sm">{selectedUser}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Credit Score</p>
                    <p className="text-2xl font-bold">{userCredit.creditScore}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Validated Documents</p>
                    <p className="text-2xl font-bold">{userCredit.validatedDocs}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant={userCredit.isActive ? "default" : "secondary"}>
                      {userCredit.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Documents Table */}
            <Card>
              <CardHeader>
                <CardTitle>User Documents</CardTitle>
                <CardDescription>
                  Review and validate submitted documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                {userDocuments.length === 0 ? (
                  <div className="text-center py-8">
                    <FileCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No documents found for this user</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userDocuments.map((doc, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <FileCheck className="h-4 w-4" />
                              <span>{DOCUMENT_TYPE_NAMES[doc.docType]}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {doc.submissionTime.toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant={doc.isValidated ? "default" : "secondary"}>
                              {doc.isValidated ? "Validated" : "Pending"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm space-y-1">
                              <p>Salary: ${doc.salary.toLocaleString()}</p>
                              <p>Employment: {doc.employmentYears} years</p>
                              <p>Repayment: {doc.repaymentHistoryScore}/100</p>
                              <p>Balance: ${doc.currentBalance.toLocaleString()}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {!doc.isValidated ? (
                              <Button
                                onClick={() => validateDocument(index)}
                                disabled={validating}
                                size="sm"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Validate
                              </Button>
                            ) : (
                              <div className="flex items-center text-green-600">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Validated
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ValidatorDashboard;



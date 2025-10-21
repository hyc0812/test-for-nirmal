# Credit Scoring Dashboard

A comprehensive frontend application for the Credit Scoring Smart Contract system. This React-based dashboard provides both user and validator interfaces for managing credit scores through document validation.

## Features

### User Dashboard
- **Document Submission**: Upload and submit documents with credit scoring parameters
- **Credit Score Display**: View current credit score with visual indicators
- **Document History**: Track all submitted documents and their validation status
- **Real-time Updates**: See validation status changes in real-time

### Validator Dashboard
- **Document Validation**: Review and validate submitted documents
- **User Management**: Manage user accounts and their status
- **Contract Statistics**: View system-wide statistics and metrics
- **Admin Controls**: Deactivate/reactivate users as needed

## Document Types

The system supports three types of documents:

1. **Bank Statement** (Required)
   - Current bank balance
   - Repayment history score (0-100)
   - Document authenticity verification

2. **Utility Bill** (Required)
   - Total utility bills amount
   - Document authenticity verification

3. **Salary Slip** (Optional)
   - Annual salary/income
   - Years of employment
   - Document authenticity verification

## Credit Score Calculation

The credit score is calculated using a weighted formula based on validated documents:

- **Bank Statement**: Authenticity (100) + Repayment History + Balance Percentage
- **Utility Bill**: Authenticity (100) + Utility Amount Percentage
- **Salary Slip**: Authenticity (100) + Income Percentage + Employment Percentage

Final score is capped between 600-1000 points.

## Prerequisites

- Node.js (v14 or higher)
- MetaMask browser extension
- Truffle development environment
- Local blockchain (Ganache)

## Installation

1. **Deploy Smart Contract**
   ```bash
   truffle migrate --reset
   ```

2. **Note Contract Address**
   - Copy the deployed contract address from the migration output
   - You'll need this for frontend integration

3. **Frontend Setup**
   - The frontend has been removed from this repository
   - You can create a new React frontend or use any other framework
   - Integrate with the deployed smart contract using Web3.js or ethers.js

## Usage

### For Users

1. **Connect Wallet**: Click "Connect MetaMask Wallet" on the login page
2. **Submit Documents**: 
   - Go to "Submit Document" tab
   - Select document type
   - Fill in required parameters
   - Upload document file
   - Confirm authenticity
   - Submit for validation
3. **View Credit Score**: Check your current credit score in the "Overview" tab
4. **Track Progress**: Monitor document validation status in "Document History"

### For Validators

1. **Access Validator Dashboard**: Connect with the contract owner's wallet
2. **Validate Documents**: 
   - Go to "Pending Documents" tab
   - Review document details and parameters
   - Click "Validate" to approve documents
3. **Manage Users**: 
   - Use "User Management" tab to view all users
   - Activate/deactivate user accounts as needed
4. **View Statistics**: Check system metrics in "Contract Statistics" tab

## Project Structure

```
src/
├── components/
│   ├── UserDashboard.js          # Main user interface
│   ├── ValidatorDashboard.js     # Main validator interface
│   ├── DocumentSubmission.js     # Document upload form
│   ├── CreditScoreDisplay.js     # Credit score visualization
│   ├── DocumentHistory.js        # Document tracking
│   ├── PendingDocuments.js       # Validator document review
│   ├── UserManagement.js         # User account management
│   ├── ContractStats.js          # System statistics
│   └── LoginPage.js              # Wallet connection
├── context/
│   └── Web3Context.js            # Web3 and contract context
├── contracts/
│   └── CreditScoreContract.json  # Contract ABI and address
├── App.js                        # Main application component
├── index.js                      # Application entry point
└── index.css                     # Global styles and Tailwind
```

## Smart Contract Integration

The frontend integrates with the Credit Scoring Smart Contract through:

- **Web3.js**: For blockchain interaction
- **Contract ABI**: For function calls and event listening
- **MetaMask**: For wallet connection and transaction signing

## Styling

The application uses:
- **Tailwind CSS**: For utility-first styling
- **Lucide React**: For consistent iconography
- **Responsive Design**: Mobile-first approach
- **Modern UI**: Clean, professional interface

## Development

### Available Scripts

- `npm start`: Start development server
- `npm build`: Build for production
- `npm test`: Run tests
- `npm run eject`: Eject from Create React App

### Environment Variables

Create a `.env` file in the root directory:

```
REACT_APP_CONTRACT_ADDRESS=0xYourContractAddress
REACT_APP_NETWORK_ID=5777
```

## Troubleshooting

### Common Issues

1. **MetaMask Not Detected**
   - Ensure MetaMask is installed and enabled
   - Check if popup blockers are preventing connection

2. **Contract Not Found**
   - Verify contract address in `CreditScoreContract.json`
   - Ensure you're connected to the correct network

3. **Transaction Fails**
   - Check if you have sufficient ETH for gas fees
   - Verify contract is deployed and accessible

4. **Documents Not Loading**
   - Ensure contract methods are working correctly
   - Check browser console for error messages

## Security Considerations

- Always verify document authenticity before validation
- Use secure file upload practices
- Implement proper access controls for validator functions
- Regular security audits of smart contract interactions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Check the troubleshooting section
- Review smart contract documentation
- Open an issue on GitHub

---

**Note**: This is a development version. For production use, ensure proper security measures, testing, and deployment procedures are followed.

// Contract ABI - Generated from dashboard.sol
export const CONTRACT_ABI = [
  "function owner() view returns (address)",
  "function totalUsers() view returns (uint256)",
  "function MAX_REPAYMENT_SCORE() view returns (uint256)",
  "function MIN_REPAYMENT_SCORE() view returns (uint256)",
  "function MAX_CREDIT_SCORE() view returns (uint256)",
  "function MIN_CREDIT_SCORE() view returns (uint256)",
  "function MIN_REQUIRED_DOCS() view returns (uint256)",
  
  "function submitDocumentWithParams(bytes32 _docHash, uint8 _docType, uint256 _salary, uint256 _employmentYears, uint256 _repaymentHistoryScore, uint256 _currentBalance, uint256 _lastTotalUtilityBills, bool _documentAuthenticity)",
  "function validateDocument(address user, uint256 docIndex)",
  "function calculateCreditScore(address user)",
  
  "function getCreditScore(address user) view returns (uint256)",
  "function getUserDocuments(address user) view returns (bytes32[] memory docHashes, uint8[] memory docTypes, bool[] memory isValidatedArray, uint256[] memory submissionTimes)",
  "function getUserDocumentDetails(address user) view returns (uint256[] memory salaries, uint256[] memory employmentYears, uint256[] memory repaymentHistoryScores, uint256[] memory currentBalances, uint256[] memory lastTotalUtilityBills, bool[] memory documentAuthenticities, uint256[] memory validationTimes)",
  "function getUserDocumentCount(address user) view returns (uint256)",
  "function getTotalDocsCount(address user) view returns (uint256)",
  "function getValidatedDocsCount(address user) view returns (uint256)",
  "function getUserCreditInfo(address user) view returns (uint256 creditScore, uint256 validatedDocs, uint256 totalDocs, bool isActive)",
  
  "function deactivateUser(address user)",
  "function reactivateUser(address user)",
  
  "event DocumentSubmittedWithParams(address indexed user, bytes32 indexed docHash, uint256 docIndex, uint8 docType, uint256 salary, uint256 employmentYears, uint256 repaymentHistoryScore, bool documentAuthenticity)",
  "event DocumentValidated(address indexed user, uint256 indexed docIndex, bytes32 docHash)",
  "event CreditScoreUpdated(address indexed user, uint256 newScore, uint256 validatedDocs)"
];

// Document Types Enum
export const DOCUMENT_TYPES = {
  BANK_STATEMENT: 0,
  UTILITY_BILL: 1,
  SALARY_SLIP: 2
};

export const DOCUMENT_TYPE_NAMES = {
  0: "Bank Statement",
  1: "Utility Bill",
  2: "Salary Slip"
};

// Deployed contract address on Ganache
export const CONTRACT_ADDRESS = "0xE5baEAFCE03B420012E2F9c5c82155512880e0FA";


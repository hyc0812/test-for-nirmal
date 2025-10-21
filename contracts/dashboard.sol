// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

/**
 * @title Parameterized Document Validation Credit Scoring System
 * @dev A credit scoring system based on document validation with weighted parameters
 * @notice Users submit documents with parameters, validator approves them, credit score calculated using weighted formula
 */
contract dashboard {
    
    // ============ STRUCTS ============
    
    /**
     * @dev Structure to store document information with credit scoring parameters
     */
    struct Document {
        bytes32 docHash;                    // Hash of the submitted document
        DocumentType docType;               // Type of document (bank statement, utility bill, salary slip)
        uint256 salary;                     // User's salary/income amount
        uint256 employmentYears;            // Years of employment
        uint256 repaymentHistoryScore;      // Repayment history score (0-100)
        uint256 currentBalance;             // Current bank balance (for bank statements)
        uint256 lastTotalUtilityBills;      // Last total utility bills amount (for utility bills)
        bool documentAuthenticity;          // Whether document is verified/authentic
        bool isValidated;                   // Whether the document has been validated by owner
        uint256 submissionTime;             // When the document was submitted
        uint256 validationTime;             // When the document was validated (0 if not validated)
    }
    
    /**
     * @dev Structure to store user credit information
     */
    struct UserCredit {
        uint256 creditScore;                // Credit score based on validated documents and parameters
        uint256 validatedDocs;              // Number of validated documents
        bool isActive;                      // Whether the user account is active
    }
    
    // ============ STATE VARIABLES ============
    
    address public owner; // The validator/admin who can approve documents
    
    // Mapping from user address to their documents array
    mapping(address => Document[]) public userDocuments;
    
    // Mapping from user address to their credit information
    mapping(address => UserCredit) public userCredits;
    
    // Track total users in the system
    uint256 public totalUsers;
    
    // ============ ENUMS ============
    
    enum DocumentType {
        BANK_STATEMENT,    // Required document
        UTILITY_BILL,      // Required document
        SALARY_SLIP        // Optional document
    }
    
    // ============ CONSTANTS ============
    
    uint256 public constant MAX_REPAYMENT_SCORE = 100; // Maximum repayment history score
    uint256 public constant MIN_REPAYMENT_SCORE = 0;   // Minimum repayment history score
    uint256 public constant MAX_CREDIT_SCORE = 1000;   // Maximum credit score
    uint256 public constant MIN_CREDIT_SCORE = 600;    // Minimum credit score
    uint256 public constant MIN_REQUIRED_DOCS = 2;     // Minimum required documents (bank statement + utility bill)
    
    // ============ EVENTS ============
    
    /**
     * @dev Emitted when a user submits a document with parameters
     */
    event DocumentSubmittedWithParams(
        address indexed user, 
        bytes32 indexed docHash, 
        uint256 docIndex,
        DocumentType docType,
        uint256 salary,
        uint256 employmentYears,
        uint256 repaymentHistoryScore,
        bool documentAuthenticity
    );
    
    /**
     * @dev Emitted when the owner validates a document
     */
    event DocumentValidated(address indexed user, uint256 indexed docIndex, bytes32 docHash);
    
    /**
     * @dev Emitted when a user's credit score is updated
     */
    event CreditScoreUpdated(address indexed user, uint256 newScore, uint256 validatedDocs);
    
    // ============ MODIFIERS ============
    
    /**
     * @dev Modifier to ensure only the owner can call certain functions
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    /**
     * @dev Modifier to ensure user exists in the system
     */
    modifier userExists(address user) {
        require(userCredits[user].isActive || userDocuments[user].length > 0, "User not found");
        _;
    }
    
    /**
     * @dev Modifier to validate repayment history score range
     */
    modifier validRepaymentScore(uint256 score) {
        require(score >= MIN_REPAYMENT_SCORE && score <= MAX_REPAYMENT_SCORE, "Repayment score must be between 0-100");
        _;
    }
    
    /**
     * @dev Modifier to validate credit score range
     */
    modifier validCreditScore(uint256 score) {
        require(score >= MIN_CREDIT_SCORE && score <= MAX_CREDIT_SCORE, "Credit score must be between 600-1000");
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    /**
     * @dev Initialize the contract with the deployer as owner
     */
    constructor() {
        owner = msg.sender;
    }
    
    // ============ CORE FUNCTIONS ============
    
    /**
     * @dev Submit a document hash with credit scoring parameters
     * @param _docHash The hash of the document to be submitted
     * @param _docType Type of document (0=bank statement, 1=utility bill, 2=salary slip)
     * @param _salary User's salary/income amount
     * @param _employmentYears Years of employment
     * @param _repaymentHistoryScore Repayment history score (0-100)
     * @param _currentBalance Current bank balance (for bank statements)
     * @param _lastTotalUtilityBills Last total utility bills amount (for utility bills)
     * @param _documentAuthenticity Whether the document is verified/authentic
     * @notice Users must submit at least 2 documents: bank statement + utility bill. Salary slips are optional.
     */
    function submitDocumentWithParams(
        bytes32 _docHash,
        uint8 _docType,
        uint256 _salary,
        uint256 _employmentYears,
        uint256 _repaymentHistoryScore,
        uint256 _currentBalance,
        uint256 _lastTotalUtilityBills,
        bool _documentAuthenticity
    ) external validRepaymentScore(_repaymentHistoryScore) {
        require(_docHash != bytes32(0), "Document hash cannot be empty");
        require(_salary > 0, "Salary must be greater than 0");
        require(_docType <= 2, "Invalid document type");
        
        DocumentType docTypeEnum = DocumentType(_docType);
        
        // Create new document entry with parameters
        Document memory newDoc = Document({
            docHash: _docHash,
            docType: docTypeEnum,
            salary: _salary,
            employmentYears: _employmentYears,
            repaymentHistoryScore: _repaymentHistoryScore,
            currentBalance: _currentBalance,
            lastTotalUtilityBills: _lastTotalUtilityBills,
            documentAuthenticity: _documentAuthenticity,
            isValidated: false,
            submissionTime: block.timestamp,
            validationTime: 0
        });
        
        // Add document to user's documents array
        userDocuments[msg.sender].push(newDoc);
        
        // If this is the user's first document, initialize their credit record
        if (!userCredits[msg.sender].isActive) {
            userCredits[msg.sender] = UserCredit({
                creditScore: 0,
                validatedDocs: 0,
                isActive: true
            });
        totalUsers++;
        }
        
        uint256 docIndex = userDocuments[msg.sender].length - 1;
        emit DocumentSubmittedWithParams(
            msg.sender, 
            _docHash, 
            docIndex,
            docTypeEnum,
            _salary,
            _employmentYears,
            _repaymentHistoryScore,
            _documentAuthenticity
        );
    }
    
    /**
     * @dev Validate a document for a specific user (only owner)
     * @param user The address of the user whose document to validate
     * @param docIndex The index of the document to validate in the user's documents array
     * @notice Only the owner/validator can call this function to approve documents
     */
    function validateDocument(address user, uint256 docIndex) external onlyOwner {
        require(userDocuments[user].length > docIndex, "Document index out of bounds");
        require(!userDocuments[user][docIndex].isValidated, "Document already validated");
        
        // Mark document as validated
        userDocuments[user][docIndex].isValidated = true;
        userDocuments[user][docIndex].validationTime = block.timestamp;
        
        // Update user's validated document count
        userCredits[user].validatedDocs++;
        
        // Recalculate credit score based on all validated documents
        _calculateCreditScore(user);
        
        emit DocumentValidated(user, docIndex, userDocuments[user][docIndex].docHash);
    }
    
    /**
     * @dev Calculate and update credit score for a user (only owner)
     * @param user The address of the user whose credit score to calculate
     * @notice Credit score calculated using weighted formula based on validated documents
     * @notice Final score is capped between 600-1000
     */
    function calculateCreditScore(address user) external onlyOwner userExists(user) {
        _calculateCreditScore(user);
    }
    
    /**
     * @dev Internal function to calculate credit score using document-specific formula
     * @param user The address of the user whose credit score to calculate
     * @notice Document-specific scoring with percentage-based calculations:
     * @notice - Bank Statement: authenticity (100 fixed) + repaymentHistory% + currentBalance%
     * @notice - Utility Bill: lastTotalUtilityBills% + authenticity (100 fixed)
     * @notice - Salary Slip: income% + employmentYears% + authenticity (100 fixed)
     * @notice Only validated documents are included in the calculation
     * @notice Credit score is the TOTAL SUM of all validated documents, capped at maximum 1000
     * @notice User must have at least 2 validated documents (bank statement + utility bill)
     */
    function _calculateCreditScore(address user) internal {
        uint256 totalScore = 0;
        uint256 validatedCount = 0;
        bool hasBankStatement = false;
        bool hasUtilityBill = false;
        
        // Calculate score based on all validated documents
        for (uint256 i = 0; i < userDocuments[user].length; i++) {
            if (userDocuments[user][i].isValidated) {
                Document memory doc = userDocuments[user][i];
                
                // Track required document types
                if (doc.docType == DocumentType.BANK_STATEMENT) {
                    hasBankStatement = true;
                } else if (doc.docType == DocumentType.UTILITY_BILL) {
                    hasUtilityBill = true;
                }
                
                // Apply document-specific scoring formula with percentage calculations
                uint256 docScore = 0;
                
                if (doc.docType == DocumentType.BANK_STATEMENT) {
                    // Bank Statement: authenticity (100 fixed) + repaymentHistory% + currentBalance%
                    uint256 authenticityPoints = doc.documentAuthenticity ? 100 : 0;
                    uint256 repaymentPoints = doc.repaymentHistoryScore; // Already 0-100
                    uint256 balancePoints = _calculateBalancePercentage(doc.currentBalance);
                    
                    docScore = authenticityPoints + repaymentPoints + balancePoints;
                } else if (doc.docType == DocumentType.UTILITY_BILL) {
                    // Utility Bill: lastTotalUtilityBills% + authenticity (100 fixed)
                    uint256 authenticityPoints = doc.documentAuthenticity ? 100 : 0;
                    uint256 utilityPoints = _calculateUtilityPercentage(doc.lastTotalUtilityBills);
                    
                    docScore = authenticityPoints + utilityPoints;
                } else if (doc.docType == DocumentType.SALARY_SLIP) {
                    // Salary Slip: income% + employmentYears% + authenticity (100 fixed)
                    uint256 authenticityPoints = doc.documentAuthenticity ? 100 : 0;
                    uint256 incomePoints = _calculateIncomePercentage(doc.salary);
                    uint256 employmentPoints = _calculateEmploymentPercentage(doc.employmentYears);
                    
                    docScore = authenticityPoints + incomePoints + employmentPoints;
                }
                
                totalScore += docScore;
                validatedCount++;
            }
        }
        
        // Require at least 2 documents: bank statement + utility bill
        require(hasBankStatement && hasUtilityBill, "Must have validated bank statement and utility bill");
        require(validatedCount >= MIN_REQUIRED_DOCS, "Must have at least 2 validated documents");
        
        // Apply only maximum credit score limit (1000)
        if (totalScore > MAX_CREDIT_SCORE) {
            totalScore = MAX_CREDIT_SCORE;
        }
        
        // Update user's credit score and validated document count
        userCredits[user].creditScore = totalScore;
        userCredits[user].validatedDocs = validatedCount;
        
        emit CreditScoreUpdated(user, totalScore, validatedCount);
    }
    
    /**
     * @dev Calculate percentage-based points for current balance
     * @param balance The current bank balance
     * @return Points based on balance percentage (0-100 points)
     * @notice Uses flexible percentage calculation for any random score
     */
    function _calculateBalancePercentage(uint256 balance) internal pure returns (uint256) {
        // Cap at $100k for 100% score, then calculate percentage
        if (balance >= 100000) return 100;
        
        // Calculate percentage: (balance / 100000) * 100
        // This gives any number from 0-100 based on actual balance
        return (balance * 100) / 100000;
    }
    
    /**
     * @dev Calculate percentage-based points for utility bills
     * @param utilityAmount The total utility bills amount
     * @return Points based on utility amount percentage (0-100 points)
     * @notice Uses flexible percentage calculation for any random score
     */
    function _calculateUtilityPercentage(uint256 utilityAmount) internal pure returns (uint256) {
        // Cap at $2000 for 100% score, then calculate percentage
        if (utilityAmount >= 2000) return 100;
        
        // Calculate percentage: (utilityAmount / 2000) * 100
        // This gives any number from 0-100 based on actual utility amount
        return (utilityAmount * 100) / 2000;
    }
    
    /**
     * @dev Calculate percentage-based points for income
     * @param income The annual income amount
     * @return Points based on income percentage (0-100 points)
     * @notice Uses flexible percentage calculation for any random score
     */
    function _calculateIncomePercentage(uint256 income) internal pure returns (uint256) {
        // Cap at $100k for 100% score, then calculate percentage
        if (income >= 100000) return 100;
        
        // Calculate percentage: (income / 100000) * 100
        // This gives any number from 0-100 based on actual income
        return (income * 100) / 100000;
    }
    
    /**
     * @dev Calculate percentage-based points for employment years
     * @param employmentYears The years of employment
     * @return Points based on employment percentage (0-100 points)
     * @notice Uses flexible percentage calculation for any random score
     */
    function _calculateEmploymentPercentage(uint256 employmentYears) internal pure returns (uint256) {
        // Cap at 10 years for 100% score, then calculate percentage
        if (employmentYears >= 10) return 100;
        
        // Calculate percentage: (employmentYears / 10) * 100
        // This gives any number from 0-100 based on actual years
        return (employmentYears * 100) / 10;
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get the credit score of a user
     * @param user The address of the user
     * @return The user's current credit score (range: 0-1000)
     */
    function getCreditScore(address user) external view userExists(user) returns (uint256) {
        return userCredits[user].creditScore;
    }
    
    /**
     * @dev Get user credit information (simplified version)
     * @param user The address of the user
     * @return creditScore The user's current credit score
     * @return validatedDocs The number of validated documents
     * @return isActive Whether the user account is active
     */
    function getUserCredit(address user) external view returns (
        uint256 creditScore,
        uint256 validatedDocs,
        bool isActive
    ) {
        return (
            userCredits[user].creditScore,
            userCredits[user].validatedDocs,
            userCredits[user].isActive
        );
    }
    
    /**
     * @dev Get the number of validated documents for a user
     * @param user The address of the user
     * @return The number of validated documents
     */
    function getValidatedDocsCount(address user) external view userExists(user) returns (uint256) {
        return userCredits[user].validatedDocs;
    }
    
    /**
     * @dev Get the total number of documents submitted by a user
     * @param user The address of the user
     * @return The total number of documents submitted
     */
    function getTotalDocsCount(address user) external view userExists(user) returns (uint256) {
        return userDocuments[user].length;
    }
    
    /**
     * @dev Get basic information about a specific document
     * @param user The address of the user
     * @param docIndex The index of the document
     * @return docHash The hash of the document
     * @return docType The type of document (0=bank statement, 1=utility bill, 2=salary slip)
     * @return isValidated Whether the document is validated
     * @return submissionTime When the document was submitted
     */
    function getDocumentInfo(address user, uint256 docIndex) external view userExists(user) returns (
        bytes32 docHash,
        uint8 docType,
        bool isValidated,
        uint256 submissionTime
    ) {
        require(userDocuments[user].length > docIndex, "Document index out of bounds");
        
        Document memory doc = userDocuments[user][docIndex];
        return (
            doc.docHash,
            uint8(doc.docType),
            doc.isValidated,
            doc.submissionTime
        );
    }
    
    /**
     * @dev Get detailed parameters of a specific document
     * @param user The address of the user
     * @param docIndex The index of the document
     * @return salary The salary/income amount
     * @return employmentYears The years of employment
     * @return repaymentHistoryScore The repayment history score
     * @return currentBalance The current bank balance
     * @return lastTotalUtilityBills The last total utility bills amount
     * @return documentAuthenticity Whether the document is authentic
     * @return validationTime When the document was validated (0 if not validated)
     */
    function getDocumentDetails(address user, uint256 docIndex) external view userExists(user) returns (
        uint256 salary,
        uint256 employmentYears,
        uint256 repaymentHistoryScore,
        uint256 currentBalance,
        uint256 lastTotalUtilityBills,
        bool documentAuthenticity,
        uint256 validationTime
    ) {
        require(userDocuments[user].length > docIndex, "Document index out of bounds");
        
        Document memory doc = userDocuments[user][docIndex];
        return (
            doc.salary,
            doc.employmentYears,
            doc.repaymentHistoryScore,
            doc.currentBalance,
            doc.lastTotalUtilityBills,
            doc.documentAuthenticity,
            doc.validationTime
        );
    }
    
    /**
     * @dev Get comprehensive credit information for a user
     * @param user The address of the user
     * @return creditScore The user's current credit score (range: 0-1000)
     * @return validatedDocs The number of validated documents
     * @return totalDocs The total number of documents submitted
     * @return isActive Whether the user account is active
     */
    function getUserCreditInfo(address user) external view userExists(user) returns (
        uint256 creditScore,
        uint256 validatedDocs,
        uint256 totalDocs,
        bool isActive
    ) {
        return (
            userCredits[user].creditScore,
            userCredits[user].validatedDocs,
            userDocuments[user].length,
            userCredits[user].isActive
        );
    }
    
    /**
     * @dev Get basic document information for a user (simplified to avoid stack too deep)
     * @param user The address of the user
     * @return docHashes Array of document hashes
     * @return docTypes Array of document types
     * @return isValidatedArray Array of validation statuses
     * @return submissionTimes Array of submission times
     */
    function getUserDocuments(address user) external view returns (
        bytes32[] memory docHashes,
        uint8[] memory docTypes,
        bool[] memory isValidatedArray,
        uint256[] memory submissionTimes
    ) {
        uint256 docCount = userDocuments[user].length;
        
        docHashes = new bytes32[](docCount);
        docTypes = new uint8[](docCount);
        isValidatedArray = new bool[](docCount);
        submissionTimes = new uint256[](docCount);
        
        for (uint256 i = 0; i < docCount; i++) {
            docHashes[i] = userDocuments[user][i].docHash;
            docTypes[i] = uint8(userDocuments[user][i].docType);
            isValidatedArray[i] = userDocuments[user][i].isValidated;
            submissionTimes[i] = userDocuments[user][i].submissionTime;
        }
    }
    
    /**
     * @dev Get detailed document information for a user
     * @param user The address of the user
     * @return salaries Array of salary amounts
     * @return employmentYears Array of employment years
     * @return repaymentHistoryScores Array of repayment history scores
     * @return currentBalances Array of current balances
     * @return lastTotalUtilityBills Array of last total utility bills
     * @return documentAuthenticities Array of document authenticity flags
     * @return validationTimes Array of validation times
     */
    function getUserDocumentDetails(address user) external view returns (
        uint256[] memory salaries,
        uint256[] memory employmentYears,
        uint256[] memory repaymentHistoryScores,
        uint256[] memory currentBalances,
        uint256[] memory lastTotalUtilityBills,
        bool[] memory documentAuthenticities,
        uint256[] memory validationTimes
    ) {
        uint256 docCount = userDocuments[user].length;
        
        salaries = new uint256[](docCount);
        employmentYears = new uint256[](docCount);
        repaymentHistoryScores = new uint256[](docCount);
        currentBalances = new uint256[](docCount);
        lastTotalUtilityBills = new uint256[](docCount);
        documentAuthenticities = new bool[](docCount);
        validationTimes = new uint256[](docCount);
        
        for (uint256 i = 0; i < docCount; i++) {
            salaries[i] = userDocuments[user][i].salary;
            employmentYears[i] = userDocuments[user][i].employmentYears;
            repaymentHistoryScores[i] = userDocuments[user][i].repaymentHistoryScore;
            currentBalances[i] = userDocuments[user][i].currentBalance;
            lastTotalUtilityBills[i] = userDocuments[user][i].lastTotalUtilityBills;
            documentAuthenticities[i] = userDocuments[user][i].documentAuthenticity;
            validationTimes[i] = userDocuments[user][i].validationTime;
        }
    }
    
    /**
     * @dev Get document count for a user
     * @param user The address of the user
     * @return The number of documents submitted by the user
     */
    function getUserDocumentCount(address user) external view returns (uint256) {
        return userDocuments[user].length;
    }
    
    /**
     * @dev Get contract statistics
     * @return users The total number of users in the system
     * @return contractOwner The address of the contract owner/validator
     */
    function getContractStats() external view returns (uint256 users, address contractOwner) {
        return (totalUsers, owner);
    }
    
    /**
     * @dev Get all pending documents from all users (only owner)
     * @return users Array of user addresses who have pending documents
     * @return docIndexes Array of document indexes for each user
     * @return docHashes Array of document hashes
     * @return docTypes Array of document types
     * @return submissionTimes Array of submission times
     * @notice This function helps validators see all pending documents at once
     */
    function getAllPendingDocuments() external view onlyOwner returns (
        address[] memory users,
        uint256[] memory docIndexes,
        bytes32[] memory docHashes,
        uint8[] memory docTypes,
        uint256[] memory submissionTimes
    ) {
        // First pass: count total pending documents
        uint256 totalPending = 0;
        for (uint256 i = 0; i < totalUsers; i++) {
            // Note: This is a simplified approach. In a real implementation,
            // you'd need to maintain a list of all user addresses
            // For now, we'll return empty arrays as this requires more complex tracking
        }
        
        // Return empty arrays for now - this would need a more complex implementation
        // to track all users and their documents efficiently
        users = new address[](0);
        docIndexes = new uint256[](0);
        docHashes = new bytes32[](0);
        docTypes = new uint8[](0);
        submissionTimes = new uint256[](0);
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Deactivate a user account (only owner)
     * @param user The address of the user to deactivate
     */
    function deactivateUser(address user) external onlyOwner userExists(user) {
        userCredits[user].isActive = false;
    }
    
    /**
     * @dev Reactivate a user account (only owner)
     * @param user The address of the user to reactivate
     */
    function reactivateUser(address user) external onlyOwner userExists(user) {
        userCredits[user].isActive = true;
    }
}
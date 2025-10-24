# Credit Scoring Dashboard - System Architecture

## Overview
A blockchain-based credit scoring platform with automated CI/CD pipeline, Docker containerization, and GitHub Actions integration for seamless deployment and testing.

## System Architecture Diagram

```mermaid
graph TB
    %% GitHub Repository & CI/CD
    subgraph "GitHub Repository & CI/CD"
        GH[GitHub Repository]
        GA[GitHub Actions]
        CR[Container Registry]
        WF[Workflow Triggers]
    end

    %% Development Environment
    subgraph "Development Environment"
        DEV[Local Development]
        GANACHE[Ganache Local Blockchain]
        TRUFFLE[Truffle Framework]
        REACT_DEV[React Dev Server]
        DOCKER_COMPOSE[Docker Compose]
    end

    %% CI/CD Pipeline
    subgraph "CI/CD Pipeline"
        TRIGGER[Code Push/PR]
        TEST[Automated Testing]
        BUILD[Smart Contract Compilation]
        DOCKER_BUILD[Docker Image Build]
        DEPLOY[Automated Deployment]
        HEALTH[Health Checks]
    end

    %% Frontend Application
    subgraph "Frontend Application (React)"
        UI[User Interface]
        UD[UserDashboard.jsx]
        VD[ValidatorDashboard.jsx]
        WC[WalletConnect.jsx]
        W3C[Web3Context.jsx]
        COMP[UI Components]
        CONTRACT_INT[Contract Integration]
    end

    %% Blockchain Layer
    subgraph "Blockchain Layer"
        ETH[Ethereum Network]
        SC[Smart Contract - dashboard.sol]
        DOC_STORE[Document Storage]
        CREDIT_CALC[Credit Score Calculation]
        EVENTS[Blockchain Events]
    end

    %% Smart Contract Components
    subgraph "Smart Contract Components"
        DOC_MGMT[Document Management]
        USER_CREDIT[User Credit System]
        VALIDATION[Validation Logic]
        SCORING[Credit Score Algorithm]
    end

    %% Container Infrastructure
    subgraph "Container Infrastructure"
        DOCKER[Docker Containers]
        NGINX[Nginx Web Server]
        NODE[Node.js Runtime]
        BUILD_STAGE[Build Stage]
        PROD_STAGE[Production Stage]
    end

    %% External Services
    subgraph "External Services"
        METAMASK[MetaMask Wallet]
        IPFS[IPFS/File Storage]
        TRUFFLE_EXT[Truffle Framework]
        TESTNET[Sepolia Testnet]
        REGISTRY[Container Registry]
    end

    %% User Interactions
    subgraph "User Interactions"
        USER[End Users]
        VALIDATOR[Validators]
        ADMIN[System Admin]
    end

    %% Data Flow
    GH --> GA
    GA --> TRIGGER
    TRIGGER --> TEST
    TEST --> BUILD
    BUILD --> DOCKER_BUILD
    DOCKER_BUILD --> DEPLOY
    DEPLOY --> HEALTH

    USER --> UI
    VALIDATOR --> UI
    ADMIN --> UI

    UI --> UD
    UI --> VD
    UI --> WC
    UD --> W3C
    VD --> W3C
    WC --> W3C
    W3C --> CONTRACT_INT
    CONTRACT_INT --> SC

    SC --> DOC_MGMT
    SC --> USER_CREDIT
    SC --> VALIDATION
    SC --> SCORING

    DOC_MGMT --> DOC_STORE
    USER_CREDIT --> CREDIT_CALC
    VALIDATION --> CREDIT_CALC
    SCORING --> CREDIT_CALC

    CONTRACT_INT --> METAMASK
    SC --> ETH
    ETH --> TESTNET

    DOCKER_BUILD --> DOCKER
    DOCKER --> NGINX
    DOCKER --> NODE
    DOCKER --> BUILD_STAGE
    DOCKER --> PROD_STAGE

    DOCKER_BUILD --> REGISTRY
    REGISTRY --> DEPLOY

    DEV --> GANACHE
    DEV --> TRUFFLE
    DEV --> REACT_DEV
    DEV --> DOCKER_COMPOSE

    %% Styling
    classDef githubLayer fill:#e1f5fe
    classDef devLayer fill:#f3e5f5
    classDef cicdLayer fill:#e8f5e8
    classDef frontendLayer fill:#fff3e0
    classDef blockchainLayer fill:#fce4ec
    classDef contractLayer fill:#f1f8e9
    classDef containerLayer fill:#e0f2f1
    classDef externalLayer fill:#fef7e0
    classDef userLayer fill:#f3e5f5

    class GH,GA,CR,WF githubLayer
    class DEV,GANACHE,TRUFFLE,REACT_DEV,DOCKER_COMPOSE devLayer
    class TRIGGER,TEST,BUILD,DOCKER_BUILD,DEPLOY,HEALTH cicdLayer
    class UI,UD,VD,WC,W3C,COMP,CONTRACT_INT frontendLayer
    class ETH,SC,DOC_STORE,CREDIT_CALC,EVENTS blockchainLayer
    class DOC_MGMT,USER_CREDIT,VALIDATION,SCORING contractLayer
    class DOCKER,NGINX,NODE,BUILD_STAGE,PROD_STAGE containerLayer
    class METAMASK,IPFS,TRUFFLE_EXT,TESTNET,REGISTRY externalLayer
    class USER,VALIDATOR,ADMIN userLayer
```

## Component Architecture

```mermaid
graph LR
    %% User Interactions
    subgraph "User Interactions"
        UI1[Document Submission]
        UI2[Credit Score Viewing]
        UI3[Document Validation]
        UI4[User Management]
    end

    %% Frontend Components
    subgraph "React Frontend"
        FC1[DocumentSubmission Component]
        FC2[CreditScoreDisplay Component]
        FC3[DocumentHistory Component]
        FC4[PendingDocuments Component]
        FC5[UserManagement Component]
        FC6[ContractStats Component]
    end

    %% Web3 Integration
    subgraph "Web3 Integration"
        W1[Web3Context Provider]
        W2[Contract ABI]
        W3[Ethers.js Library]
        W4[MetaMask Integration]
    end

    %% Smart Contract Functions
    subgraph "Smart Contract Functions"
        SF1[submitDocumentWithParams]
        SF2[validateDocument]
        SF3[calculateCreditScore]
        SF4[getCreditScore]
        SF5[getUserCreditInfo]
        SF6[deactivateUser]
    end

    %% Data Structures
    subgraph "Data Structures"
        DS1[Document Struct]
        DS2[UserCredit Struct]
        DS3[DocumentType Enum]
        DS4[Events & Logs]
    end

    %% Credit Scoring Algorithm
    subgraph "Credit Scoring Algorithm"
        CS1[Bank Statement Scoring]
        CS2[Utility Bill Scoring]
        CS3[Salary Slip Scoring]
        CS4[Weighted Calculation]
        CS5[Score Capping 600-1000]
    end

    %% CI/CD Integration
    subgraph "CI/CD Integration"
        CI1[Automated Testing]
        CI2[Docker Build]
        CI3[Smart Contract Deployment]
        CI4[Frontend Deployment]
        CI5[Health Monitoring]
    end

    %% Connections
    UI1 --> FC1
    UI2 --> FC2
    UI3 --> FC4
    UI4 --> FC5
    
    FC1 --> W1
    FC2 --> W1
    FC3 --> W1
    FC4 --> W1
    FC5 --> W1
    FC6 --> W1
    
    W1 --> W2
    W1 --> W3
    W1 --> W4
    
    W2 --> SF1
    W2 --> SF2
    W2 --> SF3
    W2 --> SF4
    W2 --> SF5
    W2 --> SF6
    
    SF1 --> DS1
    SF2 --> DS2
    SF3 --> CS1
    SF3 --> CS2
    SF3 --> CS3
    SF3 --> CS4
    SF3 --> CS5
    
    DS1 --> DS3
    DS2 --> DS4

    CI1 --> SF1
    CI2 --> FC1
    CI3 --> SF1
    CI4 --> FC1
    CI5 --> SF1

    %% Styling
    classDef userInt fill:#e3f2fd
    classDef frontendComp fill:#f1f8e9
    classDef web3Int fill:#fff8e1
    classDef contractFunc fill:#fce4ec
    classDef dataStruct fill:#e8f5e8
    classDef scoring fill:#fff3e0
    classDef cicdInt fill:#e8f5e8

    class UI1,UI2,UI3,UI4 userInt
    class FC1,FC2,FC3,FC4,FC5,FC6 frontendComp
    class W1,W2,W3,W4 web3Int
    class SF1,SF2,SF3,SF4,SF5,SF6 contractFunc
    class DS1,DS2,DS3,DS4 dataStruct
    class CS1,CS2,CS3,CS4,CS5 scoring
    class CI1,CI2,CI3,CI4,CI5 cicdInt
```

## CI/CD Pipeline Flow

```mermaid
sequenceDiagram
    participant DEV as Developer
    participant GH as GitHub
    participant GA as GitHub Actions
    participant TEST as Testing Environment
    participant BUILD as Build Process
    participant REG as Container Registry
    participant DEPLOY as Deployment
    participant PROD as Production

    DEV->>GH: Push Code/PR
    GH->>GA: Trigger Workflow
    GA->>TEST: Run Automated Tests
    TEST->>GA: Test Results
    GA->>BUILD: Compile Smart Contracts
    BUILD->>GA: Contract Artifacts
    GA->>BUILD: Build Docker Images
    BUILD->>REG: Push to Registry
    REG->>DEPLOY: Deploy to Staging
    DEPLOY->>GA: Health Check
    GA->>PROD: Deploy to Production
    PROD->>GA: Deployment Success
    GA->>GH: Update Status
```

## Document Flow Architecture

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant W as Web3
    participant C as Smart Contract
    participant V as Validator
    participant B as Blockchain
    participant CI as CI/CD

    U->>F: Submit Document
    F->>W: Connect to Wallet
    W->>U: MetaMask Prompt
    U->>W: Sign Transaction
    W->>C: submitDocumentWithParams()
    C->>B: Store Document Hash
    C->>B: Emit DocumentSubmitted Event
    B->>F: Event Notification
    F->>U: Document Submitted Successfully

    V->>F: Access Validator Dashboard
    F->>C: getPendingDocuments()
    C->>F: Return Pending Documents
    F->>V: Display Pending Documents
    V->>F: Validate Document
    F->>C: validateDocument()
    C->>B: Update Document Status
    C->>C: calculateCreditScore()
    C->>B: Emit CreditScoreUpdated Event
    B->>F: Event Notification
    F->>U: Credit Score Updated

    CI->>C: Automated Deployment
    CI->>F: Frontend Deployment
    CI->>B: Contract Deployment
```

## Technology Stack

### Frontend Technologies
- **React 18.2.0** - Main UI framework
- **Radix UI** - Component library for accessible UI
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **Ethers.js 6.15.0** - Ethereum library
- **Web3.js 4.3.0** - Blockchain interaction

### Blockchain Technologies
- **Solidity 0.8.10** - Smart contract language
- **Truffle 5.11.5** - Development framework
- **Ganache** - Local blockchain
- **Sepolia Testnet** - Ethereum test network
- **MetaMask** - Wallet integration

### CI/CD & Infrastructure
- **GitHub Actions** - CI/CD pipeline
- **Docker** - Containerization
- **Nginx** - Web server
- **Node.js 18** - Runtime environment
- **Container Registry** - Image storage
- **Truffle HDWallet Provider** - Wallet provider

### Key Features
1. **Document Management**: Upload and validate documents
2. **Credit Scoring**: Automated calculation based on document parameters
3. **User Management**: Admin controls for user accounts
4. **Real-time Updates**: Event-driven UI updates
5. **Responsive Design**: Mobile-first approach
6. **Security**: Smart contract-based validation
7. **Automated Deployment**: CI/CD pipeline with GitHub Actions
8. **Containerization**: Docker-based deployment

## Document Types
- **Bank Statement** (Required) - authenticity + repayment history + balance %
- **Utility Bill** (Required) - authenticity + utility amount %
- **Salary Slip** (Optional) - authenticity + income % + employment %

## Credit Scoring Algorithm
- Weighted calculation based on document parameters
- Score range: 600-1000 points
- Document-specific scoring formulas
- Percentage-based calculations for income, balance, utility bills

## CI/CD Workflow
1. **Code Push** → GitHub Actions trigger
2. **Automated Testing** → Smart contracts + frontend tests
3. **Smart Contract Compilation** → Truffle compile
4. **Docker Image Building** → Multi-stage build
5. **Container Registry Push** → Store images
6. **Automated Deployment** → Staging/Production
7. **Health Checks** → Monitor deployment success

## Deployment Environments
- **Development**: Local Docker Compose, Ganache, Truffle, React dev server
- **Staging**: Automated deployment from CI/CD, test environment
- **Production**: Docker containers, Nginx, React build, Ethereum testnet
- **Smart Contract Deployment**: Automated via Truffle migrate in CI/CD

## Security Considerations
- Smart contract security audits
- Automated testing for vulnerabilities
- Secure container image scanning
- Environment-specific configurations
- Access control for validator functions



# Credit Scoring Dashboard - Setup Manual

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Smart Contract Setup](#smart-contract-setup)
4. [Frontend Setup](#frontend-setup)
5. [Docker Setup](#docker-setup)
6. [GitHub Actions CI/CD](#github-actions-cicd)
7. [AWS Services Setup](#aws-services-setup)
8. [Configuration](#configuration)
9. [Running the Application](#running-the-application)
10. [Troubleshooting](#troubleshooting)
11. [Production Deployment](#production-deployment)

## Prerequisites

### Required Software
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (v8 or higher) - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)
- **Docker** (v20 or higher) - [Download](https://www.docker.com/)
- **MetaMask** browser extension - [Download](https://metamask.io/)

### Blockchain Requirements
- **Ethereum wallet** with Sepolia testnet ETH
- **Infura account** - [Sign up](https://infura.io/) for RPC endpoint
- **Sepolia testnet ETH** - Get from [Sepolia Faucet](https://sepoliafaucet.com/)

### AWS Services
- **AWS Account** with appropriate permissions
- **AWS Cloud9** - Cloud development environment
- **Amazon ECR** - Container registry
- **Amazon ECS** - Container orchestration service
- **AWS CLI** - [Install](https://aws.amazon.com/cli/)

### CI/CD Requirements
- **GitHub Account** with repository access
- **GitHub Actions** enabled for the repository
- **AWS IAM** roles for GitHub Actions

## Environment Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/CreditscoringDashboard.git
cd CreditscoringDashboard
```

### 2. Install Root Dependencies
```bash
npm install
```

### 3. Install Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

### 4. Create Environment Files

#### Root Directory `.env` file:
```bash
# Create .env file in root directory
touch .env
```

Add the following content to `.env`:
```env
# Truffle Configuration
MNEMONIC="your twelve word mnemonic phrase here"
PROJECT_ID="your_infura_project_id_here"

# Network Configuration
NETWORK_ID=5777
HOST=127.0.0.1
PORT=7545

# Contract Configuration
CONTRACT_ADDRESS=""
```

#### Frontend `.env` file:
```bash
# Create .env file in frontend directory
touch frontend/.env
```

Add the following content to `frontend/.env`:
```env
# React App Configuration
REACT_APP_CONTRACT_ADDRESS=""
REACT_APP_NETWORK_ID=5777
REACT_APP_CHAIN_ID=0x1691

# Development Configuration
REACT_APP_ENVIRONMENT=development
REACT_APP_API_URL=http://localhost:3000
```

## Smart Contract Setup

### 1. Install Truffle Globally
```bash
npm install -g truffle
```

### 2. Configure Sepolia Testnet

#### Get Sepolia ETH:
1. Visit [Sepolia Faucet](https://sepoliafaucet.com/)
2. Enter your wallet address
3. Request testnet ETH (you'll need this for gas fees)

#### Configure Infura:
1. Sign up at [Infura](https://infura.io/)
2. Create a new project
3. Get your Project ID
4. Update your `.env` file with the Project ID

### 3. Compile Smart Contracts
```bash
truffle compile
```

### 4. Deploy Smart Contracts to Sepolia

#### Deploy to Sepolia Testnet:
```bash
truffle migrate --network sepolia
```

#### Verify Contract on Etherscan:
```bash
truffle run verify dashboard --network sepolia
```

### 5. Get Contract Address
After deployment, copy the contract address from the migration output and update your `.env` files:

```bash
# Update root .env
CONTRACT_ADDRESS="0xYourDeployedContractAddress"

# Update frontend/.env
REACT_APP_CONTRACT_ADDRESS="0xYourDeployedContractAddress"
```

### 6. Run Smart Contract Tests
```bash
truffle test
```

## Frontend Setup

### 1. Navigate to Frontend Directory
```bash
cd frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Contract Integration

#### Update `src/contract.js`:
```javascript
// Update with your deployed contract address
const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;
const CONTRACT_ABI = [
  // Your contract ABI from build/contracts/dashboard.json
];
```

### 4. Start Development Server
```bash
npm start
```

The application will be available at `http://localhost:3000`

## GitHub Actions CI/CD

### 1. Create GitHub Actions Workflow

Create `.github/workflows/ci-cd.yml`:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  AWS_REGION: us-east-1
  ECR_REPOSITORY: credit-scoring-dashboard
  ECS_SERVICE: credit-scoring-dashboard-service
  ECS_CLUSTER: credit-scoring-cluster
  ECS_TASK_DEFINITION: credit-scoring-dashboard-task

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: |
          npm install
          cd frontend && npm install

      - name: Run smart contract tests
        run: npm run test

      - name: Run frontend tests
        run: |
          cd frontend
          npm run test -- --coverage --watchAll=false

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build, tag, and push image to Amazon ECR
        id: build-image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          # Build and push Docker image
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          echo "image=$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG" >> $GITHUB_OUTPUT

      - name: Deploy to Amazon ECS
        uses: aws-actions/amazon-ecs-deploy-task-definition@v1
        with:
          task-definition: .aws/task-definition.json
          service: ${{ env.ECS_SERVICE }}
          cluster: ${{ env.ECS_CLUSTER }}
          wait-for-service-stability: true

  deploy-smart-contract:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm install

      - name: Deploy smart contract to Sepolia
        env:
          MNEMONIC: ${{ secrets.MNEMONIC }}
          INFURA_PROJECT_ID: ${{ secrets.INFURA_PROJECT_ID }}
        run: |
          npm run migrate:sepolia
```

### 2. Create ECS Task Definition

Create `.aws/task-definition.json`:

```json
{
  "family": "credit-scoring-dashboard-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::ACCOUNT_ID:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "credit-scoring-dashboard",
      "image": "ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/credit-scoring-dashboard:latest",
      "portMappings": [
        {
          "containerPort": 80,
          "protocol": "tcp"
        }
      ],
      "essential": true,
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/credit-scoring-dashboard",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "environment": [
        {
          "name": "REACT_APP_CONTRACT_ADDRESS",
          "value": "YOUR_CONTRACT_ADDRESS"
        },
        {
          "name": "REACT_APP_NETWORK_ID",
          "value": "11155111"
        }
      ]
    }
  ]
}
```

### 3. Create ECS Service Configuration

Create `.aws/ecs-service.json`:

```json
{
  "serviceName": "credit-scoring-dashboard-service",
  "cluster": "credit-scoring-cluster",
  "taskDefinition": "credit-scoring-dashboard-task",
  "desiredCount": 1,
  "launchType": "FARGATE",
  "networkConfiguration": {
    "awsvpcConfiguration": {
      "subnets": ["subnet-12345", "subnet-67890"],
      "securityGroups": ["sg-12345"],
      "assignPublicIp": "ENABLED"
    }
  },
  "loadBalancers": [
    {
      "targetGroupArn": "arn:aws:elasticloadbalancing:us-east-1:ACCOUNT_ID:targetgroup/credit-scoring-tg/1234567890123456",
      "containerName": "credit-scoring-dashboard",
      "containerPort": 80
    }
  ]
}
```

## AWS Services Setup

### 1. AWS Cloud9 Setup

#### Create Cloud9 Environment:
```bash
# In AWS Console, create a new Cloud9 environment
# Name: credit-scoring-dashboard-dev
# Instance type: t3.small
# Platform: Ubuntu Server 18.04 LTS
```

#### Configure Cloud9 Environment:
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Docker
sudo apt-get update
sudo apt-get install -y docker.io
sudo usermod -aG docker $USER

# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure AWS CLI
aws configure
```

### 2. Amazon ECR Setup

#### Create ECR Repository:
```bash
# Create ECR repository
aws ecr create-repository \
    --repository-name credit-scoring-dashboard \
    --region us-east-1

# Get login token
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
```

#### Build and Push Image:
```bash
# Build Docker image
docker build -t credit-scoring-dashboard .

# Tag image for ECR
docker tag credit-scoring-dashboard:latest ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/credit-scoring-dashboard:latest

# Push to ECR
docker push ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/credit-scoring-dashboard:latest
```

### 3. Amazon ECS Setup

#### Create ECS Cluster:
```bash
# Create ECS cluster
aws ecs create-cluster \
    --cluster-name credit-scoring-cluster \
    --capacity-providers FARGATE \
    --default-capacity-provider-strategy capacityProvider=FARGATE,weight=1
```

#### Create Task Definition:
```bash
# Register task definition
aws ecs register-task-definition \
    --cli-input-json file://.aws/task-definition.json
```

#### Create ECS Service:
```bash
# Create ECS service
aws ecs create-service \
    --cluster credit-scoring-cluster \
    --service-name credit-scoring-dashboard-service \
    --task-definition credit-scoring-dashboard-task \
    --desired-count 1 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[subnet-12345],securityGroups=[sg-12345],assignPublicIp=ENABLED}"
```

### 4. Application Load Balancer Setup

#### Create Target Group:
```bash
# Create target group
aws elbv2 create-target-group \
    --name credit-scoring-tg \
    --protocol HTTP \
    --port 80 \
    --vpc-id vpc-12345 \
    --target-type ip \
    --health-check-path / \
    --health-check-interval-seconds 30 \
    --health-check-timeout-seconds 5 \
    --healthy-threshold-count 2 \
    --unhealthy-threshold-count 3
```

#### Create Load Balancer:
```bash
# Create application load balancer
aws elbv2 create-load-balancer \
    --name credit-scoring-alb \
    --subnets subnet-12345 subnet-67890 \
    --security-groups sg-12345
```

## Docker Setup

### 1. Create Docker Compose File
Create `docker-compose.yml` in the root directory:

```yaml
version: '3.8'

services:
  # Frontend Service
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:80"
    environment:
      - REACT_APP_CONTRACT_ADDRESS=${CONTRACT_ADDRESS}
      - REACT_APP_NETWORK_ID=${NETWORK_ID}
    depends_on:
      - ganache

  # Ganache Service
  ganache:
    image: trufflesuite/ganache-cli:latest
    command: ganache-cli --host 0.0.0.0 --port 7545 --networkId 5777
    ports:
      - "7545:7545"

  # Truffle Service
  truffle:
    build:
      context: .
      dockerfile: Dockerfile.truffle
    volumes:
      - .:/app
    working_dir: /app
    command: truffle migrate --reset
    depends_on:
      - ganache
```

### 2. Create Truffle Dockerfile
Create `Dockerfile.truffle`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install Truffle
RUN npm install -g truffle

# Copy package files
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 7545

CMD ["truffle", "migrate", "--reset"]
```

### 3. Build and Run with Docker
```bash
# Build and start all services
docker-compose up --build

# Run in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Configuration

### 1. MetaMask Configuration

#### Add Sepolia Testnet:
- Network Name: `Sepolia Testnet`
- RPC URL: `https://ethereum-sepolia.publicnode.com`
- Chain ID: `11155111`
- Currency Symbol: `ETH`

#### Alternative RPC URLs:
- Infura: `https://sepolia.infura.io/v3/YOUR_PROJECT_ID`
- Alchemy: `https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY`

### 2. GitHub Secrets Configuration

#### Required Secrets:
Go to your GitHub repository → Settings → Secrets and variables → Actions

Add the following secrets:

```bash
# AWS Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key

# Blockchain Configuration
MNEMONIC=your_twelve_word_mnemonic_phrase
INFURA_PROJECT_ID=your_infura_project_id

# Contract Configuration
CONTRACT_ADDRESS=your_deployed_contract_address
```

#### Create AWS IAM User:
1. Go to AWS IAM Console
2. Create new user: `github-actions-user`
3. Attach policies:
   - `AmazonEC2ContainerRegistryFullAccess`
   - `AmazonECS_FullAccess`
   - `AmazonElasticLoadBalancingFullAccess`
4. Create access keys
5. Add keys to GitHub secrets

#### Fix ECR Permission Issues:
If you get ECR authorization errors, follow these steps:

1. **Check for Explicit Deny Policies:**
```bash
# Check attached policies
aws iam list-attached-user-policies --user-name github-actions-user
aws iam list-user-policies --user-name github-actions-user

# Check inline policies
aws iam get-user-policy --user-name github-actions-user --policy-name POLICY_NAME
```

2. **Create Custom ECR Policy:**
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ecr:GetAuthorizationToken",
                "ecr:BatchCheckLayerAvailability",
                "ecr:GetDownloadUrlForLayer",
                "ecr:BatchGetImage"
            ],
            "Resource": "*"
        }
    ]
}
```

3. **Attach ECR Policy:**
```bash
# Create policy
aws iam create-policy \
    --policy-name ECRFullAccess \
    --policy-document file://ecr-policy.json

# Attach to user
aws iam attach-user-policy \
    --user-name github-actions-user \
    --policy-arn arn:aws:iam::ACCOUNT_ID:policy/ECRFullAccess
```

4. **Alternative: Use IAM Role Instead of User:**
```bash
# Create IAM role for GitHub Actions
aws iam create-role \
    --role-name GitHubActionsRole \
    --assume-role-policy-document file://trust-policy.json

# Attach policies to role
aws iam attach-role-policy \
    --role-name GitHubActionsRole \
    --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryFullAccess
```

### 2. Environment Variables

#### Required Variables:
```env
# Root .env
MNEMONIC="your mnemonic phrase"
CONTRACT_ADDRESS="deployed contract address"

# Frontend .env
REACT_APP_CONTRACT_ADDRESS="deployed contract address"
REACT_APP_NETWORK_ID="network id"
```

### 3. Network Configuration

#### Local Development:
- Host: `127.0.0.1`
- Port: `7545`
- Network ID: `5777`
- Chain ID: `0x1691`

#### Sepolia Testnet:
- RPC URL: `https://ethereum-sepolia.publicnode.com`
- Network ID: `11155111`
- Chain ID: `0xaa36a7`

## Running the Application

### 1. Development Mode (AWS Cloud9)

#### In Cloud9 Environment:
```bash
# Clone repository
git clone https://github.com/yourusername/CreditscoringDashboard.git
cd CreditscoringDashboard

# Install dependencies
npm install
cd frontend && npm install && cd ..

# Deploy smart contract to Sepolia
truffle migrate --network sepolia

# Start frontend development server
cd frontend
npm start
```

#### Access Application:
- Frontend: `https://your-cloud9-url.amazonaws.com:3000`
- Contract: Deployed on Sepolia testnet

### 2. Production Mode (AWS ECS)

#### Deploy via GitHub Actions:
1. Push code to `main` branch
2. GitHub Actions will automatically:
   - Run tests
   - Build Docker image
   - Push to ECR
   - Deploy to ECS

#### Manual ECS Deployment:
```bash
# Build and push to ECR
docker build -t credit-scoring-dashboard .
docker tag credit-scoring-dashboard:latest ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/credit-scoring-dashboard:latest
docker push ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/credit-scoring-dashboard:latest

# Update ECS service
aws ecs update-service \
    --cluster credit-scoring-cluster \
    --service credit-scoring-dashboard-service \
    --force-new-deployment
```

#### Access Application:
- Production URL: `http://your-alb-dns-name.us-east-1.elb.amazonaws.com`

### 3. Local Development Mode

#### Build Frontend:
```bash
cd frontend
npm run build
```

#### Build Docker Image:
```bash
docker build -t credit-scoring-dashboard .
```

#### Run Docker Container:
```bash
docker run -p 3000:80 credit-scoring-dashboard
```

#### Access Application:
- Frontend: `http://localhost:3000`
- Contract: Deployed on Sepolia testnet

## Troubleshooting

### Common Issues

#### 1. ECR Authorization Error
**Error:** `User: arn:aws:sts::***:assumed-role/voclabs/user3792140=Nirmal_Jagdishkumar_Patel is not authorized to perform: ecr:GetAuthorizationToken`

**Solution:**
```bash
# Check current user/role
aws sts get-caller-identity

# Check attached policies
aws iam list-attached-user-policies --user-name YOUR_USERNAME
aws iam list-user-policies --user-name YOUR_USERNAME

# Check for explicit deny policies
aws iam get-user-policy --user-name YOUR_USERNAME --policy-name POLICY_NAME

# Remove deny policies if found
aws iam delete-user-policy --user-name YOUR_USERNAME --policy-name DENY_POLICY_NAME

# Create and attach ECR policy
aws iam create-policy \
    --policy-name ECRFullAccess \
    --policy-document '{
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": [
                    "ecr:GetAuthorizationToken",
                    "ecr:BatchCheckLayerAvailability",
                    "ecr:GetDownloadUrlForLayer",
                    "ecr:BatchGetImage",
                    "ecr:PutImage",
                    "ecr:InitiateLayerUpload",
                    "ecr:UploadLayerPart",
                    "ecr:CompleteLayerUpload"
                ],
                "Resource": "*"
            }
        ]
    }'

# Attach policy to user
aws iam attach-user-policy \
    --user-name YOUR_USERNAME \
    --policy-arn arn:aws:iam::ACCOUNT_ID:policy/ECRFullAccess
```

#### 2. MetaMask Connection Issues
```bash
# Check if MetaMask is installed
# Ensure correct network is selected
# Check if account is unlocked
```

#### 3. Contract Not Found
```bash
# Verify contract address in .env files
# Check if contract is deployed
# Ensure correct network is selected
```

#### 4. Transaction Failures
```bash
# Check if you have sufficient ETH for gas
# Verify contract is deployed and accessible
# Check network connection
```

#### 5. Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear npm cache
npm cache clean --force
```

#### 6. Docker Issues
```bash
# Rebuild Docker images
docker-compose down
docker-compose up --build

# Clear Docker cache
docker system prune -a
```

#### 7. GitHub Actions ECR Issues
```bash
# Check GitHub secrets are set correctly
# Verify AWS credentials in GitHub secrets
# Ensure ECR repository exists
aws ecr describe-repositories --repository-names credit-scoring-dashboard

# Test ECR login locally
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
```

### Debug Commands

#### Check Smart Contract Deployment:
```bash
truffle console
> dashboard.deployed().then(instance => console.log(instance.address))
```

#### Check Network Connection:
```bash
truffle console
> web3.eth.getAccounts().then(accounts => console.log(accounts))
```

#### Check Frontend Build:
```bash
cd frontend
npm run build
# Check if build directory is created successfully
```

### Fix ECR Permission Error

#### Step 1: Check Current Identity
```bash
# Check who you are
aws sts get-caller-identity

# Check your current role/user
aws iam get-user
```

#### Step 2: Check for Deny Policies
```bash
# List all policies attached to your user
aws iam list-attached-user-policies --user-name YOUR_USERNAME

# List inline policies
aws iam list-user-policies --user-name YOUR_USERNAME

# Check specific policy content
aws iam get-user-policy --user-name YOUR_USERNAME --policy-name POLICY_NAME
```

#### Step 3: Remove Deny Policies
```bash
# If you find a deny policy, remove it
aws iam delete-user-policy --user-name YOUR_USERNAME --policy-name DENY_POLICY_NAME
```

#### Step 4: Create ECR Policy
```bash
# Create ECR policy file
cat > ecr-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ecr:GetAuthorizationToken",
                "ecr:BatchCheckLayerAvailability",
                "ecr:GetDownloadUrlForLayer",
                "ecr:BatchGetImage",
                "ecr:PutImage",
                "ecr:InitiateLayerUpload",
                "ecr:UploadLayerPart",
                "ecr:CompleteLayerUpload"
            ],
            "Resource": "*"
        }
    ]
}
EOF

# Create policy
aws iam create-policy \
    --policy-name ECRFullAccess \
    --policy-document file://ecr-policy.json

# Attach to user
aws iam attach-user-policy \
    --user-name YOUR_USERNAME \
    --policy-arn arn:aws:iam::ACCOUNT_ID:policy/ECRFullAccess
```

#### Step 5: Test ECR Access
```bash
# Test ECR login
aws ecr get-login-password --region us-east-1

# Test Docker login
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
```

#### Step 6: Alternative - Use IAM Role
If user-based permissions don't work, use IAM role:

```bash
# Create trust policy
cat > trust-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::ACCOUNT_ID:user/YOUR_USERNAME"
            },
            "Action": "sts:AssumeRole"
        }
    ]
}
EOF

# Create role
aws iam create-role \
    --role-name GitHubActionsRole \
    --assume-role-policy-document file://trust-policy.json

# Attach ECR policy to role
aws iam attach-role-policy \
    --role-name GitHubActionsRole \
    --policy-arn arn:aws:iam::ACCOUNT_ID:policy/ECRFullAccess

# Assume role
aws sts assume-role \
    --role-arn arn:aws:iam::ACCOUNT_ID:role/GitHubActionsRole \
    --role-session-name GitHubActionsSession
```

## Production Deployment

### 1. AWS ECS Production Setup

#### Create Production Task Definition:
```json
{
  "family": "credit-scoring-dashboard-prod",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::ACCOUNT_ID:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "credit-scoring-dashboard",
      "image": "ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/credit-scoring-dashboard:latest",
      "portMappings": [
        {
          "containerPort": 80,
          "protocol": "tcp"
        }
      ],
      "essential": true,
      "environment": [
        {
          "name": "REACT_APP_CONTRACT_ADDRESS",
          "value": "YOUR_PRODUCTION_CONTRACT_ADDRESS"
        },
        {
          "name": "REACT_APP_NETWORK_ID",
          "value": "11155111"
        },
        {
          "name": "REACT_APP_ENVIRONMENT",
          "value": "production"
        }
      ]
    }
  ]
}
```

#### Deploy via GitHub Actions:
1. Push to `main` branch
2. GitHub Actions automatically:
   - Builds Docker image
   - Pushes to ECR
   - Updates ECS service
   - Deploys to production

### 2. Smart Contract Production Deployment

#### Deploy to Sepolia Testnet:
```bash
truffle migrate --network sepolia
```

#### Verify Contract on Etherscan:
```bash
truffle run verify dashboard --network sepolia
```

#### Update Contract Address:
1. Copy deployed contract address
2. Update GitHub secrets: `CONTRACT_ADDRESS`
3. Update ECS task definition
4. Redeploy ECS service

### 3. Production Monitoring

#### CloudWatch Logs:
```bash
# View application logs
aws logs describe-log-groups --log-group-name-prefix "/ecs/credit-scoring-dashboard"

# View specific log stream
aws logs get-log-events \
    --log-group-name "/ecs/credit-scoring-dashboard" \
    --log-stream-name "ecs/credit-scoring-dashboard/container-id"
```

#### ECS Service Health:
```bash
# Check service status
aws ecs describe-services \
    --cluster credit-scoring-cluster \
    --services credit-scoring-dashboard-service

# Check task health
aws ecs describe-tasks \
    --cluster credit-scoring-cluster \
    --tasks task-arn
```

### 4. Production Scaling

#### Auto Scaling Configuration:
```bash
# Create auto scaling target
aws application-autoscaling register-scalable-target \
    --service-namespace ecs \
    --resource-id service/credit-scoring-cluster/credit-scoring-dashboard-service \
    --scalable-dimension ecs:service:DesiredCount \
    --min-capacity 1 \
    --max-capacity 10

# Create scaling policy
aws application-autoscaling put-scaling-policy \
    --service-namespace ecs \
    --resource-id service/credit-scoring-cluster/credit-scoring-dashboard-service \
    --scalable-dimension ecs:service:DesiredCount \
    --policy-name credit-scoring-scaling-policy \
    --policy-type TargetTrackingScaling \
    --target-tracking-scaling-policy-configuration file://scaling-policy.json
```

## Security Considerations

### 1. Environment Variables
- Never commit `.env` files to version control
- Use strong, unique mnemonic phrases
- Rotate API keys regularly

### 2. Smart Contract Security
- Audit smart contracts before deployment
- Use testnets for development
- Implement proper access controls

### 3. Frontend Security
- Validate all user inputs
- Implement proper error handling
- Use HTTPS in production

## Support

### Getting Help
1. Check the troubleshooting section
2. Review smart contract documentation
3. Check GitHub issues
4. Contact the development team

### Useful Commands
```bash
# Check Truffle version
truffle version

# Check Node.js version
node --version

# Check npm version
npm --version

# Check Docker version
docker --version

# Check Ganache status
curl http://localhost:7545
```

---

**Note**: This setup manual assumes you have basic knowledge of blockchain development, React, and Docker. For additional help, refer to the official documentation of each technology stack.

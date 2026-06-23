# KFinFund 🏦

A cloud-native mutual fund investment platform built as part of the KFintech Internship Program. The platform is designed using a microservices architecture, containerised with Docker, orchestrated on Kubernetes (AWS EKS), and delivered through a fully automated CI/CD pipeline with live monitoring.

---

## What is KFinFund?

KFinFund allows users to register, complete KYC verification, invest in mutual funds, set up SIP (Systematic Investment Plans), and receive real-time notifications — all running on a production-grade cloud infrastructure on AWS.

---

## Architecture Overview

```
User (Browser)
      │
      ▼
  React Frontend
      │
      ▼
  API Gateway
      │
      ├──► User Service          (PostgreSQL)
      ├──► KYC Service           (MongoDB)
      ├──► Transaction Service   (PostgreSQL)
      ├──► SIP Service           (PostgreSQL)
      └──► Notification Service  (MongoDB)

All services run as Docker containers
inside Kubernetes pods on AWS EKS.

GitHub → CodeBuild → ECR → EKS (automated CI/CD)
Prometheus + Grafana (live monitoring)
```

---

## Microservices

| Service | Description | Port |
|---------|-------------|------|
| user-service | User registration, login, JWT authentication | 3001 |
| kyc-service | KYC document upload and verification | 3002 |
| transaction-service | Buy/sell mutual fund units, NAV calculation | 3003 |
| sip-service | SIP scheduling and auto-investment | 3004 |
| notification-service | Email and SMS alerts for all events | 3005 |
| frontend | React-based user interface | 3000 |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js (Express) |
| Frontend | React.js |
| Database | PostgreSQL, MongoDB |
| Containerisation | Docker, Docker Compose |
| Orchestration | Kubernetes on AWS EKS |
| Container Registry | AWS ECR |
| CI/CD | GitHub → AWS CodeBuild → ECR → EKS |
| Monitoring | Prometheus + Grafana |
| API Gateway | NGINX Ingress Controller |
| Authentication | JWT Tokens |

---

## Project Structure

```
KFinFund/
│
├── user-service/           # User registration & login
├── kyc-service/            # KYC document verification
├── transaction-service/    # Buy/sell mutual fund units
├── sip-service/            # Monthly SIP scheduling
├── notification-service/   # Email/SMS notifications
├── frontend/               # React web application
├── k8s/                    # Kubernetes YAML manifests
├── docker-compose.yml      # Local development setup
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- Docker & Docker Compose
- Git

### Clone the repository
```bash
git clone https://github.com/techCloudDev/KFinFund.git
cd KFinFund
```

### Run locally with Docker Compose
```bash
docker-compose up --build
```

This will start all 5 services and the frontend together locally.

### Access the application
```
Frontend        → http://localhost:3000
User Service    → http://localhost:3001
KYC Service     → http://localhost:3002
Transaction     → http://localhost:3003
SIP Service     → http://localhost:3004
Notification    → http://localhost:3005
```

---

## Git Workflow

We follow a simple branching strategy:

```
main        → production (auto-deploys via CI/CD)
dev         → integration branch (merge here first)
feature/*   → individual feature branches
```

**Rule — never push directly to main. Always raise a pull request.**

### How to contribute
```bash
# Create your feature branch
git checkout -b feature/your-feature-name

# Make your changes and commit
git add .
git commit -m "Add: description of what you did"

# Push to GitHub
git push origin feature/your-feature-name

# Then raise a Pull Request to dev branch on GitHub
```

---

## Team

Built by a team of 15 members as part of the **KFintech Internship Program**.

---

## Acknowledgement

This project is inspired by real-world mutual fund infrastructure used at **KFintech** — one of India's leading Registrar and Transfer Agents (RTA) for mutual funds.

---

*KFintech Internship Program — Project 5*
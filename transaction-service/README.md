# Transaction Service

The Transaction Service is a core microservice of the KFinFund platform responsible for managing mutual fund investment transactions and portfolio information.

## Features

* Buy Mutual Fund Units
* Redeem Mutual Fund Units
* View Transaction History
* View Portfolio Summary
* JWT-based Authentication
* PostgreSQL Database Integration

## Tech Stack

* Node.js
* Express.js
* PostgreSQL
* JWT Authentication
* Docker (Planned)
* Kubernetes (Planned)

## Project Structure

```text
transaction-service/
│
├── src/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   └── transactionController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   └── transactionModel.js
│   ├── routes/
│   │   └── transactionRoutes.js
│   └── app.js
│
├── init.sql
├── package.json
├── Dockerfile
├── .env.example
└── README.md
```

## API Endpoints

### Buy Fund

```http
POST /api/transactions/buy
```

Request Body

```json
{
  "fund_id": 101,
  "amount": 5000,
  "nav": 50
}
```

---

### Redeem Fund

```http
POST /api/transactions/redeem
```

Request Body

```json
{
  "fund_id": 101,
  "units": 50,
  "nav": 55
}
```

---

### Transaction History

```http
GET /api/transactions/history
```

Returns all transactions performed by the authenticated user.

---

### Portfolio Summary

```http
GET /api/transactions/portfolio
```

Returns portfolio information and investment summary.

## Database Schema

Run the following command to create the transactions table:

```bash
psql -U postgres -d kfinfund_transactions -f init.sql
```

## Environment Variables

Create a `.env` file using the following variables:

```env
PORT=
DB_HOST=
DB_PORT=
DB_NAME=
DB_USER=
DB_PASSWORD=
JWT_SECRET=
```

## Authentication

All transaction APIs are protected using JWT authentication.

Include the token in request headers:

```http
Authorization: Bearer <jwt_token>
```

## Future Enhancements

* Real-time NAV Integration
* Portfolio Performance Analytics
* Fund Service Integration
* SIP Service Integration
* Docker Containerization
* Kubernetes Deployment
* AWS Deployment
* Prometheus and Grafana Monitoring

```
```

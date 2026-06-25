import { Link } from "react-router-dom";

function Success() {
  return (
    <div className="success-page">
      <div className="success-icon">✓</div>

      <h2>Account Created Successfully</h2>

      <p>
        Your KFinFund account has been created successfully.
      </p>

      <p>
        Please login to continue your investment journey.
      </p>

      <Link to="/login" className="success-login-btn">
        Go to Login
      </Link>
    </div>
  );
}

export default Success;
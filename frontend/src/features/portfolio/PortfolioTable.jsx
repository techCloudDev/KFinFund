import PortfolioRow from "./PortfolioRow";

export default function PortfolioTable({ investments, isMasked }) {
  return (
    <div className="pf-table-card">
      <table className="pf-table">
        <thead>
          <tr>
            <th>Fund name</th>
            <th>XIRR (%)</th>
            <th>Day change (%)</th>
            <th>Returns (%)</th>
            <th>Current (Invested)</th>
          </tr>
        </thead>
        <tbody>
          {investments.map((fund, idx) => (
            <PortfolioRow key={idx} fund={fund} isMasked={isMasked} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

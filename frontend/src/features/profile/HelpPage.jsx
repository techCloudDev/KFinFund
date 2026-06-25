import DashboardLayout from "../mutual-fund/component/DashboardLayout";
import "./profile.css";

export default function HelpPage() {
  const contactInfo = {
    phone: "+91 1800-KFIN-FUND (1800-419-5436)",
    email: "support@kfinfund.com"
  };

  const faqs = [
    {
      q: "How do I redeem my mutual funds?",
      a: "Go to your Portfolio page, select the mutual fund scheme, click 'Redeem', enter the amount/units, and confirm the transaction."
    },
    {
      q: "How long does it take for funds to reflect in my bank account?",
      a: "For liquid funds, it usually takes T+1 working days. For equity funds, it takes T+2 to T+3 working days."
    },
    {
      q: "Can I update my registered bank account details?",
      a: "Yes, you can initiate a bank account change request from the 'Bank Accounts' page under profile settings."
    }
  ];

  return (
    <DashboardLayout pageTitle="Help & Support">
      <div 
        className="mf-detail-card" 
        style={{ 
          maxWidth: "800px", 
          margin: "0 auto", 
          minHeight: "auto", 
          boxSizing: "border-box" 
        }}
      >
        <h2 className="mf-detail-card-title">Help & Support</h2>
        <p className="mf-detail-card-subtitle">Have questions or need assistance? We are here to help you.</p>

        {/* Contact details */}
        <div className="mf-help-contacts">
          <div className="mf-help-contact-card">
            <div className="mf-help-contact-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            </div>
            <div className="mf-help-contact-info">
              <span className="mf-help-contact-title">Call Toll-Free</span>
              <a href={`tel:${contactInfo.phone}`} className="mf-help-contact-value">
                {contactInfo.phone}
              </a>
            </div>
          </div>

          <div className="mf-help-contact-card">
            <div className="mf-help-contact-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </div>
            <div className="mf-help-contact-info">
              <span className="mf-help-contact-title">Email Support</span>
              <a href={`mailto:${contactInfo.email}`} className="mf-help-contact-value">
                {contactInfo.email}
              </a>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div style={{ marginTop: "20px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "700", color: "var(--mf-text-dark)", marginBottom: "16px" }}>Frequently Asked Questions</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                style={{ 
                  borderBottom: "1px solid var(--mf-border-color)", 
                  paddingBottom: "16px" 
                }}
              >
                <h4 style={{ margin: "0 0 6px 0", color: "var(--mf-text-dark)", fontSize: "15px", fontWeight: "600" }}>{faq.q}</h4>
                <p style={{ margin: 0, color: "var(--mf-text-muted)", fontSize: "14px", lineHeight: "1.5" }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

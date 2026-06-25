import { Link } from "react-router-dom";
import logoImg from "../../../assets/Logo.png";

const CONTACT_LINKS = [
  ["📞", "1800-123-4567 (Toll-Free)"],
  ["✉️", "KfinFund@investpro.com"]

];

const SOCIAL_ICONS = ["𝕏", "f", "in", "📸"];

export default function Footer() {
  return (
    <footer className="lp-footer">
      <div className="lp-container">
        <div className="lp-footer__grid">
          <div>
            <Link to="/" className="lp-footer__brand" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
              <div className="lp-footer__brand-icon" style={{ background: "none", padding: 0, display: "flex", alignItems: "center" }}>
                <img src={logoImg} alt="KfinFund logo" style={{ width: "32px", height: "32px", objectFit: "contain" }} />
              </div>
              <span className="lp-footer__brand-name">KfinFund</span>
            </Link>
            <p className="lp-footer__text">
              Empowering millions of Indians to achieve their financial goals
              through smart, simple investments.
            </p>
          </div>

          <div>
            <h4 className="lp-footer__heading">Corporate Address</h4>
            <p className="lp-footer__address">
              📍 Lane L-4,Jaganmohan Nagar,
              <br />
              Jagamara
              <br />
              Odisha, Bhubaneswar - 751030
            </p>
          </div>

          <div>
            <h4 className="lp-footer__heading">Contact Us</h4>
            <div className="lp-footer__links">
              {CONTACT_LINKS.map(([ico, txt]) => (
                <a key={txt} href="#" className="lp-footer__link">
                  {ico} {txt}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="lp-footer__heading">Connect</h4>
            <p className="lp-footer__social-text">Daily market insights &amp; tips.</p>
            <div className="lp-footer__socials">
              {SOCIAL_ICONS.map((icon, i) => (
                <a key={i} href="#" className="lp-footer__social">
                  {icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="lp-footer__bottom">
          <p>
            © {new Date().getFullYear()} KfinFund Financial Services. All
            rights reserved.
          </p>
          <p className="lp-footer__disclaimer">
            Mutual Fund investments are subject to market risks. Please read all
            scheme-related documents carefully.
          </p>
        </div>
      </div>
    </footer>
  );
}

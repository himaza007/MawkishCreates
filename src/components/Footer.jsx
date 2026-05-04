import { Link } from 'react-router-dom'
import {
  IconInstagram, IconFacebook, IconLinkedin, IconTwitter,
  IconMail, IconPhone, IconMapPin,
} from '../components/Icons'
import '../styles/footer.css'

const pages = [
  { label: 'Home',         to: '/' },
  { label: 'About Us',     to: '/about' },
  { label: 'Work With Us', to: '/work-with-us' },
]

const services = [
  { label: 'Lead Generation',         to: '/work-with-us/lead-generation' },
  { label: 'Social Media Management', to: '/work-with-us/social-media-management' },
  { label: 'Events',                  to: '/work-with-us/events' },
  { label: 'Web Development',         to: '/work-with-us/web-development' },
]

const socialLinks = [
  { Icon: IconInstagram, label: 'Instagram', href: '#' },
  { Icon: IconFacebook,  label: 'Facebook',  href: '#' },
  { Icon: IconLinkedin,  label: 'LinkedIn',  href: '#' },
  { Icon: IconTwitter,   label: 'Twitter / X', href: '#' },
]

const contactItems = [
  { Icon: IconMail,   text: 'hello@mawkishcreates.com' },
  { Icon: IconPhone,  text: '+94 XX XXX XXXX' },
  { Icon: IconMapPin, text: 'Colombo, Sri Lanka' },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer" role="contentinfo">
      <div className="container">
        <div className="footer-top">

          {/* Brand */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo" aria-label="Mawkish Creates">
              <img
                src="/mawkish-logo.png"
                alt="Mawkish Creates"
                className="footer-logo-img"
              />
            </Link>

            <p className="footer-tagline">
              A creative growth partner focused on building systems that generate
              visibility, demand, and measurable outcomes.
            </p>

            <div className="footer-socials" aria-label="Social media links">
              {socialLinks.map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  className="social-link"
                  aria-label={`Follow us on ${label}`}
                >
                  <Icon size={16} strokeWidth={1.75} />
                </a>
              ))}
            </div>
          </div>

          {/* Pages */}
          <div>
            <h3 className="footer-col-title">Pages</h3>
            <nav className="footer-links" aria-label="Footer navigation">
              {pages.map(({ label, to }) => (
                <Link key={to} to={to} className="footer-link">
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Services */}
          <div>
            <h3 className="footer-col-title">Services</h3>
            <div className="footer-links">
              {services.map(({ label, to }) => (
                <Link key={to} to={to} className="footer-link">
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="footer-col-title">Contact</h3>
            {contactItems.map(({ Icon, text }) => (
              <div key={text} className="footer-contact-item">
                <div className="footer-contact-icon" aria-hidden="true">
                  <Icon size={14} strokeWidth={1.75} />
                </div>
                <span>{text}</span>
              </div>
            ))}
          </div>

        </div>
      </div>

      <hr className="footer-divider" />

      <div className="container">
        <div className="footer-bottom">
          <p className="footer-copy">
            © {year} <strong>Mawkish Creates</strong>. All rights reserved.
          </p>
          <div className="footer-legal-links">
            <a href="#" className="footer-legal-link">Privacy Policy</a>
            <a href="#" className="footer-legal-link">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
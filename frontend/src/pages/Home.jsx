import { Link, useNavigate } from "react-router-dom";
import { Cloud, Zap, ArrowRight, FolderPlus, Upload, Share2, Trash2 } from "lucide-react";
import "../styles/home.css";

export default function Home() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (token) {
      navigate("/upload");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="home-layout">
      {/* Navbar */}
      <header className="home-navbar">
        <div className="navbar-logo">
          <Cloud className="logo-icon" size={28} />
          <span className="logo-text">UploadHub</span>
        </div>
        <nav className="navbar-links">
          {token ? (
            <button className="nav-btn-primary" onClick={() => navigate("/upload")}>
              Go to Upload
            </button>
          ) : (
            <>
              <Link to="/login" className="nav-link">Log In</Link>
              <Link to="/register" className="nav-btn-primary">Sign Up</Link>
            </>
          )}
        </nav>
      </header>

      <main className="home-main-content">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-badge">
            <Zap size={12} className="badge-icon" /> ephemeral file sharing
          </div>
          <h1 className="hero-title">
            Share files securely, <br />
            <span className="gradient-text">they auto-expire.</span>
          </h1>
          <p className="hero-subtitle">
            Create a temporary storage bin instantly. Drag & drop files of any type, share the secure download link or scan the QR code. All files are wiped completely upon expiration.
          </p>
          <div className="hero-actions">
            <button className="cta-button" onClick={handleGetStarted}>
              Get Started
              <ArrowRight className="cta-arrow" size={20} />
            </button>
          </div>
        </section>

        {/* Instructions Section */}
        <section className="instructions-section">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">Follow these four simple steps to share files safely and easily.</p>
          
          <div className="instructions-grid">
            <div className="instruction-card">
              <div className="card-header-row">
                <FolderPlus className="card-icon" size={24} />
                <div className="card-number">01</div>
              </div>
              <h3 className="card-heading">Create a Bin</h3>
              <p className="card-desc">
                Log in or register an account. A secure temporary bin is automatically provisioned for you.
              </p>
            </div>

            <div className="instruction-card">
              <div className="card-header-row">
                <Upload className="card-icon" size={24} />
                <div className="card-number">02</div>
              </div>
              <h3 className="card-heading">Upload Files</h3>
              <p className="card-desc">
                Drag & drop or browse to select files. Upload anything from documents to pictures with fast parallel processing.
              </p>
            </div>

            <div className="instruction-card">
              <div className="card-header-row">
                <Share2 className="card-icon" size={24} />
                <div className="card-number">03</div>
              </div>
              <h3 className="card-heading">Share Instantly</h3>
              <p className="card-desc">
                Copy your private share URL with a single click or let others scan the live-generated QR code directly.
              </p>
            </div>

            <div className="instruction-card">
              <div className="card-header-row">
                <Trash2 className="card-icon" size={24} />
                <div className="card-number">04</div>
              </div>
              <h3 className="card-heading">Auto-Cleanup</h3>
              <p className="card-desc">
                All files are securely deleted from memory and disk automatically when the bin reaches its expiry date.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="home-footer">
        <p>&copy; {new Date().getFullYear()} UploadHub. Temporary, secure, and modern file delivery.</p>
      </footer>
    </div>
  );
}

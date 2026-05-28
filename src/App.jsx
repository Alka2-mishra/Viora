import { useState } from 'react';

const galleryItems = [
  {
    title: 'Glow Essentials',
    label: 'Skin care',
    image:
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=80'
  },
  {
    title: 'Soft Glam Set',
    label: 'Beauty kit',
    image:
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80'
  },
  {
    title: 'Everyday Pink Edit',
    label: 'Trending now',
    image:
      'https://images.unsplash.com/photo-1527799820374-dcf8b8f7b2c5?auto=format&fit=crop&w=900&q=80'
  }
];

const saleCards = [
  {
    title: 'Up to 40% off',
    text: 'Upcoming festive sale on skincare, lip care, and self-care bundles.'
  },
  {
    title: 'New member drops',
    text: 'Register now to get early access to limited pink picks and gift sets.'
  },
  {
    title: 'Weekend flash deals',
    text: 'Short-time offers inspired by the clean storefront style of major marketplaces.'
  }
];

function App() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.email.trim() || !form.password.trim()) {
      return;
    }

    setSubmitted(true);
    setForm({ name: '', email: '', password: '' });
  };

  return (
    <div className="page-shell landing-shell">
      <div className="ambient ambient-a" />
      <div className="ambient ambient-b" />

      <header className="hero-card landing-hero">
        <nav className="landing-nav">
          <div>
            <p className="eyebrow">Viora</p>
            <h1>Clean pink shopping landing page for female beauty and care products.</h1>
          </div>
          <div className="nav-pills">
            <a href="#about">About</a>
            <a href="#offers">Sale</a>
            <a href="#access">Login / Register</a>
            <a href="#footer">Footer</a>
          </div>
        </nav>

        <div className="hero-grid landing-grid">
          <section className="hero-copy">
            <span className="badge">Pink to light pink gradient storefront</span>
            <h2>Modern, neat, and inspired by top marketplace landing pages.</h2>
            <p>
              Viora is a feminine-focused storefront concept with a polished homepage, upcoming
              discount highlights, secure access forms, and elegant product imagery.
            </p>
            <div className="hero-actions">
              <button className="submit-button" type="button" onClick={() => setMode('register')}>
                Register
              </button>
              <button className="ghost active" type="button" onClick={() => setMode('login')}>
                Login
              </button>
            </div>
          </section>

          <section className="hero-panel landing-showcase">
            {galleryItems.map((item) => (
              <article className="showcase-card" key={item.title}>
                <img src={item.image} alt={item.title} loading="lazy" />
                <div>
                  <p>{item.label}</p>
                  <strong>{item.title}</strong>
                </div>
              </article>
            ))}
          </section>
        </div>
      </header>

      <main className="landing-content">
        <section className="info-panel" id="about">
          <p className="section-label">About</p>
          <h3>About the website</h3>
          <p>
            Viora is designed for beauty, self-care, and feminine lifestyle products. The layout
            stays simple and premium, with enough visual detail to feel like a real storefront
            without becoming crowded.
          </p>
        </section>

        <section className="sale-grid" id="offers">
          <div className="section-header compact">
            <div>
              <p className="section-label">Upcoming discounts</p>
              <h3>Sale highlights</h3>
            </div>
          </div>
          <div className="sale-cards">
            {saleCards.map((card) => (
              <article className="sale-card" key={card.title}>
                <strong>{card.title}</strong>
                <p>{card.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="access-panel" id="access">
          <div className="access-copy">
            <p className="section-label">Login / Register</p>
            <h3>Quick account access</h3>
            <p>
              Use the form below to sign in or create an account. The page keeps the experience
              minimal, clean, and easy to scan.
            </p>
          </div>

          <div className="auth-card landing-auth">
            <div className="auth-toggle">
              <button
                className={mode === 'login' ? 'ghost active' : 'ghost'}
                type="button"
                onClick={() => setMode('login')}
              >
                Login
              </button>
              <button
                className={mode === 'register' ? 'ghost active' : 'ghost'}
                type="button"
                onClick={() => setMode('register')}
              >
                Register
              </button>
            </div>

            {submitted ? (
              <div className="success-state landing-success">
                <strong>{mode === 'login' ? 'Logged in successfully.' : 'Registered successfully.'}</strong>
                <span>Welcome to Viora.</span>
              </div>
            ) : (
              <form className="auth-form landing-form" onSubmit={handleSubmit}>
                {mode === 'register' && (
                  <input
                    placeholder="Full name"
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                  />
                )}
                <input
                  placeholder="Email address"
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                />
                <input
                  placeholder="Password"
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                />
                <button className="submit-button" type="submit">
                  {mode === 'login' ? 'Login now' : 'Create account'}
                </button>
              </form>
            )}
          </div>
        </section>
      </main>

      <footer className="footer-card" id="footer">
        <div>
          <p className="eyebrow">Viora</p>
          <strong>Beauty-first landing page for female products.</strong>
        </div>
        <p>Clean navigation, soft pink visuals, upcoming offers, and a simple access flow.</p>
      </footer>
    </div>
  );
}

export default App;

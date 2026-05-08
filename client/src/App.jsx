import "./App.css";

function StatCard({ icon, number, label, accent }) {
  return (
    <article className={`statCard ${accent}`}>
      <div className="statIcon">{icon}</div>
      <strong>{number}</strong>
      <span>{label}</span>
    </article>
  );
}

function SearchField({ icon, label, value }) {
  return (
    <div className="searchField">
      <div className="fieldIcon">{icon}</div>
      <div>
        <p>{label}</p>
        <span>{value}</span>
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="app">
      <nav className="navbar">
        <div className="logo">
          voyage<span>.ai</span>
        </div>

        <div className="navLinks">
          <a href="#explore">Explore</a>
          <a href="#my-trips">My Trips</a>
          <button className="bellButton" aria-label="notifications">
            🔔
          </button>
          <div className="avatarBlank" aria-label="user profile"></div>
        </div>
      </nav>

      <main className="dashboard">
        <section className="topRow">
          <div className="welcomeCard">
            <div className="heroArt"></div>
            <div className="welcomeText">
              <h1>Welcome Back, Yoyo!</h1>
              <p>Ready to plan your next adventure?</p>
            </div>
          </div>

          <div className="statsGrid">
          <StatCard icon="🎒" number="3" label="Trips" accent="green" />
          <StatCard icon="🌍" number="2" label="Countries" accent="green" />
          <StatCard icon="📅" number="12" label="Days" accent="green" />
          <StatCard icon="💳" number="$3,000" label="Total Budget" accent="gold" />
          </div>
        </section>

        <section className="quickPlan" aria-label="4W trip search">
        <SearchField icon="📍" label="WHERE" value="Search destinations" />
        <SearchField icon="📅" label="WHEN" value="Add dates" />
        <SearchField icon="👥" label="WHO" value="Travelers" />
        <SearchField icon="💳" label="WALLET" value="Budget" />

          <button className="planButton">✦ Plan with AI</button>
        </section>

        <section className="sectionBlock">
          <div className="sectionHeader">
            <h2>🛫 Coming Up</h2>
          </div>

          <article className="comingCard">
            <div className="tripImage tokyoImage"></div>

            <div className="comingInfo">
              <p className="smallGold">Next Trip</p>
              <h3>Tokyo, Japan</h3>

              <div className="tripMeta">
              <span>📅 May 20 – May 25</span>
              <span>👥 2 travelers</span>
              <span>💳 $1500 budget</span>
              </div>
            </div>

            <button className="outlineButton">View Itinerary</button>
          </article>
        </section>

        <section className="sectionBlock" id="my-trips">
          <div className="sectionHeader">
            <h2>🧳 My Trips</h2>
            <a href="#my-trips">View all trips ›</a>
          </div>

          <div className="tripGrid">
            <article className="tripCard">
              <div className="cardImage parisImage">
                <span>Upcoming</span>
              </div>
              <div className="tripCardBody">
                <h3>Paris Weekend</h3>
                <p>📍 France · 3 days</p>
              </div>
            </article>

            <article className="tripCard">
              <div className="cardImage seoulImage">
                <span>Upcoming</span>
              </div>
              <div className="tripCardBody">
                <h3>Seoul Food Tour</h3>
                <p>📍 Korea · 5 days</p>
              </div>
            </article>

            <article className="newTripCard">
              <div className="plusCircle">+</div>
              <h3>Start a new trip</h3>
              <p>Let AI help you plan your next adventure</p>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;

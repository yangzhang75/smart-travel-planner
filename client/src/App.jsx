import "./App.css";

function App() {
  return (
    <div className="app">
      <header className="topBar">
        <div className="logoBox">Voyage.ai</div>

        <nav className="navLinks">
          <a href="#home">Home</a>
          <a href="#my-trips">My Trips</a>
          <button className="iconButton">Icon</button>
        </nav>
      </header>

      <main className="homepage" id="home">
        <section className="welcomeSection">
          <div className="welcomeText">
            <h1>Welcome Back, Yoyo!</h1>
            <p>Ready to plan your next adventure?</p>
          </div>

          <div className="stats">
            <div className="statCard">
              <strong>3</strong>
              <span>TRIPS</span>
            </div>

            <div className="statCard">
              <strong>2</strong>
              <span>COUNTRIES</span>
            </div>

            <div className="statCard">
              <strong>12</strong>
              <span>DAYS</span>
            </div>
          </div>
        </section>

        <section className="searchSection" aria-label="4W trip search">
          <div className="searchBox">
            <label>
              <span>WHERE</span>
              <input type="text" placeholder="Search destinations" />
            </label>

            <label>
              <span>WHEN</span>
              <input type="text" placeholder="Add dates" />
            </label>

            <label>
              <span>WHO</span>
              <input type="text" placeholder="Travelers" />
            </label>

            <label>
              <span>WALLET</span>
              <input type="text" placeholder="Budget" />
            </label>

            <button className="searchButton" aria-label="search trip">
              🔍
            </button>
          </div>
        </section>

        <section className="comingUp">
          <h2>COMING UP</h2>

          <div className="upcomingTrip">
            <div>
              <p className="tripLabel">Next Trip</p>
              <h3>Tokyo, Japan</h3>
              <p>May 20 - May 25 · 2 travelers · $1500 budget</p>
            </div>

            <button className="viewButton">View Itinerary</button>
          </div>
        </section>

        <section className="myTrips" id="my-trips">
          <h2>My Trips</h2>

          <div className="tripGrid">
            <article className="tripCard">
              <div className="imagePlaceholder">[IMAGE]</div>
              <h3>Paris Weekend</h3>
              <p>France · 3 days</p>
            </article>

            <article className="tripCard">
              <div className="imagePlaceholder">[IMAGE]</div>
              <h3>Seoul Food Tour</h3>
              <p>Korea · 5 days</p>
            </article>

            <article className="newTripCard">
              <div className="plusCircle">+</div>
              <h3>Start a new trip</h3>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;

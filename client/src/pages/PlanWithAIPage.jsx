import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const loadingSteps = [
  "Researching destinations",
  "Analyzing your preferences",
  "Optimizing daily schedule",
  "Estimating budget breakdown",
  "Finalizing your itinerary",
];

const sampleDays = [
  { day: "Day 1", date: "Sat, Jul 12", stops: 4 },
  { day: "Day 2", date: "Sun, Jul 13", stops: 3 },
  { day: "Day 3", date: "Mon, Jul 14", stops: 4 },
];

const sampleStops = [
  {
    time: "9:00",
    title: "Tsukiji Outer Market",
    type: "Food & Market · Chuo",
    desc: "Explore fresh sushi stalls and local vendors.",
    cost: "¥1,200",
    duration: "2 hrs",
  },
  {
    time: "11:30",
    title: "Senso-ji Temple",
    type: "Temple & Culture · Asakusa",
    desc: "Visit Tokyo’s oldest temple and Nakamise street.",
    cost: "Free",
    duration: "1.5 hrs",
  },
  {
    time: "19:30",
    title: "Dinner at Ichiran Ramen",
    type: "Dining · Shibuya",
    desc: "Enjoy ramen in individual booths.",
    cost: "¥980",
    duration: "2 hrs",
  },
];

export default function PlanWithAIPage() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [tripData, setTripData] = useState(null);

  const destination = state?.where || "Tokyo, Japan";
  const dates = state?.dateLabel || "Jul 12–19";
  const travelers = state?.whoLabel || "2 travelers";
  const budget = state?.budgetLabel || "$2,250";

  const days = tripData?.days || sampleDays;
  const selectedDay = days[0];
  const stops = Array.isArray(selectedDay?.stops)
  ? selectedDay.stops
  : sampleStops;

  useEffect(() => {
    const stepTimer = setInterval(() => {
      setActiveStep((prev) => {
        if (prev >= loadingSteps.length - 1) {
          clearInterval(stepTimer);
          return prev;
        }
        return prev + 1;
      });
    }, 900);

    async function generateTrip() {
      try {
        const res = await fetch("http://localhost:5000/api/plan-trip", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            where: state?.where,
            dateLabel: state?.dateLabel,
            whoLabel: state?.whoLabel,
            budgetLabel: state?.budgetLabel,
          }),
        });

        const data = await res.json();
        setTripData(data);

        setTimeout(() => {
          setLoading(false);
        }, 4500);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    }

    generateTrip();

    return () => clearInterval(stepTimer);
  }, []);

  if (loading) {
    return (
      <div className="aiLoadingPage">
        <div className="loadingLogo logo">
          voyage<span>.ai</span>
        </div>

        <div className="loadingCenter">
          <div className="loadingCircle">AI</div>

          <h1>Building your {destination} trip...</h1>
          <p>
            {dates} · {travelers}
          </p>

          <div className="loadingSteps">
            {loadingSteps.map((step, index) => (
              <div
                key={step}
                className={`loadingStep ${
                  index < activeStep
                    ? "done"
                    : index === activeStep
                    ? "active"
                    : ""
                }`}
              >
                <span className="stepDot">
                  {index < activeStep ? "✓" : index === activeStep ? "●" : ""}
                </span>

                <div>
                  <strong>{step}</strong>
                  <small>
                    {index < activeStep
                      ? "Completed"
                      : index === activeStep
                      ? "Working on this now"
                      : "Waiting"}
                  </small>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="loadingBottom">
          <div className="progressTrack">
            <div
              className="progressFill"
              style={{
                width: `${((activeStep + 1) / loadingSteps.length) * 100}%`,
              }}
            />
          </div>
          <button onClick={() => navigate("/home")}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="tripDetailPage">
      <header className="tripTopbar">
        <div className="tripBrand logo">
          voyage<span>.ai</span>
        </div>

        <div className="tripTitle">
          {tripData?.title || `${destination} Adventure`} · {dates}
        </div>

        <div className="tripActions">
          <button onClick={() => window.location.reload()}>Regen</button>
          <button>Share</button>
        </div>
      </header>

      <div className="tripLayout">
        <aside className="tripSidebar">
          <p className="sidebarLabel">ITINERARY</p>

          {days.map((d, index) => (
            <button
              key={d.day}
              className={`dayItem ${index === 0 ? "active" : ""}`}
            >
              <strong>{d.day}</strong>
              <span>{d.date}</span>
              <small>
                {Array.isArray(d.stops) ? d.stops.length : d.stops || 0} stops
              </small>
            </button>
          ))}

          <button className="addDay">+ Add day</button>
        </aside>

        <main className="tripMain">
          <div className="dayHeader">
            <div>
              <h1>
                {selectedDay?.day || "Day 1"} —{" "}
                {selectedDay?.theme || "Arrival & Explore"}
              </h1>
              <p>
                {selectedDay?.date || "Your first day"} · {stops.length}{" "}
                activities planned
              </p>
            </div>

            <button>+ Add a stop</button>
          </div>

          <div className="stopList">
            {stops.map((stop, index) => (
              <article className="stopCard" key={stop.title || index}>
                <div className="dragDots">⋮</div>

                <div className="stopTime">
                  <strong>{stop.time}</strong>
                  <span>{stop.duration}</span>
                </div>

                <div className="stopInfo">
                  <h3>{stop.title}</h3>
                  <p className="stopType">{stop.type}</p>
                  <p>{stop.description || stop.desc}</p>
                </div>

                <div className="stopCost">{stop.cost}</div>
              </article>
            ))}
          </div>
        </main>

        <aside className="tripRightPanel">
          <div className="tabs">
            <button className="active">MAP</button>
            <button>WEATHER</button>
            <button>BUDGET</button>
          </div>

          <div className="mapBox">[ INTERACTIVE MAP ]</div>

          <div className="weatherRow">
            <div>
              <span>MON</span>
              <div className="weatherIcon" />
              72°
            </div>
            <div>
              <span>TUE</span>
              <div className="weatherIcon" />
              68°
            </div>
            <div>
              <span>WED</span>
              <div className="weatherIcon" />
              74°
            </div>
            <div>
              <span>THU</span>
              <div className="weatherIcon" />
              70°
            </div>
          </div>

          <div className="budgetBox">
            <div>
              <span>Day 1 total</span>
              <strong>{tripData?.budget?.dayOneTotal || "$60"}</strong>
            </div>

            <div>
              <span>Trip total so far</span>
              <strong>{tripData?.budget?.tripTotal || "$60"}</strong>
            </div>

            <div>
              <span>Budget</span>
              <strong>{tripData?.budget?.total || budget}</strong>
            </div>

            <div className="budgetTrack">
              <div className="budgetFill" />
            </div>

            <small>{tripData?.budget?.remaining || "$2,190 remaining"}</small>
          </div>
        </aside>
      </div>
    </div>
  );
}
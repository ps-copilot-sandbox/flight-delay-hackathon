import React, { useEffect, useState } from "react";
import "./App.css";
import rldatixLogo from "./rldatix-logo.png";

function App() {
  const [airports, setAirports] = useState([]);
  const [fromAirport, setFromAirport] = useState("");
  const [toAirport, setToAirport] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [result, setResult] = useState(null);

  // Filter out the selected "from" airport from the "to" options and vice versa
  const filteredFromAirports = airports.filter(
    airport => airport.OriginAirportID !== toAirport
  );
  const filteredToAirports = airports.filter(
    airport => airport.OriginAirportID !== fromAirport
  );

  useEffect(() => {
    fetch("/airports")
      .then((res) => res.json())
      .then((data) => setAirports(data.airports));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResult(null);

    // Extract day of week from date (0=Sunday, 1=Monday, ..., 6=Saturday)
    const dayOfWeek = date ? (new Date(date).getDay() || 7) : 1;

    const response = await fetch("/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        day_of_week: dayOfWeek,
        origin_airport_id: Number(fromAirport),
        dest_airport_id: Number(toAirport),
        date,
        time,
      }),
    });
    const data = await response.json();
    setResult(data);
  };

  return (
    <div className="rldatix-bg">
      <div className="rldatix-logo-bar">
        <img src={rldatixLogo} alt="RLDatix Logo" className="rldatix-logo" />
      </div>
      <section className="rldatix-hero">
        <h1 className="rldatix-hero-title">Flight Delay Predictor</h1>
        <p className="rldatix-hero-subtitle">
          Instantly predict the chance of a flight delay for any US airport, date, and time.<br />
          Powered by RLDatix data science.
        </p>
      </section>
      <section className="rldatix-section">
        <div className="rldatix-card">
          <form className="rldatix-form" onSubmit={handleSubmit}>
            <div className="rldatix-form-group">
              <label htmlFor="from-airport">From (Departure Airport)</label>
              <select
                id="from-airport"
                value={fromAirport}
                onChange={e => setFromAirport(e.target.value)}
                className="rldatix-select"
                required
              >
                <option value="">Select departure airport</option>
                {filteredFromAirports.map(airport => (
                  <option key={airport.OriginAirportID} value={airport.OriginAirportID}>
                    {airport.OriginAirportName}
                  </option>
                ))}
              </select>
            </div>
            <div className="rldatix-form-group">
              <label htmlFor="to-airport">To (Arrival Airport)</label>
              <select
                id="to-airport"
                value={toAirport}
                onChange={e => setToAirport(e.target.value)}
                className="rldatix-select"
                required
              >
                <option value="">Select arrival airport</option>
                {filteredToAirports.map(airport => (
                  <option key={airport.OriginAirportID} value={airport.OriginAirportID}>
                    {airport.OriginAirportName}
                  </option>
                ))}
              </select>
            </div>
            <div className="rldatix-form-group">
              <label htmlFor="date">Date</label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="rldatix-select"
                required
              />
              <small style={{ color: "#888" }}>Select the date of your flight</small>
            </div>
            <div className="rldatix-form-group">
              <label htmlFor="time">Time</label>
              <input
                type="time"
                id="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="rldatix-select"
                required
              />
              <small style={{ color: "#888" }}>Local departure time</small>
            </div>
            <button type="submit" className="rldatix-btn">Predict Delay</button>
          </form>
        </div>
        {result && (
          <div className="rldatix-result">
            <h2>Prediction Result</h2>
            <div
              className={
                "rldatix-badge " +
                (result.chance_percent > 50
                  ? "delayed"
                  : result.chance_percent > 10
                  ? "caution"
                  : "ontime")
              }
            >
              {result.chance_percent > 50
                ? "Delayed"
                : result.chance_percent > 10
                ? "Caution"
                : "On Time"}
            </div>
            <p>
              <strong>Chance:</strong> {result.chance_percent}%<br />
              <strong>Confidence:</strong> {result.confidence_percent}%
            </p>
          </div>
        )}
      </section>
      <footer className="rldatix-footer">
        &copy; {new Date().getFullYear()} RLDatix. All rights reserved.
      </footer>
    </div>
  );
}

export default App;
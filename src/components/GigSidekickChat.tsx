"use client";

import React, { useState } from "react";

export default function GigSidekickChat({ exiting, handleSearch }: { exiting: boolean, handleSearch: (location: string, vehicle: string) => void }) {
  const [step, setStep] = useState(0);
  const [location, setLocation] = useState("");
  const [vehicle, setVehicle] = useState("");

  const bubbleStyle: React.CSSProperties = {
    width: 270,
    padding: 16,
    borderRadius: 16,
    background: "rgba(255,255,255,0.96)",
    boxShadow: "0 12px 40px rgba(0,0,0,0.16)",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    transition: "opacity 200ms ease, transform 200ms ease",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: 16,
    fontWeight: 600,
  };

  const textStyle: React.CSSProperties = {
    fontSize: 12,
    color: "#555",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "6px 8px",
    borderRadius: 8,
    border: "1px solid #e5e5e5",
    fontSize: 12,
    outline: "none",
  };

  const smallButton: React.CSSProperties = {
    background: "#00a895",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "5px 10px",
    fontWeight: 600,
    fontSize: 12,
    cursor: "pointer",
    alignSelf: "flex-end",
  };

  const vehicleButton = (selected: boolean): React.CSSProperties => ({
    padding: "6px",
    borderRadius: 8,
    border: selected ? "1px solid #00a895" : "1px solid #e5e5e5",
    background: selected ? "#e6f7f4" : "#f7f7f7",
    fontSize: 11,
    cursor: "pointer",
  });

  return (
    <div style={bubbleStyle}>
      {step === 0 && (
        <>
          <div style={titleStyle}>Want help?</div>
          <div style={textStyle}>
            I can match you with the right gig.
          </div>
          <button style={smallButton} onClick={() => setStep(1)}>
            Start →
          </button>
        </>
      )}

      {step === 1 && (
        <>
          <div style={titleStyle}>Where do you want to work?</div>
          <input
            type="text"
            placeholder="City, ZIP, or state"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            style={inputStyle}
          />
          <button
            style={{
              ...smallButton,
              opacity: location ? 1 : 0.5,
              pointerEvents: location ? "auto" : "none",
            }}
            onClick={() => setStep(2)}
          >
            Next →
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <div style={titleStyle}>How will you get around?</div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {[
              { id: "car", label: "🚗 Car" },
              { id: "bike", label: "🚴 Bike" },
              { id: "scooter", label: "🛴 Scooter" },
              { id: "walk", label: "🚶 Walk" },
              { id: "truck", label: "🚚 Truck" },
            ].map((option) => (
              <button
                key={option.id}
                style={vehicleButton(vehicle === option.id)}
                onClick={() => setVehicle(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <button
            style={{
              ...smallButton,
              opacity: vehicle ? 1 : 0.5,
              pointerEvents: vehicle ? "auto" : "none",
            }}
            onClick={() => setStep(3)}
          >
            Next →
          </button>
        </>
      )}

      {step === 3 && (
        <>
          {!exiting ? (
            <>
              <div style={titleStyle}>Ready to see matches?</div>
              <button style={smallButton} onClick={() => handleSearch(location, vehicle)}>
                Find gigs
              </button>
            </>
          ) : (
            <div style={{ fontSize: 15, fontWeight: 600 }}>
              Good luck out there.
            </div>
          )}
        </>
      )}
    </div>
  );
}
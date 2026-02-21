"use client";

import React, { useEffect, useState } from "react";

export default function Assistant() {
  const [expanded, setExpanded] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  // First visit slide-in logic
  useEffect(() => {
    const seen = localStorage.getItem("assistantSeen");

    if (!seen) {
      const timer = setTimeout(() => {
        setExpanded(true);
        setHasAnimated(true);
        localStorage.setItem("assistantSeen", "true");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, []);

  // Collapse when search is focused
  useEffect(() => {
    const handleFocusIn = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      if (target?.id === "platform-search") {
        setExpanded(false);
      }
    };

    window.addEventListener("focusin", handleFocusIn);
    return () => window.removeEventListener("focusin", handleFocusIn);
  }, []);

  // Collapse when typing in search
  useEffect(() => {
    const handleInput = (event: Event) => {
      const target = event.target as HTMLElement;
      if (target?.id === "platform-search") {
        setExpanded(false);
      }
    };

    window.addEventListener("input", handleInput);
    return () => window.removeEventListener("input", handleInput);
  }, []);

  const containerStyle: React.CSSProperties = {
    position: "fixed",
    bottom: 24,
    right: 24,
    zIndex: 1000,
    transition: "all 0.3s ease",
  };

  const expandedStyle: React.CSSProperties = {
    width: 240,
    height: 280,
    borderRadius: 16,
    background: "#ffffff",
    boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
    padding: "12px 14px",
    filter:
      "drop-shadow(0 18px 48px rgba(0,201,177,0.22)) drop-shadow(0 4px 24px rgba(0,0,0,0.22))",
  };

  const collapsedStyle: React.CSSProperties = {
    width: 260,
    height: 64,
    borderRadius: "50%",
    background: "#ffffff",
    boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  };

  return (
    <div style={containerStyle}>
      {expanded ? (
        <div style={expandedStyle}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>
            Need help narrowing things down?
          </div>
          <div style={{ fontSize: 14, color: "#555", marginBottom: 12 }}>
            Answer a few quick questions and I’ll guide you.
          </div>
          <button
            onClick={() => setExpanded(false)}
            style={{
              padding: "6px 12px",
              borderRadius: 8,
              border: "none",
              background: "#111",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      ) : (
        <div
          style={collapsedStyle}
          onClick={() => setExpanded(true)}
          aria-label="Open assistant"
          className="transition-all duration-400 minimal-chat"
        >
          💬
        </div>
      )}
      <style jsx global>{`
        .minimal-chat {
          width: 240px !important;
        }
      `}</style>
    </div>
  );
}
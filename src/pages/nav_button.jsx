import { useNavigate, useLocation } from 'react-router';

import { useEffect } from "react";

export function useEscapeToHome() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        navigate("/");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);
}

export default function CloseButton() {
  const navigate = useNavigate();
  const location = useLocation();
  useEscapeToHome();
  return (
    <button
      onClick={() => {
        if (location.key && location.key !== "default") {
          navigate(-1);
        } else {
          navigate("/");
        }
      }}
      style={{
        position: 'fixed',
        top: '16px',
        right: '16px',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        lineHeight: 1,
        padding: 0,
        fontSize: "45px",
        color: "white",
        marginBottom: "10px",
      }}
      aria-label="Close navigation"
    >
      ×
    </button>
  );
}

import React, { useState } from 'react';
import './nav_button.css';
import { useNavigate } from "react-router";

export default function NavButton({ otherPage }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <div className={`blur-overlay ${open ? 'active' : ''}`} onClick={() => setOpen(false)}></div>
      
      <button className="nav-button" onClick={() => setOpen(!open)}>
        ☰
      </button>
      
      {open && (
        <div className="text-options">
          <span onClick={() => { navigate('/'); setOpen(false); }}>Start</span>
          <span onClick={() => { navigate(`/${otherPage.url}`); setOpen(false); }}>{otherPage.title}</span>
        </div>
      )}
    </>
  );
}

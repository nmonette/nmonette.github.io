import React, { useState } from 'react';
import { useNavigate } from "react-router";

import './nav_button.css';
import HoverButton from './hover_button.jsx';

import homeImage from '../assets/home_logo.png'
import projectsImage from '../assets/projects_logo.png'
import cvImage from '../assets/cv_logo.png'
import resume from '../assets/resume.pdf'

export default function NavButton({ pageList }) {

  const hoverButtons = {
    home: <HoverButton onClick={() => navigate("/home")} image={homeImage} text="Home" />,
    projects: <HoverButton onClick={() => navigate("/projects")} image={projectsImage} text="Projects" />,
    cv: <HoverButton onClick={() => window.open(resume, '_blank', 'noopener,noreferrer')} image={cvImage} text="C.V." />
  }

  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <div className={`blur-overlay ${open ? 'active' : ''}`} onClick={() => setOpen(false)}></div>

      <button className="nav-button" onClick={() => setOpen(!open)}>
        ☰
      </button>

      {open && (
        <div className="nav-modal">
          <div className="button-row">
          {pageList.map((page) => (hoverButtons[page]))}
          </div>
        </div>
      )}
    </>
  );
}

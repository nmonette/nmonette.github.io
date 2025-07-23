import React from 'react';
import { useNavigate } from "react-router";

import './nav_button.css';

import homeImage from '../assets/home_logo.png';
import projectsImage from '../assets/projects_logo.png';
import cvImage from '../assets/cv_logo.png';
import resume from '../assets/resume.pdf';

export default function NavButton() {
  const navigate = useNavigate();

  return (
    <div className="vertical-nav">
      <button className="nav-icon-button" onClick={() => navigate("/home")}>
        <img src={homeImage} alt="Home" />
      </button>

      <button className="nav-icon-button" onClick={() => navigate("/projects")}>
        <img src={projectsImage} alt="Projects" />
      </button>

      <button
        className="nav-icon-button"
        onClick={() => window.open(resume, '_blank', 'noopener,noreferrer')}
      >
        <img src={cvImage} alt="C.V." />
      </button>
    </div>
  );
}

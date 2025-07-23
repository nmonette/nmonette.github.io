import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";

import './nav_button.css';

import homeImage from '../assets/home_logo.png';
import projectsImage from '../assets/projects_logo.png';
import cvImage from '../assets/cv_logo.png';
import resume from '../assets/resume.pdf';

export default function NavButton() {
  const navigate = useNavigate();
  const [isHorizontal, setIsHorizontal] = useState(false);

  useEffect(() => {
    function handleResize() {
      // Change breakpoint or logic here as needed
      setIsHorizontal(window.innerWidth < 600 || window.innerHeight < 500);
    }

    handleResize(); // initial check

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleNavigate = (path, e) => {
    navigate(path);
    e.currentTarget.blur();
  };

  const handleOpenResume = (e) => {
    window.open(resume, '_blank', 'noopener,noreferrer');
    e.currentTarget.blur();
  };

  return (
    <div className={isHorizontal ? "horizontal-nav" : "vertical-nav"}>
      <button className="nav-icon-button" onClick={(e) => handleNavigate("/home", e)}>
        <img src={homeImage} alt="Home" />
      </button>

      <button className="nav-icon-button" onClick={(e) => handleNavigate("/projects", e)}>
        <img src={projectsImage} alt="Projects" />
      </button>

      <button
        className="nav-icon-button"
        onClick={handleOpenResume}
      >
        <img src={cvImage} alt="C.V." />
      </button>
    </div>
  );
}

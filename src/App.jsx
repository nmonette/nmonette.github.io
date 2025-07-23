import './App.css'
import "./pages/hover_button.css"
import homeImage from './assets/home_logo.png'
import projectsImage from './assets/projects_logo.png'
import cvImage from './assets/cv_logo.png'
import resume from './assets/resume.pdf'

import Home from './pages/home.jsx'
import Projects from './pages/projects.jsx'

import { createHashRouter, RouterProvider } from "react-router";
import { useNavigate } from "react-router";

import HoverButton from './pages/hover_button.jsx';

function Navigator() {

  const navigate = useNavigate();

  return (
    <>
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh'
    }}>
      {/* <div style={{ color: '#f21a1a', fontSize:"100px"}}>Nathan Monette</div> */}
      <div style={{ color: 'white', fontSize:"100px"}}>Nathan Monette</div>
      <div className="button-row">
        <HoverButton onClick={() => navigate("/home")} image={homeImage} text="Home" />
        <HoverButton onClick={() => navigate("/projects")} image={projectsImage} text="Projects" />
        <HoverButton onClick={() => window.open(resume, '_blank', 'noopener,noreferrer')} image={cvImage} text="C.V." />
      </div>
      </div>
    </>
  )
}

function App() {
  const router = createHashRouter([
    {
        path: "/",
        element: <Navigator />,
    },
    {
        path: "home",
        element: <Home />,
    },
    {
      path: "projects",
      element: <Projects />,
    }
], {shimErrors: true}) 

   return (
        <RouterProvider router={router}  /> // basename={"/portfolio"}
   )
}



export default App

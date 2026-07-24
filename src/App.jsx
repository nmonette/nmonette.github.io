import { lazy, Suspense } from 'react'
import './App.css'
import "./pages/hover_button.css"
import homeImage from './assets/home_logo.png'
import projectsImage from './assets/projects_logo.png'
import blogImage from './assets/blog_logo.png'
import cvImage from './assets/cv_logo.png'
import playgroundImage from './assets/playground_logo.png'
import resume from './assets/cv.pdf'

import Home from './pages/home.jsx'
import Projects from './pages/projects.jsx'
import Blog from './pages/blog.jsx'
import BlogPost from './pages/blog_post.jsx'

import { createHashRouter, RouterProvider } from "react-router";
import { useNavigate } from "react-router";

import HoverButton from './pages/hover_button.jsx';

const Playground = lazy(() => import('./pages/playground.jsx'));
const BanditPlayground = lazy(() => import('./pages/bandit_playground.jsx'));
const OtherPlayground = lazy(() => import('./pages/other_playground.jsx'));

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
        <HoverButton onClick={() => navigate("/blog")} image={blogImage} text="Blog" />
        <HoverButton
          onClick={() => navigate("/playground/01")}
          image={playgroundImage}
          imageClassName="playground-logo"
          text="Playground"
        />
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
        path: "blog",
        element: <Blog />,
    },
    {
        path: "blog/:slug",
        element: <BlogPost />,
    },
    {
      path: "projects",
      element: <Projects />,
    },
    {
      path: "playground",
      element: (
        <Suspense fallback={<div className="route-loading">Loading playground…</div>}>
          <OtherPlayground />
        </Suspense>
      ),
    },
    {
      path: "playground/01",
      element: (
        <Suspense fallback={<div className="route-loading">Loading playground…</div>}>
          <OtherPlayground />
        </Suspense>
      ),
    },
    {
      path: "playground/02",
      element: (
        <Suspense fallback={<div className="route-loading">Loading playground…</div>}>
          <BanditPlayground />
        </Suspense>
      ),
    },
    {
      path: "playground/03",
      element: (
        <Suspense fallback={<div className="route-loading">Loading playground…</div>}>
          <Playground />
        </Suspense>
      ),
    }
], {shimErrors: true}) 

   return (
        <RouterProvider router={router}  /> // basename={"/portfolio"}
   )
}



export default App

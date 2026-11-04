import { lazy, Suspense } from 'react'
import face from './assets/face.jpeg'
import './App.css'
import PostList from './blog/PostList.jsx'

const Blog = lazy(() => import('./Blog.jsx'))

function App() {
  const path = window.location.pathname.replace(/\/+$/, '')

  if (path === '/blog' || path.startsWith('/blog/')) {
    return (
      <Suspense fallback={<main className="homepage">Loading…</main>}>
        <Blog slug={path === '/blog' ? undefined : path.slice('/blog/'.length)} />
      </Suspense>
    )
  }

  return (
    <main className="homepage">
      <header className="profile">
        <img
          className="profile-photo"
          src={face}
          alt="Nathan Monette"
          width="275"
          height="275"
        />
        <div className="profile-content">
          <h1>Nathan Monette</h1>
          <p className="profile-subtitle">
            Doctoral Student, Computer Science
            <br />
            New York University
          </p>
          <p className="profile-bio">
            I work on generalization in reinforcement learning with Eugene Vinitsky. Right now, I am interested in
            pretraining for generalist robotics agents.
            <span aria-hidden="true" style={{ display: 'block', height: '0.5em' }} />
            Previously, I was an intern and then MSc student of Jakob Foerster at the University of Oxford.
            During my time there I also worked on reinforcement learning, from the perspective of multi-agent systems and 
            autocurricula.
          </p>
          <nav className="profile-links" aria-label="Contact and profiles">
            <a href="mailto:nathanmonette1@gmail.com">email</a>
            <span aria-hidden="true">|</span>
            <a href="https://github.com/nmonette">github</a>
            <span aria-hidden="true">|</span>
            <a href="https://linkedin.com/in/nathan-monette/">linkedin</a>
            <span aria-hidden="true">|</span>
            <a href="https://scholar.google.com/citations?user=2OunUUcAAAAJ&hl=en">scholar</a>
            <span aria-hidden="true">|</span>
            <a href="https://x.com/nathanrmonette">x</a>
          </nav>
        </div>
      </header>

      <section className="publications" aria-labelledby="publications-heading">
        <h2 id="publications-heading">Selected Publications</h2>
        <article className="publication">
          <h3>
            <a href="https://arxiv.org/abs/2505.20659">
              An Optimisation Framework for Unsupervised Environment Design
            </a>
          </h3>
          <p className="publication-venue">
            Reinforcement Learning Conference 2025
          </p>
          <p className="publication-authors">
            <em>
              <strong>Nathan Monette</strong>, Alistair Letcher, Michael Beukman,
              Matthew T. Jackson, Alexander Rutherford, Alexander D. Goldie, Jakob
              N. Foerster
            </em>
          </p>
        </article>
      </section>
      <section className="publications" aria-labelledby="blog-heading">
        <h2 id="blog-heading">Blog</h2>
        <PostList />
      </section>
    </main>
  )
}

export default App

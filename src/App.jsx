import face from './assets/face.jpeg'
import './App.css'

function App() {
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
            I am a student of Eugene Vinitsky. My main research interest is
            generalization in reinforcement learning. Right now, this is taking the form of
            pretraining for generalist robotics policies.
            <div style={{ height: '0.5em' }} />
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
            <a href="https://scholar.google.com/citations?user=t_pLFtsAAAAJ&hl=en">scholar</a>
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
    </main>
  )
}

export default App

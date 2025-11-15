import face from '../assets/face.jpeg';
import "./home.css";
import ued_notes from '../assets/ued_notes.pdf'
import dags_paper from "../assets/dags_paper.pdf"
import NavButton  from "./nav_button.jsx";

function Home() {
    return (
        <>
        <div className="container">
            <div class="left-column">
                <img src={face} alt="Nathan Monette" class="profile-image" style={{width: "99.8%"}}/>
                <br/>
                <h2 style={{color: "black", fontSize: "26pt", margin: 5}}>Nathan Monette</h2>
                <i style={{margin: 5, color:"lightgrey"}} >[firstname] [lastname]1 at gmail dot com</i>
                <br/>
                <div style={{margin: 5}}>
                    <a href="https://github.com/nmonette" rel="noreferrer" target="_blank">GitHub</a>
                    <br/>
                    <a href="https://linkedin.com/in/nathan-monette/" rel="noreferrer" target="_blank">LinkedIn</a>
                    <br/>
                    <a href="https://x.com/nathanrmonette/" rel="noreferrer" target="_blank">X</a>
                    <br/>
                    <a href="https://scholar.google.com/citations?user=t_pLFtsAAAAJ&hl=en" rel="noreferrer" target="_blank">Scholar</a> 
                </div> 
            </div>

            <div class="right-column">
                <h1>About</h1>
                <h2>
                I'm currently an incoming master's student at the University of Oxford, pursuing a MSc in advanced computer science.
                <br/><br/>
                Previously I completed my BSc in computer science at the University of California Irvine, where I graduated with honors in June 2025.
                </h2>

                <h1>Research</h1>
                <h2>
                    I am working on <b>robust reinforcement learning</b> and its intersection with <b>game theory</b> and <b>curriculum design</b>. I am fortunate to be working under the supervision of prof. <a rel="noreferrer" target="_blank" href="https://www.jakobfoerster.com/" underline="hover">Jakob Foerster</a>.
                    <br/><br/>
                    During my undergrad I worked on <b>multi-agent reinforcement learning</b> and <b>game theory</b> with profs. <a rel="noreferrer" target="_blank" href="https://royf.org/" underline="hover">Roy Fox</a> and <a rel="noreferrer" target="_blank" href="https://panageas.github.io/" underline="hover">Ioannis Panageas</a>.
                </h2>

                <h1>News</h1>
                <h2>
                    <div><span style={{color: "#f21a1a"}}>[5/2025] </span>My first <a underline="hover" rel="noreferrer" target="_blank" href="https://arxiv.org/abs/2505.20659v1" >paper</a> (on unsupervised environment design) was accepted to the Reinforcement Learning Conference 2025! </div>
                    <div style={{marginTop: "8px"}}><span style={{color: "#f21a1a"}}>[9/2025] </span>Released some <a underline="hover" rel="noreferrer" target="_blank" href={ued_notes} >notes</a> on unsupervised environment design (UED).</div>
                    <div style={{marginTop: "8px"}}><span style={{marginTop: "0.0001px", color: "#f21a1a"}}>[11/2025] </span>New <a underline="hover" rel="noreferrer" target="_blank" href={dags_paper} >preprint!</a> on multi-agent RL.</div>
                </h2>
            </div>
            </div>
            <NavButton />
        </>
    )
}

export default Home;
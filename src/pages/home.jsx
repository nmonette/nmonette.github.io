import face from '../assets/face.jpeg';
import "./home.css";
import ued_notes from '../assets/ued_notes.pdf'
import NavButton  from "./nav_button.jsx";

function Home() {
    return (
        <>
        <div className="container">
            <div className="left-column">
                <img src={face} alt="Nathan Monette" className="profile-image"/>
                <br/>
                <h2 style={{fontSize: "26pt", margin: 5}}>Nathan Monette</h2>
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

            <div className="right-column">
                <h1>About</h1>
                <h2>
                I'm currently pursuing a MSc in advanced computer science at the University of Oxford.
                <div style={{ height: '0.5em' }} />
                Previously I completed my BSc in computer science at the University of California Irvine, where I graduated with honors in June 2025.
                </h2>

                <h1>Research</h1>
                <h2>
                    I am working on <b>curriculum</b> and <b>multi-agent</b> reinforcement learning with prof. <a rel="noreferrer" target="_blank" href="https://www.jakobfoerster.com/">Jakob Foerster</a>. 
                    <div style={{ height: '0.5em' }} />
                    During my undergrad I worked on <b>multi-agent reinforcement learning</b> and <b>game theory</b> with profs. <a rel="noreferrer" target="_blank" href="https://royf.org/">Roy Fox</a> and <a rel="noreferrer" target="_blank" href="https://panageas.github.io/">Ioannis Panageas</a>.
                </h2>
                <h1>News</h1>
                <h2>
                    <div ><span style={{marginTop: "0.0001px", color: "#ef4444"}}>[4/2026] </span>Will be starting my PhD at NYU in Autumn 2026!</div>
                    <div style={{marginTop: "8px"}}><span style={{color: "#ef4444"}}>[11/2025] </span>New <a rel="noreferrer" target="_blank" href="https://arxiv.org/abs/2605.14379" >preprint!</a> on multi-agent RL.</div>
                    <div style={{marginTop: "8px"}}><span style={{color: "#ef4444"}}>[10/2025] </span>Gave a talk at the 2025 London Open Endedness Summit hosted by <a rel="noreferrer" target="_blank" href="https://www.imperial.ac.uk/adaptive-intelligent-robotics/" >AIRL</a> (slides <a rel="noreferrer" target="_blank" href="https://docs.google.com/presentation/d/1Pm9gHyRE1yei96dhMb8_nd0m868zMowXOm2CwCpifjY/edit?usp=sharing" >here</a>).</div>
                    <div style={{marginTop: "8px"}}><span style={{color: "#ef4444"}}>[9/2025] </span>Released some <a rel="noreferrer" target="_blank" href={ued_notes} >notes</a> on unsupervised environment design (UED).</div>
                    <div style={{marginTop: "8px"}}><span style={{color: "#ef4444"}}>[5/2025] </span>My first <a rel="noreferrer" target="_blank" href="https://arxiv.org/abs/2505.20659v1" >paper</a> (on unsupervised environment design) was accepted to the Reinforcement Learning Conference 2025! </div>
                </h2>
            </div>
            </div>
            <NavButton />
        </>
    )
}

export default Home;
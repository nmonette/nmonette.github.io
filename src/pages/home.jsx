import face from '../assets/face.jpeg';
import "./home.css";

import NavButton  from "./nav_button";

function Home() {
    return (
        <>
            <div class="left-column">
                <img src={face} alt="Nathan Monette" class="profile-image" style={{width: "99.8%"}}/>
                <br/>
                <h2 style={{color: "black", fontSize: "26pt", margin: 5}}>Nathan Monette</h2>
                <i style={{margin: 5, color:"lightgrey"}} >[firstname] [lastname]1 at gmail dot com</i>
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
                    <span style={{color: "#f21a1a"}}>[5/2025] </span>My first <a underline="hover" rel="noreferrer" target="_blank" href="https://arxiv.org/abs/2505.20659v1" >paper</a> (on unsupervised environment design) was accepted to the Reinforcement Learning Conference 2025! 
                </h2>
            </div>
            <NavButton otherPage={{ url: "projects", title: "Projects" }} />
        </>
    )
}

export default Home;
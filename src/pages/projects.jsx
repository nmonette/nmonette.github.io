import "./projects.css";
import ncc from "../assets/ncc.svg"
import zot from "../assets/zot.jpeg"
import adv_team from "../assets/adv_team.png"

import NavButton  from "./nav_button.jsx";

function ProjectBox({ img, title, authors, conf, links, imgWidth }) {
  const authorFunc = (author, i) => {
    const name = author === "N. Monette" ? <b key={i}>{author}</b> : <span key={i}>{author}</span>;
    return [name, i < authors.length - 1 ? ', ' : ''];
  };

  return (
    <div className="project-box">
      <div className="left-column2">
        <img src={img} alt={title} style={{ maxWidth: imgWidth, clipPath: 'inset(3px)'}} />
      </div>
      <div className="right-column2">
        <h2>{title}</h2>
        <p>{authors.map(authorFunc)}</p>
        <em>{conf}</em>
        <div className="links">
          {links.map(link => (
            <><a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer">
              {link.title}
            </a><br/>
          </>))}
        </div>
      </div>
    </div>
  );
}


function Projects() {
    return (
        <>
        <NavButton />
        <div style={{marginTop: "30px"}}>
            <ProjectBox 
                img={ncc}
                title="An Optimisation Framework for Unsupervised Environment Design"
                authors = {["N. Monette", "A. Letcher", "M. Beukman", "M. Jackson", "A. Rutherford", "A. Goldie", "J. Foerster"]}
                conf="RLC 2025"
                links={[{url:"https://nmonette.github.io/optimising-ued/", title:"Project Site"}, {url: "https://arxiv.org/abs/2505.20659", title: "Paper"}, {url: "https://github.com/nmonette/NCC-UED", title: "GitHub"}]}
                imgWidth="100%"
            />
            <ProjectBox 
                img={adv_team}
                title="Learning Equilibria in Adversarial Team Markov Games (JAX Implementation)"
                authors = {["N. Monette", "(Paper by F. Kalogiannis, J. Yan, I. Panageas)"]}
                conf="NeurIPS 2024"
                links={[{url:"https://proceedings.neurips.cc/paper_files/paper/2024/file/a8bc668b1559d705221b0e7510c45e48-Paper-Conference.pdf", title:"Paper"}, {url: "https://github.com/nmonette/IPG-JAX-V2", title: "GitHub"}]}
                imgWidth="100%"
           />
           <ProjectBox 
                img={zot}
                title="ZotScheduler"
                authors = {["P. Cutter", "N. Monette", "R. Zhang"]}
                conf="HackUCI 2023 (Best AI Hack and 2nd-Place Overall)"
                links={[{url:"https://devpost.com/software/zotscheduler", title:"DevPost"}]}
                imgWidth="100%"
           />
        </div>
        </>
    )
}

export default Projects;
import { HomeBar } from "./components/toolbar";
import ProjectCard from "./components/projectCard";

import { Grid, Typography, Link, IconButton } from "@mui/material";
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import XIcon from '@mui/icons-material/X';


import face from "./IMG_6722.jpeg"
import peter from "./peter.jpeg"
import multigrid from "./Multigrid.png"
import ncc from "./ncc.svg"

import { createHashRouter, RouterProvider } from "react-router-dom";

function About() {
  return(
    <>
    <HomeBar />
    <Grid container  justifyContent="center" alignContent="center" columns={12} sx={{my:2, flexGrow: 1, overflowX:"hidden", overflowY: "hidden"}}>
      <Grid item  xs={12} >
        <Grid container columns={12} justifyContent="center" spacing={4} sx={{my:2}}>
          <Grid item xs={4}>
            <Typography sx={{fontFamily:"Helvetica"}} variant="h4" component="h4">Nathan Monette</Typography>
            <Typography sx={{fontFamily:"Helvetica"}} variant="body" component="em">[firstname] [lastname]1 at gmail dot com</Typography>
            <Typography sx={{fontFamily:"Helvetica", fontSize:18, mt:2}} variant="body" component="div">
              I'm currently a fourth-year undergraduate student at the University of California Irvine, pursuing a B.S. in computer science. 
              I specialize in intelligent systems, which is UCI's AI/ML emphasis.
            </Typography>
            <Typography sx={{fontFamily:"Helvetica", mt:"10pt"}} variant="h5" component="div"><b>Research</b></Typography>
            <Typography sx={{fontFamily:"Helvetica", fontSize:18, mt:1}} variant="body" component="div">
            At UC Irvine, I do research in <b>algorithmic game theory</b> and <b>multi-agent reinforcement learning</b> under prof. <Link rel="noreferrer" target="_blank" href="https://panageas.github.io/" underline="hover">Ioannis Panageas</Link>.
            </Typography>
            <Typography sx={{fontFamily:"Helvetica", fontSize:18, mt:1}} variant="body" component="div">
              <Typography sx={{color:"red"}} variant="body">As of 6/2024</Typography> I have joined <Link rel="noreferrer" target="_blank" href="https://foersterlab.com/" underline="hover">FLAIR</Link> as a research intern!
              I am working on <b>robust reinforcement learning</b> and its intersection with <b>game theory</b> and <b>curriculum design</b>. I am fortunate to be working under 
              the supervision of prof. <Link rel="noreferrer" target="_blank" href="https://www.jakobfoerster.com/" underline="hover">Jakob Foerster</Link> and <Link rel="noreferrer" target="_blank" href="https://matthewtjackson.com/" underline="hover">Matthew Jackson</Link>.
            </Typography>
            <Typography sx={{fontFamily:"Helvetica", fontSize:18, mt:1}} variant="body" component="div">
              <Typography sx={{color:"red"}} variant="body">As of 10/2024</Typography> I have begun working in the <Link rel="noreferrer" target="_blank" href="https://indylab.org/" underline="hover">indylab</Link> to work on leveraging 
              <b> offline</b> data to accelerate the learning of <b>large-scale</b> multi-agent systems under the supervision of prof. <Link rel="noreferrer" target="_blank" href="https://royf.org/" underline="hover">Roy Fox</Link> and <Link rel="noreferrer" target="_blank" href="https://jblanier.net/" underline="hover">JB Lanier</Link>.
            </Typography>
            <Typography sx={{fontFamily:"Helvetica", fontSize:18, mt:1}} variant="body" component="div">
              <Typography sx={{color:"blue"}} variant="body">News (5/2025)</Typography> My first <Link underline="hover" rel="noreferrer" target="_blank" href="https://arxiv.org/abs/2505.20659v1" >paper</Link> (on unsupervised environment design) was accepted to the Reinforcement Learning Conference 2025! 
            </Typography>
            <center>
                <IconButton size="large" href="https://github.com/nmonette" rel="noreferrer" target="_blank">
                  <GitHubIcon fontSize="inherit" />
                </IconButton>
                <IconButton size="large" href="https://linkedin.com/in/nathan-monette/" rel="noreferrer" target="_blank">
                  <LinkedInIcon fontSize="inherit" />
                </IconButton>
                <IconButton size="large" href="https://x.com/nathanrmonette/" rel="noreferrer" target="_blank">
                  <XIcon fontSize="inherit" />
                </IconButton>
            </center>
          </Grid>
          <Grid item xs={4}>
            <img src={face} alt="facePic" style={{width:400, height:400}} />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
    </>
  )
}

function Projects() {
  return (
    <>
      <HomeBar/>
      <Typography variant="h3" component="center" sx={{mt:10, fontFamily:"Helvetica"}}>Projects</Typography>
      <Grid container justifyContent="center" alignItems="center" columns={12} sx={{mb:40, mt:"10%"}} style={{ minHeight: '100vh', transform: 'scale(1.2)'}}>
        <ProjectCard width="100%" title="An Optimisation Framework for Unsupervised Environment Design" imageSrc={ncc} tags={["Environment Design", "Reinforcement Learning", "Optimization", "JAX"]} >
        <Typography variant="h7" component="left" sx={{mt:10, fontFamily:"Helvetica"}}><b>N. Monette</b>, A. Letcher, M. Beukman, M. Jackson, A. Rutherford, A. Goldie, J. Foerster</Typography><br/>
        <Typography variant="h7" component="left" sx={{mt:10, fontFamily:"Helvetica", fontStyle:"italic"}}>Reinforcement Learning Conference 2025</Typography>
        <br/><br/>
          {/* This work studies the optimization perspective of unsupervised environment design. Essentially, we learn a distribution over reinforcement learning tasks in order to 
          pursue a curriculum for the agent. We optimize such a distribution with gradients, and thus obtain convergence guarantees even when using neural networks for the
          agent. 
          <br/><br/>
          I was largely responsible for the code implementation of this paper, as well as the general ideas and writing. I also helped with the theory.
          <br/><br/> */}
          {<Link underline="hover" rel="noreferrer" target="_blank" href="https://nmonette.github.io/optimising-ued/" >Project Site.</Link>}<br/>
          {<Link underline="hover" rel="noreferrer" target="_blank" href="https://arxiv.org/abs/2505.20659v1" >Paper.</Link>}<br/>
          {<Link underline="hover" rel="noreferrer" target="_blank" href="https://github.com/nmonette/NCC-UED" >GitHub.</Link>}
        </ProjectCard>
        <ProjectCard width="50%" title="Learning Equilibria in Adversarial Team Markov Games (JAX Implementation)" imageSrc={multigrid} tags={["Game Theory", "Reinforcement Learning", 'Python', "JAX"]}>
        <Typography variant="h7" component="left" sx={{mt:10, fontFamily:"Helvetica"}}><b>N. Monette</b> (Paper by F. Kalogiannis, J. Yan, I. Panageas)</Typography><br/>
        <Typography variant="h10" component="left" sx={{mt:10, fontFamily:"Helvetica", fontStyle:"italic"}}>NeurIPS 2024</Typography>
          <br/><br/>
          {/* This was a paper recently put out by some people in my lab at UCI. It is the first paper that learns Nash Equilibria 
          in adversarial team Markov games. I implemented this paper's algorithm in JAX, which resulted in an efficient implementation.
          <br/><br/> */}
          {<Link underline="hover" rel="noreferrer" target="_blank" href="https://proceedings.neurips.cc/paper_files/paper/2024/file/a8bc668b1559d705221b0e7510c45e48-Paper-Conference.pdf" >Paper</Link>}.<br/>
          {<Link underline="hover" rel="noreferrer" target="_blank" href="https://github.com/nmonette/IPG-JAX-V2" >GitHub</Link>}.
        </ProjectCard>
        <ProjectCard width="100%" title="ZotScheduler" imageSrc={peter} tags={["Web Scraping", "Machine Learning", "Python", "JavaScript"]} >
          <Typography variant="h7" component="left" sx={{mt:10, fontFamily:"Helvetica"}}>P. Cutter, <b>N. Monette</b>, R. Zhang</Typography><br/>
          <Typography variant="h10" component="left" sx={{mt:10, fontFamily:"Helvetica", fontStyle:"italic"}}>HackUCI 2023 (Best AI Hack and 2nd-Place Overall)</Typography>
          <br/><br/>
          {/* ZotScheduler uses tree-ensemble regression models 
          and search algorithms to find the optimal schedule for a UCI student given a set of potential classes for the upcoming quarter.
          <br/><br/>
          I led the AI part of our project, culminating in a "Best AI Hack" award, as well as overall runner-up out of 60+ teams at HackUCI.
          <br/><br/> */}
        {<Link underline="hover" rel="noreferrer" target="_blank" href="https://devpost.com/software/zotscheduler" >Devpost.</Link>}
        </ProjectCard>
      </Grid>
    </>
  )
}

function App() {
  const router = createHashRouter([
    {
        path: "/",
        element: <About />,
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


export default App;

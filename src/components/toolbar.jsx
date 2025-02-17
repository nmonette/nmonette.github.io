import { Toolbar, AppBar, Button } from "@mui/material";
import { useNavigate } from "react-router";

import resume from "../resume.pdf";

export function HomeBar() {
    const navigate = useNavigate()
    return (
        <AppBar position="sticky" sx={{backgroundColor:"#a9a9a9"}}>
            <Toolbar>
                <Button color="inherit" onClick={() => navigate("/")} sx={{fontFamily:"Helvetica", fontSize:16}} >about</Button>
                <Button color="inherit"onClick={() => navigate("/projects")} sx={{fontFamily:"Helvetica", fontSize:16}} >projects</Button>
                <Button color="inherit"><a style={{fontFamily:"Helvetica", fontSize:16, textDecoration:"none", color:"white"}} rel="noreferrer" target="_blank" href={resume}>C.V.</a></Button>
            </Toolbar>
        </AppBar>
    ) 
}
import React from 'react';
import { Grid, Paper, Typography, Box, Chip } from '@mui/material';

const ProjectCard = ({ imageSrc, title, children, tags }) => {
  return (
      <Grid item xs={12} md={12} lg={12} sx={{mx:"20%", my:3}}>
        <Box sx={{ display: 'flex', justifyContent: 'center'}}>
          <Paper elevation={4} sx={{ p: 2 }}>
            <Grid container spacing={1} alignItems="center">
              <Grid item xs={12} md={6}>
                <img src={imageSrc} alt={title} style={{ width: '100%' }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ fontFamily: 'Helvetica' }}>
                  {title}
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'Helvetica' }}>
                  {children}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                {tags.map((tag) => <Chip label={tag} size="small" sx={{ mt: 0.5 }}/>)}
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </Grid>
  );
};

export default ProjectCard;

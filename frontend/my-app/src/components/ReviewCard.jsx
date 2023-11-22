import * as React from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

export default function ReviewCard ({ text, rating }) {

  return (
    <Paper
          sx={{
            p: 2,
            margin: 'auto',
            marginTop: '1%',
            marginBottom: '1%',
            maxWidth: '95%',
            flexGrow: 1,
            border: 1,
            borderColor: '#0c6dfd',
          }}
        >
          <Grid container spacing={2} alignItems={'center'}>
            <Grid item xs={12}>
              <Grid item xs container direction="column" spacing={2}>
                <Grid item xs>
                  <Typography gutterBottom variant="h5" component="div">
                    {text}
                  </Typography>
                  <Typography gutterBottom variant="subtitle1" component="div">
                    Overall Rating: {rating}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
    </Paper>
  )
}

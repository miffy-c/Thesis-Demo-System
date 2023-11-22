import * as React from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import CreateIcon from '@mui/icons-material/Create';
import PaidIcon from '@mui/icons-material/Paid';
import Typography from '@mui/material/Typography';
import { Button, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function SPCard ({name, rating, email, pubKey, socket}) {
  const navigate = useNavigate();

  const handleMoreInfo= () => {
    navigate(`/user/sp`, { state: { email }} );
  }

  const handleReview= () => {
    navigate(`/user/review`, { state: { email }}  );
  }

  const handleTransaction= () => {
    if (pubKey === '') {
      alert('Service Provider has not yet set up their account. Please try again later.')
    } else {
      socket.emit('transaction', email);
      navigate(`/user/transaction`,  { state: { email }});
    }

  }

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
            <Grid item xs={7}>
              <Grid item xs container direction="column" spacing={2}>
                <Grid item xs>
                  <Typography gutterBottom variant="h5" component="div">
                    {name}
                  </Typography>
                  <Typography gutterBottom variant="subtitle1" component="div">
                    Rating: {rating}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={3}>
              <Button variant='outlined' startIcon={<CreateIcon />}  sx={{ margin: '3%' }} onClick={handleReview}>Review</Button>
              <Button variant='outlined' startIcon={<PaidIcon />} onClick={handleTransaction}>Transaction</Button>
            </Grid>
            <Grid item xs={2}>
              <IconButton onClick={handleMoreInfo}>
                <KeyboardDoubleArrowRightIcon/>
                More information
              </IconButton>
            </Grid>
          </Grid>
    </Paper>
  )
}

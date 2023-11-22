import * as React from 'react';
import { styled } from '@mui/material/styles';
import { Button, FormGroup } from '@mui/material';
import Form from 'react-bootstrap/Form';
import CreateIcon from '@mui/icons-material/Create';
import PaidIcon from '@mui/icons-material/Paid';
import { useLocation, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { apiCall } from '../helper';
import ReviewCard from './ReviewCard';

const SPForm = styled('div')({
    padding: '2%',
    width: '70%',
    margin: 'auto',
    lineHeight: '8vh',
    '@media (max-width : 700px)': {
      width: '80%',
    }
  });

export default function SPInfo ({socket}) {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { email } = state;

    const [SP, setSP] = React.useState({});
    const [reviews, setReviews] = React.useState([]);

    React.useEffect(() => {
      async function getData () {
          const data = await apiCall('/sp/info/' + email, {}, 'GET');
          setSP(data.SPdetails)
          setReviews(data.SPdetails.reviews)
      }
      getData();
    }, [email]);

    const reviewList = reviews.map((r) =>
        <ReviewCard text={r.text} rating={r.rate}/>
    )

    const handleReview= () => {
        navigate(`/user/review`, { state: { email }}  );
    }
    
    const handleTransaction= () => {
        if (SP.pubK === '') {
            alert('Service Provider has not yet set up their account. Please try again later.')
        } else {
            socket.emit('transaction', email);
            navigate(`/user/transaction`,  { state: { email }});

        }
    }

    return (
        <div>
        <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between', padding: '1%', backgroundColor: '#0c6dfd' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
                <Typography variant='h5' sx={{ minWidth: 100, color: 'white' }}>Demo System</Typography>
            </Box>
        </Box>
        <SPForm>
            <h2>{SP.name}</h2>
            <Form>
            <FormGroup>
                <Form.Label><h4>Rating: {SP.rating}</h4></Form.Label>
            </FormGroup>
            <FormGroup>
                <Button
                variant='outlined'
                sx={{ marginBottom: '2%', width: '35%', marginLeft: '80%' }}
                startIcon={<CreateIcon />}
                onClick={handleReview}
                >
                    Review
                </Button>
            </FormGroup>
            <FormGroup>
                <Button variant='outlined'
                sx={{ width: '35%', marginLeft: '80%' }}
                startIcon={<PaidIcon />}
                onClick={handleTransaction}
                >
                    Transaction
                </Button>
             </FormGroup>
             <Form.Label><h4>Reviews:</h4></Form.Label>
            </Form>
            {reviewList}
        </SPForm>
        </div>
  )
}
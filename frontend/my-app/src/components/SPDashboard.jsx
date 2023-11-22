import * as React from 'react';
import { styled } from '@mui/material/styles';
import { FormGroup } from '@mui/material';
import Form from 'react-bootstrap/Form';
import { apiCall } from '../helper';
import ReviewCard from './ReviewCard';
import Button from '@mui/material/Button';
import fileDownload from 'js-file-download'

const SPForm = styled('div')({
    padding: '2%',
    width: '70%',
    margin: 'auto',
    lineHeight: '8vh',
    '@media (max-width : 700px)': {
      width: '80%',
    }
  });

export default function SPDashboard ({ email }) {
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

    const generateVC = async () => {
        const payload = {
            email: email,
        }
        const data = await apiCall('/sp/repVC', payload, 'POST');
        fileDownload(data, 'reputationVC.txt');
    }

    return (
        <div>
        <SPForm>
            <h2>{SP.name}</h2>
            <Form>
            <FormGroup>
                <Form.Label><h4>Rating: {SP.rating}</h4></Form.Label>
            </FormGroup>
            <FormGroup>
                <Button variant="outlined" style={{maxWidth: '70%', minWidth: '70%'}} onClick={generateVC} ><h5>Generate and Download Reputation Crendential</h5></Button>
            </FormGroup>
            <FormGroup>
                <Form.Label><h4>Contract: {SP.contract}</h4></Form.Label>
            </FormGroup>
            <FormGroup>
                <Form.Label><h4>Public Key: {SP.pubK}</h4></Form.Label>
            </FormGroup>
             <Form.Label><h4>Reviews:</h4></Form.Label>
            </Form>
            {reviewList}
        </SPForm>
        </div>
  )
}
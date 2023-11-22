import React from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiCall } from '../helper';
import TextField from '@mui/material/TextField';
import Slider from '@mui/material/Slider';

export default function ReviewForm () {
  const [token, setToken] = React.useState('');
  const [key, setKey] = React.useState('');
  const [text, setText] = React.useState('');
  const [rating, setRating] = React.useState(0);

  const { state } = useLocation();
  const { email } = state;
  const navigate = useNavigate();

  const marks = [
    {
      value: 0,
      label: '0',
    },
    {
      value: 1,
      label: '1',
    },
    {
      value: 2,
      label: '2',
    },
    {
      value: 3,
      label: '3',
    },
    {
        value: 4,
        label: '4',
    },
    {
        value: 5,
        label: '5',
    },
  ];

  function validateForm () {
    return token.length > 0 && text.length > 0
  }

  async function handleSubmit (e) {
    e.preventDefault();
    const payload = {
        text: text,
        token: token,
        rating: rating,
        email: email,
        key: key,
    }
    const data = await apiCall('/user/review', payload, 'POST');
    console.log(data)
    if (data === 'success') {
        alert('Review was sucessfully added!')
    } else {
        alert('Review was not sucessful, invalid token.')
    }
    navigate('/home/user');

  }

  return (
    <>
      <div className='register'>
        <h3>Review: </h3>
        <Form onSubmit={handleSubmit}>
          <Form.Group>
            <Form.Label>Textual Review</Form.Label><br/>
            <TextField
          id="outlined-multiline-static"
          multiline
          fullWidth
          rows={4}
          onChange={(e) => setText(e.target.value)}
        />
          </Form.Group>
          <Form.Group >
            <Form.Label>Rating</Form.Label>
            <Slider
            step={1}
            marks={marks}
            min={0}
            max={5}
            valueLabelDisplay="auto"
            onChange={(e) => setRating(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId='registerName'>
            <Form.Label>Review Token</Form.Label>
            <Form.Control
              type='name'
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId='registerName'>
            <Form.Label>Review Key</Form.Label>
            <Form.Control
              type='name'
              value={key}
              onChange={(e) => setKey(e.target.value)}
            />
          </Form.Group>
          <Button
            variant='primary'
            type='submit'
            disabled={!validateForm()}
            style={{ marginTop: '5%' }}
          >
            Submit
          </Button>
        </Form>
    </div>
    </>
  );
}

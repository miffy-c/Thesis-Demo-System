import React from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../helper';

export default function LoginForm () {
  const [emailVal, setEmail] = React.useState('');
  const [passwordVal, setPassword] = React.useState('');

  const navigate = useNavigate();

  function validateForm () {
    return emailVal.length > 0 && passwordVal.length > 0;
  }

  async function handleSubmit (e) {
    e.preventDefault();

    const payload = {
      email: emailVal,
      password: passwordVal,
    }
    
    const data = await apiCall('/auth/login', payload, 'POST');
    if (data) {
      localStorage.setItem('token', data.token);
      if (data.type === 'user') {
        navigate('/home/user');
      } else {
        navigate('/home/sp', { state: { email: emailVal }});
      }
    } else {
      alert('Please check that you have entered the correct email and password');
    }
  }

  // Source code from https://www.simplilearn.com/tutorials/reactjs-tutorial/login-page-in-reactjs
  return (
    <>
      <div className='login'>
        <h2>Log In</h2>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId='loginEmail'>
            <Form.Label>Email address</Form.Label>
            <Form.Control
              type='email'
              value={emailVal}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId='loginPassword'>
            <Form.Label>Password</Form.Label>
            <Form.Control
              type='password'
              value={passwordVal}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>
          <Button
            variant='primary'
            type='submit'
            disabled={!validateForm()}
          >
            Submit
          </Button>
        </Form>
        <div style={{ display: 'flex' }}>
            Don't have an account yet?
            <Button
              variant='link primary'
              type='button'
              value='Register'
              onClick={() => { navigate('/register') }}
            >
              Register Now
            </Button>
        </div>
    </div>
    </>
  );
}

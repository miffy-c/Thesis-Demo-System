import React from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../helper';

export default function RegisterForm () {
  const [emailVal, setEmail] = React.useState('');
  const [passwordVal, setPassword] = React.useState('');
  const [nameVal, setName] = React.useState('');
  const [typeVal, setType] = React.useState('');

  const navigate = useNavigate();

  function validateForm () {
    return emailVal.length > 0 && passwordVal.length > 0 && nameVal.length > 0;
  }

  async function handleSubmit (e) {
    e.preventDefault();

    const payload = {
      email: emailVal,
      password: passwordVal,
      name: nameVal,
      type: typeVal,
    }

    const data = await apiCall('/auth/register', payload, 'POST');
    if (data) {
      localStorage.setItem('token', data);
      if (typeVal === 'user') {
        navigate('/home/user');
      } else {
        navigate('/home/sp', { state: { email: emailVal }});
      }
    } else {
      alert('Email already exists, please enter a valid address');
    }

  }

  return (
    <>
      <div className='register'>
        <h2>Register</h2>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId='registerEmail'>
            <Form.Label>Email address</Form.Label>
            <Form.Control
              type='email'
              value={emailVal}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId='registerPassword'>
            <Form.Label>Password</Form.Label>
            <Form.Control
              type='password'
              value={passwordVal}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId='registerName'>
            <Form.Label>Name</Form.Label>
            <Form.Control
              type='name'
              value={nameVal}
              onChange={(e) => setName(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId='registerType'>
            <Form.Label>Joining as? </Form.Label>
            <br/>
            <select class="form-select form-select-lg mb-3" aria-label="Default select example" onChange={(e) => setType(e.target.value)}>
              <option selected="user"></option>
              <option value="user">User</option>
              <option value="sp">Service provider</option>
            </select>       
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
        <div style={{ display: 'flex' }}>
            Return to Login
            <Button
              variant='link primary'
              type='button'
              value='Login'
              onClick={() => { navigate('/login') }}
            >
              Back
            </Button>
        </div>
    </div>
    </>
  );
}

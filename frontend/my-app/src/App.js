import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import 'bootstrap/dist/css/bootstrap.min.css';

import Login from './components/Login';
import Register from './components/Register';
import UserHome from './components/UserHome';
import SPInfo from './components/SPInfo';
import ReviewForm from './components/ReviewForm';
import SPHome from './components/SPHome';
import Transaction from './components/Transaction';
import socketIO from 'socket.io-client';

function App() {
  const Form = styled('div')({
    padding: '2%',
    width: '30%',
    margin: 'auto',
    marginTop: '18vh',
    boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px',
    lineHeight: '7vh',
    '@media (max-width : 700px)': {
      width: '90%',
    }
  });

  const socket = socketIO.connect('http://localhost:5005');

return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='*' element={<Navigate to='/login'/>} />
          <Route path='/login' element={<Form><Login /></Form>}/>
          <Route path='/register' element={<Form><Register /></Form>}/>
          <Route path='/home/user' element={<UserHome socket={socket} />}/>
          <Route path='/user/sp' element={<SPInfo socket={socket} />}/>
          <Route path='/user/review' element={<Form><ReviewForm /></Form>}/>
          <Route path='/home/sp' element={<SPHome socket={socket}/>}/>
          <Route path='/user/transaction' element={<Form><Transaction socket={socket}/></Form>}/>
        </Routes>
      </BrowserRouter>
      <header>
      </header>
      <main>
      </main>
    </>
  )
}

export default App;

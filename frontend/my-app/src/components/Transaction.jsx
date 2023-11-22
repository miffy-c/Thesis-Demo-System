import React from 'react';
import TextField from '@mui/material/TextField';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../helper';
import fileDownload from 'js-file-download';
import { useLocation } from 'react-router-dom';

export default function Transaction ({socket}) {

    const { state } = useLocation();
    const { email } = state;

    const [d, setd] = React.useState({});
    const [key, setKey] = React.useState('');
    const navigate = useNavigate();

    React.useEffect(() => {
        async function getData () {
            socket.on('unblindedToken', (data) => {
                if (data.unblinded === 'error') {
                  alert('Not enough eth tokens to give review...');
                  navigate('/home/user');
                } else {
                  setd(data.unblinded)
                }
            });
        }
        getData();
    }, [socket, d, navigate]);

    React.useEffect(() => {
      async function getData () {
        socket.on('transactionToken', (data) => {
          setKey(data);
      });
      }
      getData();
    }, [socket]);

    const handleFinish = () => {
        navigate('/home/user')
      };

    const generateVC = async () => {
        const payload = {
            email: email,
            token: d,
        }
        const data = await apiCall('/user/tokenVC', payload, 'POST');
        fileDownload(data, 'tokenVC.txt');
    }

    const generateKeyVC = async () => {
      const payload = {
          email: email,
          key: key,
      }
      const data = await apiCall('/user/keyVC', payload, 'POST');
      fileDownload(data, 'keyVC.txt');
    }

    return (
      <>
        <h3>Transaction in Process...</h3>
        <h5>Key generated for this transaction:</h5>
        <TextField
          id="outlined-multiline-static"
          disabled={true}
          multiline
          rows={4}
          fullWidth
          defaultValue={key}
        > </TextField>
        <Button variant="outlined" onClick={generateKeyVC}>Download Key</Button>
        <br/>
        <br/>
        <h5>Please wait for the review token to be provided below:</h5>
        <TextField
          id="outlined-multiline-static"
          disabled={true}
          multiline
          rows={4}
          fullWidth
          defaultValue={d}
        > </TextField>
        <Button variant="outlined" onClick={generateVC}>Download Token</Button>
        <br/>
        <Button variant="contained" onClick={handleFinish}>Finish</Button>
      </>
    );
}

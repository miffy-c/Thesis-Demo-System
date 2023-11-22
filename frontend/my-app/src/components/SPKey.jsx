import * as React from 'react';
import { styled } from '@mui/material/styles';
import { FormGroup } from '@mui/material';
import Form from 'react-bootstrap/Form';
import { apiCall } from '../helper';
import Button from '@mui/material/Button';
import keyFile from './keyGenerator.txt'
import signFile from './sign.txt'
import {Link} from 'react-router-dom';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

const SPForm = styled('div')({
    padding: '2%',
    width: '70%',
    margin: 'auto',
    lineHeight: '8vh',
    '@media (max-width : 700px)': {
      width: '80%',
    }
  });

export default function SPKey ({ email }) {
    const [open, setOpen] = React.useState(false);
    const [pubK, setPubK] = React.useState('');

    const handleClickOpen = () => {
      setOpen(true);
    };
  
    const handleClose = () => {
      setOpen(false);
    };

    const handleUpload = async () => {
        const payload = {
            email: email,
            key: pubK,
        }
        const data = await apiCall('/sp/key', payload, 'POST');
        console.log(data)
        setOpen(false);
      };

    return (
        <div>
        <SPForm>
            <h2>Key Setup</h2>
            <h4>Please set up a RSA key pair for signing and giving reviews. This only needs to be set up once.</h4>
            <Form>
            <FormGroup>
                <Form.Label>
                    <h4>Key Generation File:</h4>
                    <Link to={keyFile} download="Key-Generator-File" target="_blank" rel="noreferrer">
                        <h5>DONWLOAD PROGRAM TO GENERATE KEYS</h5>
                    </Link>
                </Form.Label>
            </FormGroup>
            <FormGroup>
                <Form.Label>
                    <h4>Signing File:</h4>
                    <Link to={signFile} download="Signing-File" target="_blank" rel="noreferrer">
                        <h5>DOWNLOAD PROGRAM FOR SIGNING</h5>
                    </Link>
                </Form.Label>
            </FormGroup>
            <br/>
            <Button variant="outlined" onClick={handleClickOpen}><h5>Upload public key</h5></Button>
            </Form>
        </SPForm>
        <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Upload RSA Public Key</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please paste your public key in PEM format which can be obtained using the Key Generator file avaliable above.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="PEM Public Key"
            type="email"
            fullWidth
            variant="standard"
            onChange={(e) => setPubK(e.target.value)}
          />
            </DialogContent>
            <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleUpload}>Upload</Button>
            </DialogActions>
        </Dialog>
        </div>
  )
}
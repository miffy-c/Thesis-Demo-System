import * as React from 'react';
import { styled } from '@mui/material/styles';
import { FormGroup } from '@mui/material';
import Form from 'react-bootstrap/Form';
import Button from '@mui/material/Button';
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

export default function SPToken ({ email, token, socket, setTokenTab }) {
    const [open, setOpen] = React.useState(false);
    const [signedToken, setSignedToken] = React.useState('');

    const handleClickOpen = () => {
      setOpen(true);
    };
  
    const handleClose = () => {
      setOpen(false);
    };

    const handleUpload = async () => {
        const data = {
            email: email,
            token: signedToken,
        }
        socket.emit("token", data);
        setOpen(false);
        setTokenTab(true);
      };

    return (
        <div>
        <SPForm>
            <h2>Token Signature</h2>
            <h4>Please sign the token below in order to receive a review.</h4>
            <Form>
            <FormGroup>
                <Form.Label>
                    <h4>Token:</h4>
                    <TextField
                        id="outlined-multiline-static"
                        disabled={true}
                        multiline
                        defaultValue={token}
                        rows={4}
                        fullWidth
                    />
                </Form.Label>
            </FormGroup>
            <br/>
            <Button variant="outlined" onClick={handleClickOpen}><h5>Upload Signed Token</h5></Button>
            </Form>
        </SPForm>
        <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Upload Signed Token</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please paste the signed token which can be obtained using the file in the Key Setup section.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Signed Token"
            type="email"
            fullWidth
            variant="standard"
            onChange={(e) => setSignedToken(e.target.value)}
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
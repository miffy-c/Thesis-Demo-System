import * as React from 'react';
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import SettingsIcon from '@mui/icons-material/Settings';
import Logout from '@mui/icons-material/Logout';
import { useNavigate, useLocation } from 'react-router-dom';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import SPDashboard from './SPDashboard';
import SPKey from './SPKey';
import SPToken from './SPToken';

export default function SPHome ({socket}) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [tokenTab, setTokenTab] = React.useState(true);
  const [token, setToken] = React.useState('');

  const open = Boolean(anchorEl);
  const navigate = useNavigate();
  const { state } = useLocation();
  const { email } = state;

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleLogOut = () => {
    setAnchorEl(null);
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const [value, setValue] = React.useState('1');

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  React.useEffect(() => {
    async function getData () {
        socket.on('transactionBlinded', (data) => {
            setTokenTab(false)
            console.log(data)
            setToken(data);
        });
    }
    getData();
  }, [socket]);

  // Source code for dropdown menu: https://mui.com/material-ui/react-menu/
  return (
    <div>
        <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between', padding: '1%', backgroundColor: '#0c6dfd' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
                <Typography variant='h5' sx={{ minWidth: 100, color: 'white' }}>Demo System</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
                <Tooltip title="Account options">
                <IconButton
                    onClick={handleClick}
                    size="small"
                    sx={{ ml: 2 }}
                    aria-controls={open ? 'account-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                >
                    <SettingsIcon sx={{ width: 40, height: 40, color:'white' }}></SettingsIcon>
                </IconButton>
                </Tooltip>
            </Box>
        </Box>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleLogOut}>
          <ListItemIcon>
            <Logout fontSize="small"/>
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
      <Box sx={{ width: '100%', typography: 'body1' }}>
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={handleChange} aria-label="lab API tabs example">
            <Tab label="Dashboard" value="1" />
            <Tab label="Key Setup" value="2" />
            <Tab label="Token" disabled={tokenTab} value="3"></Tab>
          </TabList>
        </Box>
        <TabPanel value="1"><SPDashboard email={email}/></TabPanel>
        <TabPanel value="2"><SPKey email={email}/></TabPanel>
        <TabPanel value="3"><SPToken email={email} token={token} socket={socket} setTokenTab={setTokenTab}/></TabPanel>
      </TabContext>
    </Box>
    </div>
  );
}
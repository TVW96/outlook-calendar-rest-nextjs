import React, { useContext } from 'react';
import { Box, Typography, Button } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { withMsal } from '@azure/msal-react';
import { loginRequest, logoutRequest } from '@/utilities/authConfig';
import { AuthContext } from '@/context/AuthContext';
import { callMsGraph, getCalendarEvents } from '@/utilities/graph';

function LoginButton({ msalContext }) {
  const { saveAuthData } = useContext(AuthContext);
  const isAuthenticated = msalContext.accounts.length > 0;
  const msalInstance = msalContext.instance;

  if (isAuthenticated) {
    return <Button onClick={async () => {
      await msalInstance.logout(logoutRequest);
      localStorage.removeItem('msal.idtoken');
    }}
      sx={{
        color: 'white',
        backgroundColor: 'red',
        padding: '10px',
        borderRadius: '5px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '16px',
        margin: '10px'
      }}>Logout</Button>
  } else {
    return <Button onClick={async () => {
      const loginResponse = await msalInstance.loginPopup(loginRequest);
      const token = loginResponse.accessToken;
      const userInfo = await callMsGraph(token);
      const calendar = await getCalendarEvents(token);
      saveAuthData(token, userInfo, calendar);
    }}
      sx={{
        color: 'white',
        backgroundColor: 'green',
        padding: '10px',
        borderRadius: '5px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '16px',
        margin: '10px'
      }}>Login</Button>
  }
}

function Navbar({ token }) {
  return (
    <div>
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h4" component="div" sx={{ flexGrow: 1 }}>
              Navbar
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h4" component="div" sx={{ flexGrow: 1 }}>
              <LoginButton />
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </div>
  )
}

export default Navbar = withMsal(LoginButton);
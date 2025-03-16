'use client';
import { CardMedia, Card, Box, Button, Typography, CardHeader, CardContent } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import Image from "next/image";
import { styled, keyframes } from '@mui/material/styles';
import { useEffect } from "react";
import { useState } from "react";
import { useMsal } from "@azure/msal-react";
import { loginRequest, msalConfig, graphConfig } from "../utilities/authConfig";
import { callMsGraph, getCalendarEvents, updateCalendarEvent } from "../utilities/graph";

const scroll = keyframes`
  0% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(-100%);
  }
`;

const Title = styled(Typography)`
  white-space: nowrap;
  overflow: hidden;
  display: block;
  animation: ${props => (props.isHovered ? 'none' : `${scroll} 10s linear infinite`)};
  font-family: 'font-sans';
`;

export default function Home() {
  const [userToken, setUserToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const { instance } = useMsal();
  const [userInfo, setUserInfo] = useState(null);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [updatedEvent, setUpdatedEvent] = useState(null);

  const handleLogin = async () => {
    try {
      const response = await instance.loginPopup(loginRequest);
      // Set and store the user token
      setUserToken(response.accessToken);
      localStorage.setItem("msal.idtoken", response.accessToken);
      // Fetch user data
      const userData = await callMsGraph(response.accessToken);
      setUserInfo(userData);
      // Fetch calendar events
      const calendar = await getCalendarEvents(response.accessToken);
      setCalendarEvents(calendar);


      console.log("User data: ", userData);
      console.log("Calendar events: ", calendar);
    } catch (error) {
      console.error(error);
    }
  };

  // Delay the loading spinner for 1.5 seconds
  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  }, []);

  if (isLoading) {
    return (
      <Box
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const logout = async () => {
    try {
      await instance.logoutRedirect(logoutRequest);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box sx={{ backgroundImage: 'url(/knight-in-night.jpeg)', backgroundSize: 'cover', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <Box>
        <Typography
          variant="h1"
          id="title"
          sx={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            display: 'block',
            animation: 'scroll 10s linear infinite',
            fontFamily: 'font-sans',
          }}
        >
          Outlook REST Calendar
        </Typography>
      </Box>

      {userToken ? (
        <Card sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: "black", color: "white" }}>
          <CardHeader title="User Info" />
          <Typography variant="body1">Welcome, {userInfo?.displayName}</Typography>
          <Typography variant="body1">Email: {userInfo?.mail}</Typography>
        </Card>
      ) : (
        <Box>
          <Card sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: "black", color: "white" }}>
            <Button onClick={handleLogin}>
              <CardMedia
                image="/outlook_rest_calendar.png"
                title="testing the msal provider"
                sx={{ width: "400px", height: "200px" }}
              />
            </Button>
          </Card>
        </Box>
      )}
      <Box sx={{ marginTop: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ color: "yellow" }}>
            This app uses Microsoft Graph API to fetch user data and calendar events.
          </Typography>
        </Box>
        {calendarEvents.length > 0 && (
          <Box sx={{ marginTop: 4 }}>
            <Typography variant="h4" sx={{ color: "yellow", outline: "1px solid white", width: "fit-content", padding: 1 }}>
              Calendar Events

              <Box sx={{ height: "600px", overflowY: "scroll", display: "flex", flexDirection: "column-reverse" }}>
                {calendarEvents.map((event) => {
                  const startDate = new Date(event.start.dateTime);
                  const endDate = new Date(event.end.dateTime);
                  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
                  return (
                    <Box key={event.id} sx={{ marginTop: 2, width: "inherit" }}>
                      <Card sx={{ p: 2 }}>
                        <Typography variant="body1" fontWeight="bold" >{event.subject}</Typography>
                        <Typography variant="body2">{startDate.toLocaleDateString(undefined, options)}</Typography>
                        <Typography variant="body2">{endDate.toLocaleDateString(undefined, options)}</Typography>
                      </Card>
                    </Box>
                  );
                })}
              </Box>
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

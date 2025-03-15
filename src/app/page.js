'use client';
import { CardMedia, Card, Box, Button, Typography, CardHeader } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import Image from "next/image";
import { useEffect } from "react";
import { useState } from "react";
import { useMsal } from "@azure/msal-react";
import { loginRequest, msalConfig, graphConfig } from "../utilities/authConfig";
import { callMsGraph, getCalendarEvents, updateCalendarEvent } from "../utilities/graph";

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
      // Fetch user data and calendar events
      const userData = await callMsGraph(response.accessToken);
      setUserInfo(userData);
      const calendar = await getCalendarEvents(response.accessToken);
      setCalendarEvents(calendar);
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

  const calendar = calendarEvents && calendarEvents.length > 0 ? calendarEvents.map((event) => {
    return (
      <Card key={event.id}>
        <CardHeader title={event.subject} />
        <Typography variant="body1">Start Time: {event.start.dateTime}</Typography>
        <Typography variant="body1">End Time: {event.end.dateTime}</Typography>
        <Typography variant="body1">Location: {event.location.displayName}</Typography>
      </Card>
    )
  }) : [];

  const logout = async () => {
    try {
      await instance.logoutRedirect(logoutRequest);
    } catch (error) {
      console.error(error);
    }
  };

  // const titleElement = document.getElementById('title');
  // if (titleElement) {
  //   if (isHovered) {
  //     titleElement.style.animation = 'none';
  //   } else {
  //     titleElement.style.animation = 'scroll 10s linear infinite';
  //   }
  // }

  return (
    <Box sx={{ backgroundImage: 'url(/knight-in-night.jpeg)', backgroundSize: 'cover', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <Box
      // onMouseEnter={() => setIsHovered(true)}
      // onMouseLeave={() => setIsHovered(false)}
      // sx={{cursor: 'pointer'}}
      >
        <Typography
          variant="h1"
          id="title"
          sx={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            display: 'block',
            animation: isHovered ? 'none' : 'scroll 10s linear infinite',
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

          <Box sx={{ marginTop: 2 }}>
            {calendar.length > 0 ? (
              calendar
            ) : (
              <Typography variant="body1">No calendar events found.</Typography>
            )}
          </Box>
        </Box>
      )}
      <style jsx global>{`
        @keyframes scroll {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </Box>
  );
}

'use client';
import { CardMedia, Card, Box, Button, Typography, CardHeader, CardContent } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import Image from "next/image";
import { useEffect } from "react";
import { useState, useContext } from "react";
import { withMsal, useMsal, useIsAuthenticated } from "@azure/msal-react";
import { loginRequest, msalConfig, graphConfig } from "../utilities/authConfig";
import { callMsGraph, getCalendarEvents, updateCalendarEvent } from "../utilities/graph";
import Navbar from "../components/Navbar";
import { AuthContext } from "@/context/AuthContext";

export default function Home() {
  const { userToken, userInfo, calendar, setUserToken, setUserInfo, setCalendar } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);
  const { instance } = useMsal();
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [updatedEvent, setUpdatedEvent] = useState(null);

  const handleLogin = async () => {
    try {
      const response = await instance.loginPopup(loginRequest);
      // Set user token, info, and calendar events
      setUserToken(response.accessToken);
      const userData = await callMsGraph(response.accessToken);
      setUserInfo(userData);
      const calendarEvents = await getCalendarEvents(response.accessToken);
      setCalendar(calendarEvents);
    } catch (error) {
      console.error(error);
    }
  };

  // Check if user has authenticated into the App
  useEffect(() => {
    if (userToken && userInfo && calendar) {
      setCalendarEvents(calendar);
      console.log("User data: ", userInfo);
      console.log("Calendar: ", calendar);
      console.log("Calendar events: ", calendarEvents);

    } else {
      console.log("no user data");
    }
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, [userToken, userInfo, calendar]);

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

  return (
    <Box sx={{ backgroundImage: 'url(/knight-in-night.jpeg)', backgroundSize: 'cover', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0 }}>
        <Navbar token={userToken} />
      </div>
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
          The Outlook REST Calendar
        </Typography>
      </Box>

      {userInfo ? (
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
          <Box sx={{ marginTop: 4, display: "flex", flexdirection: "row", justifyContent: "space-between" }}>
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
            <Box>
              <Typography variant="h4" sx={{ color: "yellow", outline: "1px solid white", width: "fit-content", padding: 1 }}>
                Update Calendar Event
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}

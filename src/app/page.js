'use client';
import { CardMedia, Card, Box, Button, Typography, CardHeader, TextField } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import Image from "next/image";
import { useState, useContext, useEffect } from "react";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../utilities/authConfig";
import { callMsGraph, getCalendarEvents, updateCalendarEvent } from "../utilities/graph";
import Navbar from "../components/Navbar";
import { AuthContext } from "@/context/AuthContext";

export default function Home() {
  const { userToken, userInfo, calendar, setUserToken, setUserInfo, setCalendar } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);
  const { instance } = useMsal();
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [updatedEvent, setUpdatedEvent] = useState(null);
  const [onHover, setOnHover] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const toggleEventForm = () => {
    setIsFormVisible(!isFormVisible);
  };

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
    <Box sx={{ backgroundImage: 'url(/knight-in-night.jpeg)', backgroundSize: 'cover', height: '100%', minHeight: "100vh", width: "100%", display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <Box sx={{ position: 'fixed', top: 0, right: 0, zIndex: 1000 }}>
        <Navbar token={userToken} />
      </Box>
      <Box>
        <Typography
          id="title"
          sx={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            display: 'block',
            animation: 'scroll 10s linear infinite',
            fontFamily: 'font-sans',
            fontSize: '6rem',
          }}
        >
          The REST Calendar
        </Typography>
      </Box>

      {userInfo ? (
        <Card sx={{
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: "rgb(0,0,0, 0.5)", color: "white", p: 1, minHeight: "100px", width: "300px", margin: "0",
        }}>
          <CardHeader title="Welcome," />
          <Typography sx={{ fontFamily: "font-sans" }} variant="h5">{userInfo?.displayName}</Typography>
          {/* <Typography sx={{ fontSize: "16px" }}>Email: {userInfo?.mail}</Typography> */}
        </Card>
      ) : (
        <Box>
          <Card sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: "black", color: "white" }}>
            <Button onClick={handleLogin}>
              <CardMedia
                image="/outlook_rest_calendar.png"
                title="click to login"
                sx={{ width: "400px", height: "200px" }}
              />
            </Button>
          </Card>
          <Box>
            <Typography variant="h4" sx={{ color: "white", marginInline: 2, textWrap: "balance", textAlign: "center", maxWidth: "65ch", backgroundColor: "black", padding: 2 }}>
              This app uses the RESTful Microsoft Graph API to fetch uand update event information from within the Microsoft Outlook calendar service.
            </Typography>
          </Box>
        </Box>
      )
      }
      <Box sx={{ marginTop: 2 }}>
        {calendarEvents.length > 0 && (
          <Box sx={{ marginBlock: 4, marginInline: 2, display: "flex", flexdirection: "row", justifyContent: "space-between" }}>
            <Typography variant="h4" sx={{ color: "yellow", outline: "1px solid white", width: "fit-content", padding: 1 }}>
              Calendar Events
              <Box sx={{ height: "600px", overflowY: "scroll", display: "flex", flexDirection: "column-reverse" }}>
                {calendarEvents.map((event) => {
                  const startDate = new Date(event.start.dateTime);
                  const endDate = new Date(event.end.dateTime);
                  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
                  return (
                    <Box key={event.id} sx={{ marginTop: 2, width: "inherit" }}>
                      <Card
                        sx={{ p: 2, '&:hover': { backgroundColor: "white", color: "black", cursor: "pointer" }, backgroundColor: "black", color: "white" }}
                        onClick={() => setUpdatedEvent({ id: event.id, subject: event.subject, bodyPreview: event.bodyPreview, start: event.start, end: event.end })}
                      >
                        <Typography variant="body1" fontWeight="bold" >{event.subject}</Typography>
                        <Typography variant="body2">Start: {startDate.toLocaleDateString(undefined, options)}</Typography>
                        <Typography variant="body2">End: {endDate.toLocaleDateString(undefined, options)}</Typography>
                        <Typography variant="body2">Details: {event.bodyPreview}</Typography>
                      </Card>
                    </Box>
                  );
                })}
              </Box>
            </Typography>
            <Box sx={{ margin: 2, display: "flex", flexDirection: "column", justifyContent: "space-evenly", alignItems: "center" }}>
              <Button sx={{ marginInline: "100px", width: "200px", textTransform: "none", color: "yellow", outline: "1px solid white", padding: 1, '&:hover': { backgroundColor: "white", color: "blue", borderRadius: "5px", boxShadow: "black 5px 5px 5px" } }} onClick={toggleEventForm}>Update Calendar Event</Button>
              {isFormVisible && (
                <Box sx={{ backgroundColor: "white", color: "black", padding: 4, borderRadius: 2, boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.25)", zIndex: 1000 }}>
                  <TextField
                    label="Subject"
                    variant="outlined"
                    fullWidth
                    value={updatedEvent?.subject || ""}
                    onChange={(e) => setUpdatedEvent({ ...updatedEvent, subject: e.target.value })}
                  />
                  <TextField
                    label="Start Date"
                    variant="outlined"
                    fullWidth
                    value={updatedEvent?.start?.dateTime || ""}
                    onChange={(e) => setUpdatedEvent({ ...updatedEvent, start: { ...updatedEvent.start, dateTime: e.target.value } })}
                  />
                  <TextField
                    label="End Date"
                    variant="outlined"
                    fullWidth
                    value={updatedEvent?.end?.dateTime || ""}
                    onChange={(e) => setUpdatedEvent({ ...updatedEvent, end: { ...updatedEvent.end, dateTime: e.target.value } })}
                  />
                  <TextField
                    label="Body Preview"
                    variant="outlined"
                    fullWidth
                    value={updatedEvent?.bodyPreview || ""}
                    onChange={(e) => setUpdatedEvent({ ...updatedEvent, bodyPreview: e.target.value })}
                  />
                  <Box sx={{ marginTop: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => {
                        updateCalendarEvent(userToken, updatedEvent.id, updatedEvent);
                        setUpdatedEvent(null);
                        setIsFormVisible(false);
                      }}
                    >
                      Update Event
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => {
                        setIsFormVisible(false);
                      }}
                    >
                      Delete Event
                    </Button>
                  </Box>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => {
                      setUpdatedEvent(null);
                      setIsFormVisible(false);
                    }}
                  >
                    Cancel
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Box>
    </Box >
  );
}

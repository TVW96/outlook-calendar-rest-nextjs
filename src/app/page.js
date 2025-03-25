'use client';
import { CardMedia, Card, Box, Button, Typography, CardHeader, CardContent } from "@mui/material";
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
    <Box sx={{ backgroundImage: 'url(/knight-in-night.jpeg)', backgroundSize: 'cover', height: '100vh', width: "100vw", display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
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
          The Outlook REST Calendar
        </Typography>
      </Box>

      {userInfo ? (
        <Card sx={{
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: "black", color: "white", p: 1, minHeight: "100px", width: "300px", margin: "0",
        }}>
          <CardHeader title="User Info" />
          <Typography sx={{ fontSize: "16px" }}>Welcome, {userInfo?.displayName}</Typography>
          <Typography sx={{ fontSize: "16px" }}>Email: {userInfo?.mail}</Typography>
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
          <Typography variant="h4" sx={{ color: "yellow", marginInline: 2 }}>
            This app uses Microsoft Graph API to fetch user info and calendar events.
          </Typography>
        </Box>
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
                        onClick={() => setUpdatedEvent({ id: event.id, subject: event.subject, start: event.start, end: event.end })}
                      >
                        <Typography variant="body1" fontWeight="bold" >{event.subject}</Typography>
                        <Typography variant="body2">Start: {startDate.toLocaleDateString(undefined, options)}</Typography>
                        <Typography variant="body2">End: {endDate.toLocaleDateString(undefined, options)}</Typography>
                      </Card>
                    </Box>
                  );
                })}
              </Box>
            </Typography>
            <Box sx={{ margin: 2, display: "flex", flexDirection: "column", justifyContent: "space-evenly", alignItems: "center" }}>
              <Button sx={{ textTransform: "none", color: "yellow", outline: "1px solid white", padding: 1, '&:hover': { backgroundColor: "white", color: "blue", borderRadius: "5px", boxShadow: "black 5px 5px 5px" } }} onClick={toggleEventForm}>Update Calendar Event</Button>
              {isFormVisible && (
                <Box sx={{ backgroundColor: "white", color: "black", padding: 4, borderRadius: 2, boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.25)", zIndex: 1000 }}>
                  <Typography variant="h5" sx={{ marginBottom: 2 }}>Edit Calendar Event</Typography>
                  <form onSubmit={(e) => { e.preventDefault(); updatedEvent && updateCalendarEvent(userToken, updatedEvent).then(() => alert("Event updated successfully!")).catch(console.error).finally(() => setIsFormVisible(false)); }}>
                    {["id", "subject"].map((field) => (
                      <Box key={field} sx={{ marginBottom: 2 }}>
                        <Typography variant="body1">{field}:</Typography>
                        <input type="text" value={updatedEvent?.[field] || ""} onChange={(e) => setUpdatedEvent({ ...updatedEvent, [field]: e.target.value })} style={{ width: "100%", padding: "8px" }} required />
                      </Box>
                    ))}
                    {["start", "end"].map((field) => (
                      <Box key={field} sx={{ marginBottom: 2 }}>
                        <Typography variant="body1">{field} Date:</Typography>
                        <input type="datetime-local" value={updatedEvent?.[field]?.dateTime || ""} onChange={(e) => setUpdatedEvent({ ...updatedEvent, [field]: { dateTime: e.target.value } })} style={{ width: "100%", padding: "8px" }} required />
                      </Box>
                    ))}
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Button type="submit" variant="contained" color="primary">Update</Button>
                      <Button variant="contained" color="secondary" onClick={() => updatedEvent?.id && updateCalendarEvent(userToken, updatedEvent.id, true).then(() => alert("Event deleted successfully!")).catch(console.error).finally(() => setIsFormVisible(false))}>Delete</Button>
                    </Box>
                  </form>
                  <Button sx={{ marginTop: 2 }} onClick={() => setIsFormVisible(false)}>Close</Button>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}

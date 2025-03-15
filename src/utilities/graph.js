export const callMsGraph = async (accessToken) => {
    const response = await fetch("https://graph.microsoft.com/v1.0/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.json();
};

export const getCalendarEvents = async (accessToken) => {
    try {
        const response = await fetch("https://graph.microsoft.com/v1.0/me/events", {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = await response.json();
        return data.value; // Returns an array of events
    } catch (error) {

        console.error(error);
        if (error.name === "InteractionRequiredAuthError") {
            await instance.loginPopup(); // If silent token acquisition fails, prompt login
        }
        if (error.name === "Unauthorized") {
            await instance.loginPopup(); // If silent token acquisition fails, prompt login
        }
    }

    if (!response.ok) {
        throw new Error("Failed to fetch calendar events");
    }
};

export const updateCalendarEvent = async (
    accessToken,
    eventId,
    updatedData,
) => {
    const response = await fetch(
        `https://graph.microsoft.com/v1.0/me/events/${eventId}`,
        {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedData),
        },
    );

    if (!response.ok) {
        throw new Error("Failed to update the event");
    }

    return await response.json(); // Returns the updated event details
};
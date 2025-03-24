import React, { createContext, useState } from "react";

export const AuthContext = createContext({
    userToken: null,
    setUserToken: () => { }, // Ensure setUserToken is defined as a default function
    userInfo: null,
    setUserInfo: () => { },
    calendar: null,
    setCalendar: () => { },
});

export const AuthProvider = ({ children }) => {
    const [userToken, setUserToken] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [calendar, setCalendar] = useState([]);

    const saveAuthData = (token, user, calendar) => {
        setUserToken(token);
        setUserInfo(user);
        setCalendar(calendar);
    };

    return (
        <AuthContext.Provider value={{ userToken, setUserToken, userInfo, setUserInfo, calendar, setCalendar, saveAuthData }}>
            {children}
        </AuthContext.Provider>
    );
};
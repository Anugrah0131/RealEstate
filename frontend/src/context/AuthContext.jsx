import React, { Children, createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../config";
import { useNavigate } from "react-router-dom";
import { BiLogOut } from "react-icons/bi";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(
        localStorage.getItem("token") || sessionStorage.getItem("token") || null,
    );

    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if(token) {
            const storedUser =
            localStorage.getItem("user") || sessionStorage.getItem("user");
            if(storedUser) {
                setUser(JSON.parse(storedUser))
            }
        }

        const interceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (
                    error.response &&
                    error.response.status === 403 &&
                    error.response.data.message.includes("blocked")
                ) {
                    logout();
                }

                return Promise.reject(error);
            },
        );
        return () => axios.interceptors.response.eject(interceptor);

    }, [token]
);


    return <AuthContext.Provider>

    </AuthContext.Provider>
};

export const useAuth = () => useContext(AuthContext);

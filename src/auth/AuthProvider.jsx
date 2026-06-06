import { useEffect, useState } from "react";
import AuthContext from "./AuthContext";

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    async function logout() {
        try {
            await fetch(
                "http://localhost:5001/auth/logout",
                {
                    method: "POST",
                    credentials: "include"
                }
            );

            setUser(null);
            window.location.href = "/";
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const response = await fetch(
                    "http://localhost:5001/auth/me",
                    {
                        credentials: "include"
                    }
                );

                if (!response.ok) {
                    setUser(null);
                    return;
                }

                const userData = await response.json();
                setUser(userData);
            } catch (error) {
                console.error("Failed to fetch current user:", error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        fetchCurrentUser();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                loading,
                logout,
                isAuthenticated: !!user
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
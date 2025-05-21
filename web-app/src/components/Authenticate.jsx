import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { setToken } from "../services/localStorageService";
import { Box, CircularProgress, Typography } from "@mui/material";

export default function Authenticate() {
  const navigate = useNavigate();
  const [isLoggedin, setIsLoggedin] = useState(false);

  useEffect(() => {
    console.log(window.location.href);

    // Extract code and state from URL
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get('code');
    const returnedState = urlParams.get('state');
    
    // Get the stored state from sessionStorage
    const storedState = sessionStorage.getItem('oauth_state');
    
    // Clear the stored state
    sessionStorage.removeItem('oauth_state');
    
    // Verify state parameter to prevent CSRF attacks
    if (authCode && returnedState && returnedState === storedState) {
      // State is valid, proceed with authentication
      fetch(
        `http://localhost:8080/identity/auth/outbound/authentication?code=${authCode}`,
        {
          method: "POST",
        }
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error('Authentication failed');
          }
          return response.json();
        })
        .then((data) => {
          console.log(data);

          setToken(data.result?.token);
          setIsLoggedin(true);
        })
        .catch((error) => {
          console.error('Authentication error:', error);
          // Redirect to login page after a short delay
          setTimeout(() => navigate('/login'), 2000);
        });
    } else if (authCode) {
      // State validation failed - potential CSRF attack
      console.error('OAuth state validation failed');
      // Redirect to login page after a short delay
      setTimeout(() => navigate('/login'), 2000);
    } else {
      // No auth code in URL, redirect to login
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (isLoggedin) {
      navigate("/");
    }
  }, [isLoggedin, navigate]);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "30px",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress></CircularProgress>
        <Typography>Authenticating...</Typography>
      </Box>
    </>
  );
}

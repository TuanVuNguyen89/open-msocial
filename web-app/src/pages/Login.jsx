import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  TextField,
  Typography,
  Snackbar,
  Alert,
  Container,
  Paper,
  InputAdornment,
  Avatar,
  useTheme,
  IconButton,
} from "@mui/material";

import GoogleIcon from "@mui/icons-material/Google";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import LoginIcon from "@mui/icons-material/Login";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logIn, isAuthenticated } from "../services/authenticationService";
import { OAuthConfig } from "../configurations/configuration";

export default function Login() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [showPassword, setShowPassword] = useState(false);

  const handleCloseSnackBar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setSnackBarOpen(false);
  };

  const handleGoogleLogin = () => {
    // Generate a random state value for CSRF protection
    const state = Math.random().toString(36).substring(2, 15) + 
                 Math.random().toString(36).substring(2, 15);
    
    // Store the state in sessionStorage to verify when the user returns
    sessionStorage.setItem('oauth_state', state);
    
    // Construct the authorization URL
    const scope = 'openid email profile';
    const authUrl = `${OAuthConfig.authUri}?` +
      `client_id=${OAuthConfig.clientId}` +
      `&redirect_uri=${encodeURIComponent(OAuthConfig.redirectUri)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent(scope)}` +
      `&state=${state}` +
      `&access_type=offline` +
      `&prompt=consent`;
    
    // Redirect the user to the authorization URL
    window.location.href = authUrl;
  };

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/");
    }
  }, [navigate]);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await logIn(username, password);
      console.log("Response body:", response.data);
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
      // Safely access error response data
      const errorMessage = error.response?.data?.message || "Login failed. Please try again.";
      setSnackBarMessage(errorMessage);
      setSnackBarOpen(true);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.8,
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 }
  };

  return (
    <>
      <Snackbar
        open={snackBarOpen}
        onClose={handleCloseSnackBar}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackBar}
          severity="error"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackBarMessage}
        </Alert>
      </Snackbar>
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #6B73FF 0%, #000DFF 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 3
        }}
      >
        <Container maxWidth="sm">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <Paper
              elevation={10}
              sx={{
                borderRadius: 4,
                overflow: "hidden",
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)",
              }}
            >
              <Box
                sx={{
                  p: 4,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <motion.div variants={itemVariants}>
                  <Avatar
                    sx={{
                      m: 1,
                      bgcolor: "primary.main",
                      width: 70,
                      height: 70,
                    }}
                  >
                    <LoginIcon fontSize="large" />
                  </Avatar>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <Typography 
                    variant="h4" 
                    component="h1" 
                    gutterBottom 
                    fontWeight="bold"
                    textAlign="center"
                    sx={{ 
                      mb: 3,
                      background: "linear-gradient(45deg, #6B73FF 30%, #000DFF 90%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent"
                    }}
                  >
                    Welcome to Open MSocial
                  </Typography>
                </motion.div>

                <Box
                  component="form"
                  onSubmit={handleSubmit}
                  sx={{ width: "100%" }}
                >
                  <motion.div variants={itemVariants}>
                    <TextField
                      label="Username"
                      variant="outlined"
                      fullWidth
                      margin="normal"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': {
                            borderColor: theme.palette.primary.main,
                          },
                        },
                      }}
                    />
                  </motion.div>
                  
                  <motion.div variants={itemVariants}>
                    <TextField
                      label="Password"
                      type={showPassword ? "text" : "password"}
                      variant="outlined"
                      fullWidth
                      margin="normal"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon color="primary" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={togglePasswordVisibility}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': {
                            borderColor: theme.palette.primary.main,
                          },
                        },
                      }}
                    />
                  </motion.div>
                  
                  <motion.div 
                    variants={itemVariants}
                    style={{ marginTop: 24, marginBottom: 16 }}
                  >
                    <motion.div
                      whileHover="hover"
                      whileTap="tap"
                      variants={buttonVariants}
                    >
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        onClick={handleSubmit}
                        fullWidth
                        sx={{
                          borderRadius: 2,
                          py: 1.5,
                          background: "linear-gradient(45deg, #6B73FF 30%, #000DFF 90%)",
                          boxShadow: "0 3px 5px 2px rgba(0, 13, 255, .3)",
                          fontWeight: "bold",
                          textTransform: "none",
                          fontSize: "1.1rem"
                        }}
                      >
                        Sign In
                      </Button>
                    </motion.div>
                  </motion.div>
                </Box>
                
                <motion.div variants={itemVariants} style={{ width: "100%" }}>
                  <Divider sx={{ my: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      OR
                    </Typography>
                  </Divider>
                </motion.div>

                <Box sx={{ width: "100%", mt: 1 }}>
                  <motion.div 
                    variants={itemVariants}
                    style={{ marginBottom: 16 }}
                  >
                    <motion.div
                      whileHover="hover"
                      whileTap="tap"
                      variants={buttonVariants}
                    >
                      <Button
                        type="button"
                        variant="outlined"
                        size="large"
                        onClick={handleGoogleLogin}
                        fullWidth
                        startIcon={<GoogleIcon />}
                        sx={{
                          borderRadius: 2,
                          py: 1.5,
                          borderColor: "#DB4437",
                          color: "#DB4437",
                          '&:hover': {
                            borderColor: "#DB4437",
                            backgroundColor: "rgba(219, 68, 55, 0.04)",
                          },
                          textTransform: "none",
                          fontWeight: "medium",
                          fontSize: "1rem"
                        }}
                      >
                        Continue with Google
                      </Button>
                    </motion.div>
                  </motion.div>
                  
                  <motion.div variants={itemVariants}>
                    <motion.div
                      whileHover="hover"
                      whileTap="tap"
                      variants={buttonVariants}
                    >
                      <Button
                        type="button"
                        variant="outlined"
                        size="large"
                        onClick={() => navigate('/register')}
                        fullWidth
                        sx={{
                          borderRadius: 2,
                          py: 1.5,
                          borderColor: theme.palette.success.main,
                          color: theme.palette.success.main,
                          '&:hover': {
                            borderColor: theme.palette.success.main,
                            backgroundColor: "rgba(76, 175, 80, 0.04)",
                          },
                          textTransform: "none",
                          fontWeight: "medium",
                          fontSize: "1rem"
                        }}
                      >
                        Create a new account
                      </Button>
                    </motion.div>
                  </motion.div>
                </Box>
              </Box>
            </Paper>
          </motion.div>
        </Container>
      </Box>
    </>
  );
}

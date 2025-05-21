import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton
} from "@mui/material";
// Using native date input instead of date-fns and mui date picker
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { registration } from "../services/userService";
import Scene from "./Scene";

export default function Registration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    firstName: "",
    lastName: "",
    dob: null,
    city: ""
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing again
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  // Handle date change
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user changes date
    if (errors.dob) {
      setErrors({
        ...errors,
        dob: null
      });
    }
  };

  // Toggle password visibility
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Toggle confirm password visibility
  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    // Username validation - at least 4 characters
    if (!formData.username || formData.username.length < 4) {
      newErrors.username = "Username must be at least 4 characters";
    }
    
    // Password validation - at least 6 characters
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    // Date of birth validation
    if (formData.dob) {
      // Check if date is valid
      const dobDate = new Date(formData.dob);
      if (isNaN(dobDate.getTime())) {
        newErrors.dob = "Invalid date format";
      } else {
        // Check if user is at least 10 years old
        const today = new Date();
        const minAgeDate = new Date(today.getFullYear() - 10, today.getMonth(), today.getDate());
        if (dobDate > minAgeDate) {
          newErrors.dob = "You must be at least 10 years old";
        }
        
        // Check if date is in the future
        if (dobDate > today) {
          newErrors.dob = "Date of birth cannot be in the future";
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setServerError(null);
    
    try {
      // Date is already in yyyy-MM-dd format from the input
      const formattedDob = formData.dob;
      
      // Prepare request data
      const requestData = {
        ...formData,
        dob: formattedDob
      };
      
      // Call registration API
      await registration(requestData);
      
      // Show success message
      setSuccess(true);
      
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("Registration error:", error);
      
      // Handle specific error messages from server
      if (error.response?.data?.message) {
        switch (error.response.data.message) {
          case "USERNAME_INVALID":
            setErrors({ ...errors, username: "Username is invalid" });
            break;
          case "INVALID_PASSWORD":
            setErrors({ ...errors, password: "Password is invalid" });
            break;
          case "INVALID_EMAIL":
            setErrors({ ...errors, email: "Email is invalid" });
            break;
          case "EMAIL_IS_REQUIRED":
            setErrors({ ...errors, email: "Email is required" });
            break;
          case "INVALID_DOB":
            setErrors({ ...errors, dob: "Date of birth is invalid" });
            break;
          default:
            setServerError(error.response.data.message || "Registration failed. Please try again.");
        }
      } else {
        setServerError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Scene>
      <Card
        sx={{
          minWidth: 350,
          maxWidth: 500,
          margin: "auto",
          mt: 6,
          p: 4,
          boxShadow: 4,
          borderRadius: 3,
        }}
      >
        <Typography
          sx={{
            fontSize: 24,
            fontWeight: 600,
            mb: 2,
            textAlign: "center",
          }}
        >
          Create an Account
        </Typography>
        
        <Divider sx={{ mb: 3 }} />
        
        {serverError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {serverError}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Registration successful! Redirecting to login...
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* Username */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                error={Boolean(errors.username)}
                helperText={errors.username}
                disabled={loading || success}
                required
              />
            </Grid>
            
            {/* Password */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                error={Boolean(errors.password)}
                helperText={errors.password}
                disabled={loading || success}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleTogglePasswordVisibility}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            
            {/* Confirm Password */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Confirm Password"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                error={Boolean(errors.confirmPassword)}
                helperText={errors.confirmPassword}
                disabled={loading || success}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleToggleConfirmPasswordVisibility}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            
            {/* Email */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={Boolean(errors.email)}
                helperText={errors.email}
                disabled={loading || success}
                required
              />
            </Grid>
            
            {/* First Name */}
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                disabled={loading || success}
              />
            </Grid>
            
            {/* Last Name */}
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                disabled={loading || success}
              />
            </Grid>
            
            {/* Date of Birth */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Date of Birth (yyyy-MM-dd)"
                name="dob"
                type="date"
                value={formData.dob || ''}
                onChange={handleDateChange}
                error={Boolean(errors.dob)}
                helperText={errors.dob || 'Format: yyyy-MM-dd'}
                disabled={loading || success}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            
            {/* City */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                disabled={loading || success}
              />
            </Grid>
            
            {/* Submit Button */}
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading || success}
                sx={{ mt: 2, py: 1.2 }}
              >
                {loading ? <CircularProgress size={24} /> : "Register"}
              </Button>
            </Grid>
          </Grid>
        </form>
        
        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Typography variant="body2">
            Already have an account?{" "}
            <Link to="/login" style={{ textDecoration: "none" }}>
              Login here
            </Link>
          </Typography>
        </Box>
      </Card>
    </Scene>
  );
}

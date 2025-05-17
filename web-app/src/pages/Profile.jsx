import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CircularProgress,
  Typography,
  Grid,
  Divider,
  Button,
  TextField,
  Snackbar,
  Alert,
  Stack,
  IconButton,
  Tooltip,
  Paper
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import EditIcon from "@mui/icons-material/Edit";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import { getMyInfo, updateProfile } from "../services/userService";
import { isAuthenticated, logOut } from "../services/authenticationService";
import Scene from "./Scene";

export default function Profile() {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const getUserDetails = async () => {
    try {
      const response = await getMyInfo();
      const data = response.data;
      setUserDetails(data.result);
      setFormData(data.result);
    } catch (error) {
      if (error.response?.status === 401) {
        logOut();
        navigate("/login");
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      await updateProfile(formData);
      setUserDetails(formData);
      setIsEditing(false);
      setAlert({
        open: true,
        message: 'Profile updated successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      setAlert({
        open: true,
        message: error.response?.data?.message || 'Failed to update profile',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(userDetails);
    setIsEditing(false);
  };

  const handleCloseAlert = () => {
    setAlert({
      ...alert,
      open: false
    });
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
    } else {
      getUserDetails();
    }
  }, [navigate]);

  const renderField = (label, field, value) => {
    if (isEditing) {
      return (
        <Grid container spacing={1} sx={{ py: 1 }}>
          <Grid item xs={4}>
            <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{label}</Typography>
          </Grid>
          <Grid item xs={8}>
            <TextField
              fullWidth
              size="small"
              name={field}
              value={formData[field] || ''}
              onChange={handleInputChange}
              disabled={field === 'username' || field === 'email'}
            />
          </Grid>
        </Grid>
      );
    }
    return (
      <Grid container spacing={1} sx={{ py: 1 }}>
        <Grid item xs={4}>
          <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{label}</Typography>
        </Grid>
        <Grid item xs={8}>
          <Typography sx={{ fontSize: 14 }}>{value || "-"}</Typography>
        </Grid>
      </Grid>
    );
  };

  return (
    <Scene>
      {userDetails ? (
        <Card
          sx={{
            minWidth: 350,
            maxWidth: 600,
            margin: "auto",
            mt: 6,
            p: 4,
            boxShadow: 4,
            borderRadius: 3,
          }}
        >
          <Typography
            sx={{
              fontSize: 20,
              fontWeight: 600,
              mb: 1,
              textAlign: "center",
            }}
          >
            Welcome back to Open MSocial, {userDetails.username}!
          </Typography>
          
          {/* Small subtle icons under welcome message */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
            {isEditing ? (
              <>
                <Tooltip title="Cancel" arrow placement="top">
                  <IconButton 
                    color="error" 
                    onClick={handleCancel}
                    disabled={isLoading}
                    size="small"
                  >
                    <CancelIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Save Changes" arrow placement="top">
                  <IconButton 
                    color="primary" 
                    onClick={handleSubmit}
                    disabled={isLoading}
                    size="small"
                  >
                    {isLoading ? <CircularProgress size={16} /> : <SaveIcon fontSize="small" />}
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              <Tooltip title="Edit Profile" arrow placement="top">
                <IconButton 
                  color="primary" 
                  onClick={() => setIsEditing(true)}
                  size="small"
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            
            <Tooltip title="View My Friends" arrow placement="top">
              <IconButton 
                color="primary" 
                onClick={() => navigate('/friends')}
                size="small"
              >
                <PeopleIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="View Pending Requests" arrow placement="top">
              <IconButton 
                color="secondary" 
                onClick={() => navigate('/pending-requests')}
                size="small"
              >
                <PersonAddIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          {renderField("Username", "username", userDetails.username)}
          {renderField("Email", "email", userDetails.email)}
          {renderField("First Name", "firstName", userDetails.firstName)}
          {renderField("Last Name", "lastName", userDetails.lastName)}
          {renderField("Date of Birth", "dob", userDetails.dob)}
          {renderField("City", "city", userDetails.city)}
          

        </Card>
      ) : (
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
          <CircularProgress />
          <Typography>Loading ...</Typography>
        </Box>
      )}
      <Snackbar 
        open={alert.open} 
        autoHideDuration={6000} 
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseAlert} severity={alert.severity}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Scene>
  );
}

import { useEffect, useState, useRef } from "react";
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
  Paper,
  Avatar,
  Badge
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import EditIcon from "@mui/icons-material/Edit";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import ImageIcon from "@mui/icons-material/Image";
import { getMyInfo, updateProfile } from "../services/userService";
import { isAuthenticated, logOut } from "../services/authenticationService";
import { uploadMedia } from "../services/mediaService";
import Scene from "./Scene";

export default function Profile() {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBackground, setUploadingBackground] = useState(false);
  const avatarInputRef = useRef(null);
  const backgroundInputRef = useRef(null);
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

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUploadingAvatar(true);
      
      // Validate file type and size before uploading
      const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validImageTypes.includes(file.type)) {
        throw new Error('Please upload a valid image file (JPEG, PNG, GIF, WEBP)');
      }
      
      // 5MB max size
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image size should be less than 5MB');
      }
      
      const formData = new FormData();
      formData.append('file', file);

      const response = await uploadMedia(file);
      const mediaData = response.data.result;
      
      // Update user profile with new avatar URL
      const updatedProfile = {
        ...userDetails,
        avatarUrl: mediaData.url
      };
      
      await updateProfile(updatedProfile);
      setUserDetails(updatedProfile);
      setFormData(updatedProfile);
      
      setAlert({
        open: true,
        message: 'Profile picture updated successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setAlert({
        open: true,
        message: error.response?.data?.message || error.message || 'Failed to upload profile picture',
        severity: 'error'
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleBackgroundUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUploadingBackground(true);
      
      // Validate file type and size before uploading
      const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validImageTypes.includes(file.type)) {
        throw new Error('Please upload a valid image file (JPEG, PNG, GIF, WEBP)');
      }
      
      // 10MB max size for background (larger than avatar)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Image size should be less than 10MB');
      }
      
      const formData = new FormData();
      formData.append('file', file);

      const response = await uploadMedia(file);
      const mediaData = response.data.result;
      
      // Update user profile with new background URL
      const updatedProfile = {
        ...userDetails,
        backgroundUrl: mediaData.url
      };
      
      await updateProfile(updatedProfile);
      setUserDetails(updatedProfile);
      setFormData(updatedProfile);
      
      setAlert({
        open: true,
        message: `Background image (${mediaData.originalFilename}) uploaded successfully!`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error uploading background:', error);
      setAlert({
        open: true,
        message: error.response?.data?.message || error.message || 'Failed to upload background image',
        severity: 'error'
      });
    } finally {
      setUploadingBackground(false);
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
            p: 0,
            boxShadow: 4,
            borderRadius: 3,
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          {/* Background Image */}
          <Box
            sx={{
              height: 150,
              width: '100%',
              backgroundImage: userDetails.backgroundUrl ? `url(${userDetails.backgroundUrl})` : 'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative',
            }}
          >
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              ref={backgroundInputRef}
              onChange={handleBackgroundUpload}
            />
            <IconButton
              sx={{
                position: 'absolute',
                bottom: 8,
                right: 8,
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.9)' },
              }}
              onClick={() => backgroundInputRef.current.click()}
              disabled={uploadingBackground}
            >
              {uploadingBackground ? <CircularProgress size={24} /> : <ImageIcon />}
            </IconButton>
          </Box>

          {/* Avatar */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: -5, mb: 2 }}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <IconButton
                  sx={{ backgroundColor: 'white', '&:hover': { backgroundColor: '#f5f5f5' } }}
                  size="small"
                  onClick={() => avatarInputRef.current.click()}
                  disabled={uploadingAvatar}
                >
                  {uploadingAvatar ? <CircularProgress size={16} /> : <PhotoCameraIcon fontSize="small" />}
                </IconButton>
              }
            >
              <Tooltip title={userDetails.avatarUrl ? "Click to change profile picture" : "Upload a profile picture"} arrow>
                <Avatar
                  src={userDetails.avatarUrl}
                  sx={{ 
                    width: 100, 
                    height: 100, 
                    border: '4px solid white',
                    cursor: 'pointer',
                    '&:hover': { opacity: 0.9 }
                  }}
                  onClick={() => avatarInputRef.current.click()}
                >
                  {userDetails.firstName?.charAt(0) || userDetails.username?.charAt(0)}
                </Avatar>
              </Tooltip>
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                ref={avatarInputRef}
                onChange={handleAvatarUpload}
              />
            </Badge>
          </Box>

          <Box sx={{ px: 4, pb: 4 }}>
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
          </Box>
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

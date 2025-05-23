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
  Container,
  IconButton,
  Tooltip,
  Avatar,
  Badge,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  Pagination
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import ImageIcon from "@mui/icons-material/Image";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CakeIcon from "@mui/icons-material/Cake";
import { getMyInfo, updateProfile } from "../services/userService";
import { isAuthenticated, logOut } from "../services/authenticationService";
import { uploadMedia } from "../services/mediaService";
import { formatAvatarUrl, getUserInitials } from "../utils/avatarUtils";
// Post component import removed
import Scene from "./Scene";

export default function Profile() {
  const navigate = useNavigate();
  const theme = useTheme();
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
  
  // Removed posts state

  const getUserDetails = async () => {
    try {
      const response = await getMyInfo();
      const data = response.data;
      setUserDetails(data.result);
      setFormData(data.result);
      
      // Posts section removed
    } catch (error) {
      if (error.response?.status === 401) {
        logOut();
        navigate("/login");
      }
    }
  };
  
  // Removed fetchUserPosts function

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


  
  return (
    <Scene>
      {userDetails ? (
        <>
          {/* Profile Header with Background */}
          <Box
            sx={{
              position: 'relative',
              height: '300px',
              width: '100%',
              background: userDetails.backgroundUrl 
                ? `url(${userDetails.backgroundUrl})` 
                : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.3)',
                zIndex: 1
              }
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
                bottom: 16,
                right: 16,
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.9)' },
                zIndex: 2
              }}
              onClick={() => backgroundInputRef.current.click()}
              disabled={uploadingBackground}
            >
              {uploadingBackground ? <CircularProgress size={24} /> : <ImageIcon />}
            </IconButton>
            
            <Container maxWidth="lg">
              <Box sx={{ 
                position: 'relative', 
                zIndex: 2, 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'flex-end',
                pb: 3,
                color: 'white'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 3 }}>
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
                    <Avatar
                      src={formatAvatarUrl(userDetails.avatarUrl)}
                      sx={{ 
                        width: 150, 
                        height: 150, 
                        border: '5px solid white',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                        cursor: 'pointer',
                        '&:hover': { opacity: 0.9 }
                      }}
                      onClick={() => avatarInputRef.current.click()}
                    >
                      {getUserInitials(userDetails)}
                    </Avatar>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      ref={avatarInputRef}
                      onChange={handleAvatarUpload}
                    />
                  </Badge>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h3" fontWeight="bold" sx={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                      {userDetails.firstName} {userDetails.lastName}
                    </Typography>
                    <Typography variant="h6" sx={{ opacity: 0.9, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                      @{userDetails.username}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Container>
          </Box>
          
          <Container maxWidth="lg" sx={{ mt: 2 }}>
            {/* Action Buttons */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'flex-end',
              gap: 1,
              mb: 3
            }}>
              {isEditing ? (
                <>
                  <Button 
                    variant="outlined" 
                    startIcon={<CancelIcon />} 
                    onClick={handleCancel}
                    disabled={isLoading}
                    color="error"
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="contained" 
                    startIcon={isLoading ? <CircularProgress size={16} /> : <SaveIcon />} 
                    onClick={handleSubmit}
                    disabled={isLoading}
                    color="primary"
                  >
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button 
                  variant="contained" 
                  startIcon={<EditIcon />} 
                  onClick={() => setIsEditing(true)}
                  color="primary"
                >
                  Edit Profile
                </Button>
              )}
              
              <Button 
                variant="outlined" 
                startIcon={<PeopleIcon />} 
                onClick={() => navigate('/friends')}
              >
                My Friends
              </Button>
            </Box>
            
            {/* Profile Content */}
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
              {/* User Information Card */}
              <Card elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                    User Information
                  </Typography>
                  
                  <Divider sx={{ mb: 3 }} />
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <List>
                        <ListItem>
                          <ListItemIcon>
                            <EmailIcon color="primary" />
                          </ListItemIcon>
                          {isEditing ? (
                            <TextField
                              fullWidth
                              size="small"
                              name="email"
                              value={formData.email || ''}
                              onChange={handleInputChange}
                              disabled={true}
                              label="Email"
                            />
                          ) : (
                            <ListItemText 
                              primary="Email" 
                              secondary={userDetails.email || "Not provided"} 
                            />
                          )}
                        </ListItem>
                        
                        <ListItem>
                          <ListItemIcon>
                            <CakeIcon color="primary" />
                          </ListItemIcon>
                          {isEditing ? (
                            <TextField
                              fullWidth
                              size="small"
                              name="dob"
                              value={formData.dob || ''}
                              onChange={handleInputChange}
                              label="Date of Birth"
                            />
                          ) : (
                            <ListItemText 
                              primary="Birthday" 
                              secondary={userDetails.dob || "Not provided"} 
                            />
                          )}
                        </ListItem>
                        
                        <ListItem>
                          <ListItemIcon>
                            <LocationOnIcon color="primary" />
                          </ListItemIcon>
                          {isEditing ? (
                            <TextField
                              fullWidth
                              size="small"
                              name="city"
                              value={formData.city || ''}
                              onChange={handleInputChange}
                              label="City"
                            />
                          ) : (
                            <ListItemText 
                              primary="Location" 
                              secondary={userDetails.city || "Not provided"} 
                            />
                          )}
                        </ListItem>
                      </List>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <List>
                        <ListItem>
                          {isEditing ? (
                            <TextField
                              fullWidth
                              size="small"
                              name="username"
                              value={formData.username || ''}
                              onChange={handleInputChange}
                              disabled={true}
                              label="Username"
                            />
                          ) : (
                            <ListItemText 
                              primary="Username" 
                              secondary={userDetails.username || "Not provided"} 
                            />
                          )}
                        </ListItem>
                        
                        <ListItem>
                          {isEditing ? (
                            <TextField
                              fullWidth
                              size="small"
                              name="firstName"
                              value={formData.firstName || ''}
                              onChange={handleInputChange}
                              label="First Name"
                            />
                          ) : (
                            <ListItemText 
                              primary="First Name" 
                              secondary={userDetails.firstName || "Not provided"} 
                            />
                          )}
                        </ListItem>
                        
                        <ListItem>
                          {isEditing ? (
                            <TextField
                              fullWidth
                              size="small"
                              name="lastName"
                              value={formData.lastName || ''}
                              onChange={handleInputChange}
                              label="Last Name"
                            />
                          ) : (
                            <ListItemText 
                              primary="Last Name" 
                              secondary={userDetails.lastName || "Not provided"} 
                            />
                          )}
                        </ListItem>
                      </List>
                    </Grid>
                  </Grid>
                </Box>
              </Card>
              
              {/* Posts section removed */}
            </Container>
          </Container>
        </>
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

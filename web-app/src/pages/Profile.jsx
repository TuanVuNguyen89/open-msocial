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
              height: { xs: '200px', sm: '250px', md: '300px' },
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
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'center', sm: 'flex-end' }, 
                  gap: { xs: 1, sm: 2, md: 3 },
                  width: '100%'
                }}>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                      <IconButton
                        sx={{ 
                          backgroundColor: 'white', 
                          '&:hover': { backgroundColor: '#f5f5f5' },
                          width: { xs: '24px', sm: '32px' },
                          height: { xs: '24px', sm: '32px' }
                        }}
                        size="small"
                        onClick={() => avatarInputRef.current.click()}
                        disabled={uploadingAvatar}
                      >
                        {uploadingAvatar ? <CircularProgress size={16} /> : <PhotoCameraIcon sx={{ fontSize: { xs: '14px', sm: '16px' } }} />}
                      </IconButton>
                    }
                  >
                    <Avatar
                      src={formatAvatarUrl(userDetails.avatarUrl)}
                      sx={{ 
                        width: { xs: 100, sm: 130, md: 150 }, 
                        height: { xs: 100, sm: 130, md: 150 }, 
                        border: { xs: '3px solid white', sm: '4px solid white', md: '5px solid white' },
                        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                        cursor: 'pointer',
                        '&:hover': { opacity: 0.9 },
                        marginTop: { xs: '-50px', sm: 0 }
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
                  
                  <Box sx={{ 
                    mb: { xs: 0, sm: 2 },
                    mt: { xs: 1, sm: 0 },
                    textAlign: { xs: 'center', sm: 'left' }
                  }}>
                    <Typography 
                      variant="h3" 
                      fontWeight="bold" 
                      sx={{ 
                        textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                        fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
                      }}
                    >
                      {userDetails.firstName} {userDetails.lastName}
                    </Typography>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        opacity: 0.9, 
                        textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                        fontSize: { xs: '0.9rem', sm: '1.1rem', md: '1.25rem' }
                      }}
                    >
                      @{userDetails.username}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Container>
          </Box>
          
          <Container 
            maxWidth="lg" 
            sx={{ 
              mt: { xs: 1, sm: 2 }, 
              px: { xs: 1, sm: 2, md: 3 },
              position: 'relative',
              zIndex: 3
            }}
          >
            {/* Khoảng trống để avatar có thể nhô lên */}
            <Box sx={{ height: { xs: 60, sm: 0 } }} />
            
            {/* Action Buttons */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: { xs: 'center', sm: 'flex-end' },
              flexWrap: { xs: 'wrap', sm: 'nowrap' },
              gap: 1,
              mb: 3,
              mt: { xs: 4, sm: 2 }
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
              {/* User Information Card */}
              <Card elevation={2} sx={{ borderRadius: 2, overflow: 'hidden', mt: { xs: 3, sm: 4 } }}>
                <Box sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                    User Information
                  </Typography>
                  
                  <Divider sx={{ mb: 3 }} />
                  
                  <Grid container spacing={{ xs: 1, sm: 2, md: 3 }}>
                    <Grid item xs={12} md={6}>
                      <List sx={{ 
                        display: 'flex', 
                        flexDirection: { xs: 'column', md: 'column' },
                        width: '100%'
                      }}>
                        <ListItem sx={{ 
                          flexDirection: { xs: 'column', sm: 'row' },
                          alignItems: { xs: 'flex-start', sm: 'center' },
                          py: { xs: 1.5, sm: 1 }
                        }}>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            width: { xs: '100%', sm: 'auto' },
                            mb: { xs: 1, sm: 0 }
                          }}>
                            <ListItemIcon sx={{ minWidth: { xs: '40px', sm: '56px' } }}>
                              <EmailIcon color="primary" />
                            </ListItemIcon>
                            <Typography 
                              variant="body1" 
                              sx={{ 
                                display: { xs: 'block', sm: 'none' },
                                fontWeight: 600
                              }}
                            >
                              Email
                            </Typography>
                          </Box>
                          {isEditing ? (
                            <TextField
                              fullWidth
                              size="small"
                              name="email"
                              value={formData.email || ''}
                              onChange={handleInputChange}
                              disabled={true}
                              label="Email"
                              sx={{ width: { xs: '100%', sm: 'auto', md: '100%' } }}
                            />
                          ) : (
                            <ListItemText 
                              primary="Email" 
                              secondary={userDetails.email || "Not provided"} 
                              primaryTypographyProps={{ 
                                sx: { display: { xs: 'none', sm: 'block' } }
                              }}
                              sx={{ margin: 0 }}
                            />
                          )}
                        </ListItem>
                        
                        <ListItem sx={{ 
                          flexDirection: { xs: 'column', sm: 'row' },
                          alignItems: { xs: 'flex-start', sm: 'center' },
                          py: { xs: 1.5, sm: 1 }
                        }}>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            width: { xs: '100%', sm: 'auto' },
                            mb: { xs: 1, sm: 0 }
                          }}>
                            <ListItemIcon sx={{ minWidth: { xs: '40px', sm: '56px' } }}>
                              <CakeIcon color="primary" />
                            </ListItemIcon>
                            <Typography 
                              variant="body1" 
                              sx={{ 
                                display: { xs: 'block', sm: 'none' },
                                fontWeight: 600
                              }}
                            >
                              Birthday
                            </Typography>
                          </Box>
                          {isEditing ? (
                            <TextField
                              fullWidth
                              size="small"
                              name="dob"
                              value={formData.dob || ''}
                              onChange={handleInputChange}
                              label="Date of Birth"
                              sx={{ width: { xs: '100%', sm: 'auto', md: '100%' } }}
                            />
                          ) : (
                            <ListItemText 
                              primary="Birthday" 
                              secondary={userDetails.dob || "Not provided"} 
                              primaryTypographyProps={{ 
                                sx: { display: { xs: 'none', sm: 'block' } }
                              }}
                              sx={{ margin: 0 }}
                            />
                          )}
                        </ListItem>
                        
                        <ListItem sx={{ 
                          flexDirection: { xs: 'column', sm: 'row' },
                          alignItems: { xs: 'flex-start', sm: 'center' },
                          py: { xs: 1.5, sm: 1 }
                        }}>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            width: { xs: '100%', sm: 'auto' },
                            mb: { xs: 1, sm: 0 }
                          }}>
                            <ListItemIcon sx={{ minWidth: { xs: '40px', sm: '56px' } }}>
                              <LocationOnIcon color="primary" />
                            </ListItemIcon>
                            <Typography 
                              variant="body1" 
                              sx={{ 
                                display: { xs: 'block', sm: 'none' },
                                fontWeight: 600
                              }}
                            >
                              Location
                            </Typography>
                          </Box>
                          {isEditing ? (
                            <TextField
                              fullWidth
                              size="small"
                              name="city"
                              value={formData.city || ''}
                              onChange={handleInputChange}
                              label="City"
                              sx={{ width: { xs: '100%', sm: 'auto', md: '100%' } }}
                            />
                          ) : (
                            <ListItemText 
                              primary="Location" 
                              secondary={userDetails.city || "Not provided"} 
                              primaryTypographyProps={{ 
                                sx: { display: { xs: 'none', sm: 'block' } }
                              }}
                              sx={{ margin: 0 }}
                            />
                          )}
                        </ListItem>
                      </List>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <List sx={{ 
                        display: 'flex', 
                        flexDirection: { xs: 'column', md: 'column' },
                        width: '100%'
                      }}>
                        <ListItem sx={{ 
                          flexDirection: { xs: 'column', sm: 'row' },
                          alignItems: { xs: 'flex-start', sm: 'center' },
                          py: { xs: 1.5, sm: 1 }
                        }}>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              display: { xs: 'block', sm: 'none' },
                              fontWeight: 600,
                              mb: 1,
                              width: '100%'
                            }}
                          >
                            Username
                          </Typography>
                          {isEditing ? (
                            <TextField
                              fullWidth
                              size="small"
                              name="username"
                              value={formData.username || ''}
                              onChange={handleInputChange}
                              disabled={true}
                              label="Username"
                              sx={{ width: { xs: '100%', sm: 'auto', md: '100%' } }}
                            />
                          ) : (
                            <ListItemText 
                              primary="Username" 
                              secondary={userDetails.username || "Not provided"} 
                              primaryTypographyProps={{ 
                                sx: { display: { xs: 'none', sm: 'block' } }
                              }}
                              sx={{ margin: 0, width: '100%' }}
                            />
                          )}
                        </ListItem>
                        
                        <ListItem sx={{ 
                          flexDirection: { xs: 'column', sm: 'row' },
                          alignItems: { xs: 'flex-start', sm: 'center' },
                          py: { xs: 1.5, sm: 1 }
                        }}>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              display: { xs: 'block', sm: 'none' },
                              fontWeight: 600,
                              mb: 1,
                              width: '100%'
                            }}
                          >
                            First Name
                          </Typography>
                          {isEditing ? (
                            <TextField
                              fullWidth
                              size="small"
                              name="firstName"
                              value={formData.firstName || ''}
                              onChange={handleInputChange}
                              label="First Name"
                              sx={{ width: { xs: '100%', sm: 'auto', md: '100%' } }}
                            />
                          ) : (
                            <ListItemText 
                              primary="First Name" 
                              secondary={userDetails.firstName || "Not provided"} 
                              primaryTypographyProps={{ 
                                sx: { display: { xs: 'none', sm: 'block' } }
                              }}
                              sx={{ margin: 0, width: '100%' }}
                            />
                          )}
                        </ListItem>
                        
                        <ListItem sx={{ 
                          flexDirection: { xs: 'column', sm: 'row' },
                          alignItems: { xs: 'flex-start', sm: 'center' },
                          py: { xs: 1.5, sm: 1 }
                        }}>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              display: { xs: 'block', sm: 'none' },
                              fontWeight: 600,
                              mb: 1,
                              width: '100%'
                            }}
                          >
                            Last Name
                          </Typography>
                          {isEditing ? (
                            <TextField
                              fullWidth
                              size="small"
                              name="lastName"
                              value={formData.lastName || ''}
                              onChange={handleInputChange}
                              label="Last Name"
                              sx={{ width: { xs: '100%', sm: 'auto', md: '100%' } }}
                            />
                          ) : (
                            <ListItemText 
                              primary="Last Name" 
                              secondary={userDetails.lastName || "Not provided"} 
                              primaryTypographyProps={{ 
                                sx: { display: { xs: 'none', sm: 'block' } }
                              }}
                              sx={{ margin: 0, width: '100%' }}
                            />
                          )}
                        </ListItem>
                      </List>
                    </Grid>
                  </Grid>
                </Box>
              </Card>
              
              {/* Posts section could be added here */}
          </Container>
        </>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: { xs: "15px", sm: "20px", md: "30px" },
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            p: 2
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

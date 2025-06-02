import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Card,
  CircularProgress,
  Typography,
  Grid,
  Divider,
  Snackbar,
  Alert,
  Avatar,
  Button,
  Container,
  useTheme,
  Stack,
  Pagination
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import HomeIcon from "@mui/icons-material/Home";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CheckIcon from "@mui/icons-material/Check";
import CancelIcon from "@mui/icons-material/Cancel";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CakeIcon from "@mui/icons-material/Cake";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import { getProfile, getMyInfo, areFriend, sendFriendRequest, cancelFriendRequest, acceptFriendRequest, rejectFriendRequest, removeFriend } from "../services/userService";
import { List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import { isAuthenticated, logOut } from "../services/authenticationService";
import Scene from "./Scene";

export default function UserProfile() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const theme = useTheme();

  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relationshipType, setRelationshipType] = useState(null); // null, 'FRIEND', 'SENT_FRIEND_REQUEST'
  const [isSender, setIsSender] = useState(false); // Whether current user is the sender of the friend request
  const [friendRequestCancelling, setFriendRequestCancelling] = useState(false);
  const [friendRequestProcessing, setFriendRequestProcessing] = useState(false); // For accept/reject operations
  const [removingFriend, setRemovingFriend] = useState(false);
  const [myId, setMyId] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const checkIfOwnProfile = async () => {
    try {
      setLoading(true);
      // Get my profile info first
      const myProfileResponse = await getMyInfo();
      const myProfileData = myProfileResponse.data;
      const currentUserId = myProfileData.result.id;
      // Set the current user ID and use it directly instead of relying on state update
      setMyId(currentUserId);
      
      // If the requested profile is the user's own profile, redirect to /profile
      if (currentUserId.toString() === userId.toString()) {
        navigate('/profile');
        return true;
      }
      return { isOwnProfile: false, currentUserId };
    } catch (error) {
      console.error("Error checking profile ownership:", error);
      if (error.response?.status === 401) {
        logOut();
        navigate("/login");
      }
      return false;
    }
  };

  const getUserDetails = async () => {
    try {
      // First check if this is the user's own profile
      const result = await checkIfOwnProfile();
      if (result === true) return; // If it's own profile, we've already redirected
      
      // If not, proceed to fetch the requested profile
      const response = await getProfile(userId);
      const data = response.data;
      setUserDetails(data.result);
      setError(null);
      
      // Check if they are friends - pass the current user ID to avoid state timing issues
      if (result && result.currentUserId) {
        await checkFriendshipStatus(result.currentUserId);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      if (error.response?.status === 401) {
        logOut();
        navigate("/login");
      } else if (error.response?.status === 404) {
        setError("User not found");
      } else {
        setError("Failed to load user profile");
      }
    } finally {
      setLoading(false);
    }
  };
  
  const checkFriendshipStatus = async (currentUserId) => {
    try {
      const response = await areFriend(currentUserId, userId);
      const data = response.data;
      
      if (data.result) {
        const relationship = data.result;
        
        if (relationship.status === 'FRIEND') {
          setRelationshipType('FRIEND');
        } else if (relationship.status === 'PENDING') {
          setRelationshipType('SENT_FRIEND_REQUEST');
          // Check if the current user is the sender of the request
          setIsSender(relationship.senderId.toString() === currentUserId.toString());
        } else {
          setRelationshipType(null);
        }
      } else {
        setRelationshipType(null);
      }
    } catch (error) {
      console.error("Error checking friendship status:", error);
      setRelationshipType(null);
    }
  };

  const handleSendFriendRequest = async () => {
    try {
      await sendFriendRequest(userId);
      setRelationshipType('SENT_FRIEND_REQUEST');
      setIsSender(true);
      setSnackbar({
        open: true,
        message: 'Friend request sent successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error("Error sending friend request:", error);
      setSnackbar({
        open: true,
        message: 'Failed to send friend request',
        severity: 'error'
      });
    }
  };

  const handleCancelFriendRequest = async () => {
    try {
      setFriendRequestCancelling(true);
      await cancelFriendRequest(userId);
      setRelationshipType(null);
      setIsSender(false);
      setSnackbar({
        open: true,
        message: 'Friend request cancelled',
        severity: 'success'
      });
    } catch (error) {
      console.error("Error cancelling friend request:", error);
      setSnackbar({
        open: true,
        message: 'Failed to cancel friend request',
        severity: 'error'
      });
    } finally {
      setFriendRequestCancelling(false);
    }
  };

  const handleAcceptFriendRequest = async () => {
    try {
      setFriendRequestProcessing(true);
      await acceptFriendRequest(userId);
      setRelationshipType('FRIEND');
      setIsSender(false);
      setSnackbar({
        open: true,
        message: 'Friend request accepted',
        severity: 'success'
      });
    } catch (error) {
      console.error("Error accepting friend request:", error);
      setSnackbar({
        open: true,
        message: 'Failed to accept friend request',
        severity: 'error'
      });
    } finally {
      setFriendRequestProcessing(false);
    }
  };

  const handleRejectFriendRequest = async () => {
    try {
      setFriendRequestProcessing(true);
      await rejectFriendRequest(userId);
      setRelationshipType(null);
      setIsSender(false);
      setSnackbar({
        open: true,
        message: 'Friend request rejected',
        severity: 'success'
      });
    } catch (error) {
      console.error("Error rejecting friend request:", error);
      setSnackbar({
        open: true,
        message: 'Failed to reject friend request',
        severity: 'error'
      });
    } finally {
      setFriendRequestProcessing(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
    } else if (userId) {
      getUserDetails();
    }
  }, [userId]);

  const renderField = (label, value) => {
    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold">
          {label}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {value || "Not provided"}
        </Typography>
      </Box>
    );
  };
  
  // Handle removing a friend
  const handleRemoveFriend = async () => {
    try {
      setRemovingFriend(true);
      await removeFriend(userId);
      setRelationshipType(null);
      setSnackbar({
        open: true,
        message: 'Friend removed successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error("Error removing friend:", error);
      setSnackbar({
        open: true,
        message: 'Failed to remove friend',
        severity: 'error'
      });
    } finally {
      setRemovingFriend(false);
    }
  };

  // Navigate to view this user's friends
  const viewUserFriends = () => {
    navigate(`/friends?userId=${userId}`);
  };

  return (
    <Scene>
      {loading ? (
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
          <Typography>Loading user profile...</Typography>
        </Box>
      ) : error ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: { xs: "8px", sm: "10px", md: "12px" },
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            p: 2
          }}
        >
          <Typography color="error">{error}</Typography>
          <Typography
            sx={{ cursor: "pointer", textDecoration: "underline" }}
            onClick={() => navigate("/profile")}
          >
            Return to your profile
          </Typography>
        </Box>
      ) : userDetails ? (
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
                  <Avatar
                    src={userDetails.avatarUrl}
                    sx={{ 
                      width: { xs: 100, sm: 130, md: 150 }, 
                      height: { xs: 100, sm: 130, md: 150 }, 
                      border: { xs: '3px solid white', sm: '4px solid white', md: '5px solid white' },
                      boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                      marginTop: { xs: '-50px', sm: 0 }
                    }}
                  >
                    {userDetails.firstName?.charAt(0) || userDetails.username?.charAt(0)}
                  </Avatar>
                  
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
                    
                    {/* User stats */}

                  </Box>
                </Box>
              </Box>
            </Container>
          </Box>
          
          {/* Dịch chuyển các nút và thông tin người dùng xuống dưới avatar và background */}
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
              {/* Back to my profile button */}
              <Button 
                variant="outlined" 
                startIcon={<HomeIcon />} 
                onClick={() => navigate('/profile')}
                size="small"
              >
                My Profile
              </Button>
              
              {/* View Friends button */}
              <Button 
                variant="outlined" 
                startIcon={<PeopleIcon />} 
                onClick={viewUserFriends}
                size="small"
              >
                View Friends
              </Button>
              
              {/* Friend relationship buttons */}
              {relationshipType === null && (
                <Button 
                  variant="contained" 
                  startIcon={<PersonAddIcon />} 
                  onClick={handleSendFriendRequest}
                  size="small"
                  color="primary"
                >
                  Add Friend
                </Button>
              )}
              
              {relationshipType === 'SENT_FRIEND_REQUEST' && isSender && (
                <Button 
                  variant="outlined" 
                  startIcon={<CancelIcon />} 
                  onClick={handleCancelFriendRequest}
                  size="small"
                  color="error"
                  disabled={friendRequestCancelling}
                >
                  Cancel Request
                </Button>
              )}
              
              {relationshipType === 'SENT_FRIEND_REQUEST' && !isSender && (
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                  <Button 
                    variant="contained" 
                    startIcon={<CheckIcon />} 
                    onClick={handleAcceptFriendRequest}
                    size="small"
                    color="success"
                    disabled={friendRequestProcessing}
                  >
                    Accept
                  </Button>
                  <Button 
                    variant="outlined" 
                    startIcon={<CancelIcon />} 
                    onClick={handleRejectFriendRequest}
                    size="small"
                    color="error"
                    disabled={friendRequestProcessing}
                  >
                    Decline
                  </Button>
                </Stack>
              )}
              
              {relationshipType === 'FRIEND' && (
                <Button 
                  variant="outlined" 
                  startIcon={<PersonRemoveIcon />} 
                  onClick={handleRemoveFriend}
                  size="small"
                  color="error"
                  disabled={removingFriend}
                >
                  Remove Friend
                </Button>
              )}
            </Box>
            
            {/* Profile Content */}
            {/* User Information Card */}
            <Card elevation={2} sx={{ borderRadius: 2, overflow: 'hidden', mt: { xs: 3, sm: 4 } }}>
              <Box sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                  User Information
                </Typography>
                <Grid container spacing={2}>
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
                        <ListItemText 
                          primary="Email" 
                          secondary={userDetails.email || "Not provided"} 
                          primaryTypographyProps={{ 
                            sx: { display: { xs: 'none', sm: 'block' } }
                          }}
                          sx={{ margin: 0 }}
                        />
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
                        <ListItemText 
                          primary="Birthday" 
                          secondary={userDetails.dob || "Not provided"} 
                          primaryTypographyProps={{ 
                            sx: { display: { xs: 'none', sm: 'block' } }
                          }}
                          sx={{ margin: 0 }}
                        />
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
                        <ListItemText 
                          primary="Location" 
                          secondary={userDetails.city || "Not provided"} 
                          primaryTypographyProps={{ 
                            sx: { display: { xs: 'none', sm: 'block' } }
                          }}
                          sx={{ margin: 0 }}
                        />
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
                        <ListItemText 
                          primary="Username" 
                          secondary={userDetails.username || "Not provided"} 
                          primaryTypographyProps={{ 
                            sx: { display: { xs: 'none', sm: 'block' } }
                          }}
                          sx={{ margin: 0, width: '100%' }}
                        />
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
                        <ListItemText 
                          primary="First Name" 
                          secondary={userDetails.firstName || "Not provided"} 
                          primaryTypographyProps={{ 
                            sx: { display: { xs: 'none', sm: 'block' } }
                          }}
                          sx={{ margin: 0, width: '100%' }}
                        />
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
                        <ListItemText 
                          primary="Last Name" 
                          secondary={userDetails.lastName || "Not provided"} 
                          primaryTypographyProps={{ 
                            sx: { display: { xs: 'none', sm: 'block' } }
                          }}
                          sx={{ margin: 0, width: '100%' }}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                </Grid>
              </Box>
            </Card>
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
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Scene>
  );
}

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
// Post component import removed
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
  
  // Removed posts state
  


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
      
      // Posts section removed
    } catch (error) {
      console.error("Error fetching user profile:", error);
      if (error.response?.status === 401) {
        logOut();
        navigate("/login");
      } else {
        setError("Failed to load user profile. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Removed fetchUserPosts function
  
  const checkFriendshipStatus = async (currentUserId) => {
    try {
      // Use the passed currentUserId parameter instead of relying on state
      const userIdToCheck = currentUserId || myId;
      
      if (!userIdToCheck || !userId) return;
      
      const response = await areFriend(userIdToCheck, userId);
      const data = response.data;
      
      if (data.result) {
        // Set relationship type based on API response
        setRelationshipType(data.result.relationshipType);
        
        // Check if current user is the sender of the friend request
        if (data.result.relationshipType === 'SENT_FRIEND_REQUEST') {
          const isSenderOfRequest = data.result.sender.id === userIdToCheck;
          setIsSender(isSenderOfRequest);
        }
      } else {
        // No relationship exists
        setRelationshipType(null);
        setIsSender(false);
      }
      return data.result;
    } catch (error) {
      console.error("Error checking relationship status:", error);
      setRelationshipType(null);
      setIsSender(false);
      return false;
    }
  };
  
  const handleSendFriendRequest = async () => {
    try {
      await sendFriendRequest(userId);
      // Update relationship status
      setRelationshipType('SENT_FRIEND_REQUEST');
      setIsSender(true);
      setSnackbar({
        open: true,
        message: 'Friend request sent successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error("Error sending friend request:", error);
      setSnackbar({
        open: true,
        message: 'Failed to send friend request. Please try again.',
        severity: 'error'
      });
    }
  };
  
  const handleCancelFriendRequest = async () => {
    try {
      setFriendRequestCancelling(true);
      await cancelFriendRequest(userId);
      // Reset relationship status
      setRelationshipType(null);
      setIsSender(false);
      setFriendRequestCancelling(false);
      setSnackbar({
        open: true,
        message: 'Friend request cancelled successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error("Error cancelling friend request:", error);
      setFriendRequestCancelling(false);
      setSnackbar({
        open: true,
        message: 'Failed to cancel friend request. Please try again.',
        severity: 'error'
      });
    }
  };
  
  const handleAcceptFriendRequest = async () => {
    try {
      setFriendRequestProcessing(true);
      await acceptFriendRequest(userId);
      // Update relationship status
      setRelationshipType('FRIEND');
      setFriendRequestProcessing(false);
      setSnackbar({
        open: true,
        message: 'Friend request accepted!',
        severity: 'success'
      });
    } catch (error) {
      console.error("Error accepting friend request:", error);
      setFriendRequestProcessing(false);
      setSnackbar({
        open: true,
        message: 'Failed to accept friend request. Please try again.',
        severity: 'error'
      });
    }
  };
  
  const handleRejectFriendRequest = async () => {
    try {
      setFriendRequestProcessing(true);
      await rejectFriendRequest(userId);
      // Reset relationship status
      setRelationshipType(null);
      setIsSender(false);
      setFriendRequestProcessing(false);
      setSnackbar({
        open: true,
        message: 'Friend request rejected.',
        severity: 'success'
      });
    } catch (error) {
      console.error("Error rejecting friend request:", error);
      setFriendRequestProcessing(false);
      setSnackbar({
        open: true,
        message: 'Failed to reject friend request. Please try again.',
        severity: 'error'
      });
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
  }, [navigate, userId]);

  const renderField = (label, value) => {
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
  
  // Handle removing a friend
  const handleRemoveFriend = async () => {
    try {
      setRemovingFriend(true);
      await removeFriend(userId);
      // Reset relationship status
      setRelationshipType(null);
      setRemovingFriend(false);
      setSnackbar({
        open: true,
        message: 'Friend removed successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error("Error removing friend:", error);
      setRemovingFriend(false);
      setSnackbar({
        open: true,
        message: 'Failed to remove friend. Please try again.',
        severity: 'error'
      });
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
            gap: "30px",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
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
            gap: "10px",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
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
                  <Avatar
                    src={userDetails.avatarUrl}
                    sx={{ 
                      width: 150, 
                      height: 150, 
                      border: '5px solid white',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                    }}
                  >
                    {userDetails.firstName?.charAt(0) || userDetails.username?.charAt(0)}
                  </Avatar>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h3" fontWeight="bold" sx={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                      {userDetails.firstName} {userDetails.lastName}
                    </Typography>
                    <Typography variant="h6" sx={{ opacity: 0.9, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                      @{userDetails.username}
                    </Typography>
                    
                    {/* User stats */}

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
                <Stack direction="row" spacing={1}>
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
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
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
                          <ListItemText 
                            primary="Email" 
                            secondary={userDetails.email || "Not provided"} 
                          />
                        </ListItem>
                        
                        <ListItem>
                          <ListItemIcon>
                            <CakeIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Birthday" 
                            secondary={userDetails.dob || "Not provided"} 
                          />
                        </ListItem>
                        
                        <ListItem>
                          <ListItemIcon>
                            <LocationOnIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Location" 
                            secondary={userDetails.city || "Not provided"} 
                          />
                        </ListItem>
                      </List>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <List>
                        <ListItem>
                          <ListItemText 
                            primary="Username" 
                            secondary={userDetails.username || "Not provided"} 
                          />
                        </ListItem>
                        
                        <ListItem>
                          <ListItemText 
                            primary="First Name" 
                            secondary={userDetails.firstName || "Not provided"} 
                          />
                        </ListItem>
                        
                        <ListItem>
                          <ListItemText 
                            primary="Last Name" 
                            secondary={userDetails.lastName || "Not provided"} 
                          />
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
      ) : null}
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Scene>
  );
}

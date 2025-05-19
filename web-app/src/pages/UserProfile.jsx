import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Card,
  CircularProgress,
  Typography,
  Grid,
  Divider,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Avatar
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import HomeIcon from "@mui/icons-material/Home";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CheckIcon from "@mui/icons-material/Check";
import CancelIcon from "@mui/icons-material/Cancel";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import { getProfile, getMyInfo, areFriend, sendFriendRequest, cancelFriendRequest, acceptFriendRequest, rejectFriendRequest } from "../services/userService";
import { isAuthenticated, logOut } from "../services/authenticationService";
import Scene from "./Scene";

export default function UserProfile() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relationshipType, setRelationshipType] = useState(null); // null, 'FRIEND', 'SENT_FRIEND_REQUEST'
  const [isSender, setIsSender] = useState(false); // Whether current user is the sender of the friend request
  const [friendRequestCancelling, setFriendRequestCancelling] = useState(false);
  const [friendRequestProcessing, setFriendRequestProcessing] = useState(false); // For accept/reject operations
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
          />

          {/* Avatar */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: -5, mb: 2 }}>
            <Avatar
              src={userDetails.avatarUrl}
              sx={{ width: 100, height: 100, border: '4px solid white' }}
            >
              {userDetails.firstName?.charAt(0) || userDetails.username?.charAt(0)}
            </Avatar>
          </Box>

          <Box sx={{ px: 4, pb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              <Typography
                sx={{
                  fontSize: 20,
                  fontWeight: 600,
                  textAlign: "center",
                }}
              >
                {userDetails.firstName} {userDetails.lastName}'s Profile
              </Typography>
              <Tooltip title="Back to Profile" arrow placement="top">
                <IconButton 
                  color="primary" 
                  onClick={() => navigate('/profile')}
                  size="small"
                  sx={{ ml: 2 }}
                >
                  <HomeIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          
          {/* Small icons under title */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
            <Tooltip title="View Friends" arrow placement="top">
              <IconButton 
                color="primary" 
                onClick={viewUserFriends}
                size="small"
              >
                <PeopleIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            
            {/* Show Send Friend Request button if no relationship exists */}
            {relationshipType === null && (
              <Tooltip title="Send Friend Request" arrow placement="top">
                <IconButton 
                  color="primary" 
                  onClick={handleSendFriendRequest}
                  size="small"
                >
                  <PersonAddIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            
            {/* Show Friend Request Sent status if current user sent a request */}
            {relationshipType === 'SENT_FRIEND_REQUEST' && isSender && (
              <Tooltip title="Cancel Friend Request" arrow placement="top">
                <IconButton 
                  color="error" 
                  onClick={handleCancelFriendRequest}
                  size="small"
                  disabled={friendRequestCancelling}
                >
                  <CancelIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            
            {/* Show Friend Request Received status with Accept/Reject buttons if other user sent a request */}
            {relationshipType === 'SENT_FRIEND_REQUEST' && !isSender && (
              <>
                <Tooltip title="Accept Friend Request" arrow placement="top">
                  <IconButton 
                    color="success" 
                    size="small"
                    onClick={handleAcceptFriendRequest}
                    disabled={friendRequestProcessing}
                  >
                    <ThumbUpIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Reject Friend Request" arrow placement="top">
                  <IconButton 
                    color="error" 
                    size="small"
                    onClick={handleRejectFriendRequest}
                    disabled={friendRequestProcessing}
                  >
                    <ThumbDownIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          {renderField("Username", userDetails.username)}
          {renderField("Email", userDetails.email)}
          {renderField("First Name", userDetails.firstName)}
          {renderField("Last Name", userDetails.lastName)}
          {renderField("Date of Birth", userDetails.dob)}
          {renderField("City", userDetails.city)}
          </Box>
        </Card>
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

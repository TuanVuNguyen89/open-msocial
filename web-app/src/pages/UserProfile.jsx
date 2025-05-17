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
  Tooltip
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import HomeIcon from "@mui/icons-material/Home";
import { getProfile, getMyInfo } from "../services/userService";
import { isAuthenticated, logOut } from "../services/authenticationService";
import Scene from "./Scene";

export default function UserProfile() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkIfOwnProfile = async () => {
    try {
      setLoading(true);
      // Get my profile info first
      const myProfileResponse = await getMyInfo();
      const myProfileData = myProfileResponse.data;
      const myId = myProfileData.result.id;
      
      // If the requested profile is the user's own profile, redirect to /profile
      if (myId.toString() === userId.toString()) {
        navigate('/profile');
        return true;
      }
      return false;
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
      const isOwnProfile = await checkIfOwnProfile();
      if (isOwnProfile) return;
      
      // If not, proceed to fetch the requested profile
      const response = await getProfile(userId);
      const data = response.data;
      setUserDetails(data.result);
      setError(null);
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
            p: 4,
            boxShadow: 4,
            borderRadius: 3,
          }}
        >
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
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          {renderField("Username", userDetails.username)}
          {renderField("Email", userDetails.email)}
          {renderField("First Name", userDetails.firstName)}
          {renderField("Last Name", userDetails.lastName)}
          {renderField("Date of Birth", userDetails.dob)}
          {renderField("City", userDetails.city)}
        </Card>
      ) : null}
    </Scene>
  );
}

import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CircularProgress,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Alert,
  Button,
  IconButton,
  Tooltip
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import HomeIcon from "@mui/icons-material/Home";

import { getPendingRequests, acceptFriendRequest, rejectFriendRequest } from "../services/userService";
import { isAuthenticated, logOut } from "../services/authenticationService";
import Scene from "./Scene";

export default function PendingRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState({
    number: 0,
    size: 10,
    totalElements: 0,
    totalPages: 1
  });
  
  const observer = useRef();
  const lastRequestElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => ({
          ...prevPage,
          number: prevPage.number + 1
        }));
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await getPendingRequests({
        number: page.number,
        size: page.size
      });
      
      const data = response.data;
      const newRequests = data.result.content || [];
      
      // Append new requests to existing list for infinite scroll
      setRequests(prev => {
        // If we're on page 0, replace the list
        if (page.number === 0) return newRequests;
        // Otherwise append to existing list
        return [...prev, ...newRequests];
      });
      
      // Update pagination info
      setPage(prevPage => ({
        ...prevPage,
        totalElements: data.result.totalElements || 0,
        totalPages: data.result.totalPages || 1
      }));
      
      // Check if we've reached the end
      setHasMore(newRequests.length > 0 && page.number < data.result.totalPages - 1);
      
      setError(null);
    } catch (error) {
      console.error("Error fetching pending requests:", error);
      if (error.response?.status === 401) {
        logOut();
        navigate("/login");
      } else {
        setError("Failed to load pending requests. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
    } else {
      fetchRequests();
    }
  }, [navigate, page.number]);

  // Handle accept friend request
  const handleAccept = async (userId) => {
    try {
      setLoading(true);
      await acceptFriendRequest(userId);
      // Remove the accepted request from the list
      setRequests(prev => prev.filter(request => request.id !== userId));
      // Show success message (could be implemented with a snackbar)
      console.log("Friend request accepted successfully");
    } catch (error) {
      console.error("Error accepting friend request:", error);
      // Show error message
    } finally {
      setLoading(false);
    }
  };

  // Handle reject friend request
  const handleReject = async (userId) => {
    try {
      setLoading(true);
      await rejectFriendRequest(userId);
      // Remove the rejected request from the list
      setRequests(prev => prev.filter(request => request.id !== userId));
      // Show success message
      console.log("Friend request rejected successfully");
    } catch (error) {
      console.error("Error rejecting friend request:", error);
      // Show error message
    } finally {
      setLoading(false);
    }
  };

  // Reset function to reload from the beginning
  const resetRequestsList = () => {
    setRequests([]);
    setPage({
      number: 0,
      size: 10,
      totalElements: 0,
      totalPages: 1
    });
    setHasMore(true);
  };
  
  // Handle viewing a user's profile
  const handleViewProfile = (userId) => {
    navigate(`/user-profile/${userId}`);
  };

  return (
    <Scene>
      <Card
        sx={{
          minWidth: 350,
          maxWidth: 800,
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
              fontSize: 24,
              fontWeight: 600,
              textAlign: "center",
            }}
          >
            Pending Friend Requests
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
        <Divider sx={{ mb: 3 }} />

        {loading && requests.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "30px",
              justifyContent: "center",
              alignItems: "center",
              height: "200px",
            }}
          >
            <CircularProgress />
            <Typography>Loading requests...</Typography>
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        ) : requests.length === 0 ? (
          <Typography sx={{ textAlign: "center", py: 4 }}>
            You don't have any pending friend requests.
          </Typography>
        ) : (
          <>
            <List sx={{ width: "100%" }}>
              {requests.map((request, index) => (
                <ListItem
                  ref={index === requests.length - 1 ? lastRequestElementRef : null}
                  key={`${request.id}-${index}`}
                  alignItems="flex-start"
                  onClick={() => handleViewProfile(request.id)}
                  secondaryAction={
                    <Box onClick={(e) => e.stopPropagation()}>
                      <Tooltip title="Accept Request" arrow>
                        <IconButton 
                          edge="end" 
                          color="primary" 
                          onClick={() => handleAccept(request.id)}
                          sx={{ mr: 1 }}
                          disabled={loading}
                        >
                          <CheckIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Reject Request" arrow>
                        <IconButton 
                          edge="end" 
                          color="error" 
                          onClick={() => handleReject(request.id)}
                          disabled={loading}
                        >
                          <CloseIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                  sx={{ 
                    borderBottom: "1px solid #eee",
                    "&:last-child": { borderBottom: "none" },
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                    transition: 'background-color 0.3s'
                  }}
                >
                  <ListItemAvatar>
                    <Avatar 
                      src={request.avatarUrl}
                    >
                      {!request.avatarUrl && (request.firstName?.charAt(0) || request.username?.charAt(0))}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography 
                        component="span" 
                        variant="body1" 
                        color="text.primary"
                      >
                        {`${request.firstName || ""} ${request.lastName || ""}`}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"

                        >
                          {request.username}
                        </Typography>
                        {request.city && ` — ${request.city}`}
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
            
            {/* Loading indicator at the bottom */}
            {loading && requests.length > 0 && (
              <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
                <CircularProgress size={30} />
              </Box>
            )}
            
            {/* End of list message */}
            {!loading && !hasMore && requests.length > 0 && (
              <Typography sx={{ textAlign: "center", py: 2, color: "text.secondary" }}>
                No more requests to load
              </Typography>
            )}
          </>
        )}
      </Card>
    </Scene>
  );
}

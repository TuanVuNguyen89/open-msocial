import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Card,
  CircularProgress,
  Typography,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Alert,
  IconButton,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import HomeIcon from "@mui/icons-material/Home";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import { getMyFriends, removeFriend, listFriends } from "../services/userService";
import { isAuthenticated, logOut } from "../services/authenticationService";
import Scene from "./Scene";

export default function Friends() {
  const navigate = useNavigate();
  const location = useLocation();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState({
    number: 0,
    size: 10,
    totalElements: 0,
    totalPages: 1
  });
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    friendId: null,
    friendName: ""
  });
  
  // Check if we're viewing someone else's friends list
  const queryParams = new URLSearchParams(location.search);
  const userId = queryParams.get('userId');
  const isOwnFriendsList = !userId;
  
  const observer = useRef();
  const lastFriendElementRef = useCallback(node => {
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

  const fetchFriends = async () => {
    try {
      setLoading(true);
      let response;
      
      if (isOwnFriendsList) {
        // Fetch my friends
        response = await getMyFriends({
          number: page.number,
          size: page.size
        });
      } else {
        // Fetch someone else's friends
        response = await listFriends(userId);
      }
      
      const data = response.data;
      const newFriends = data.result.content || [];
      
      // Append new friends to existing list for infinite scroll
      setFriends(prev => {
        // If we're on page 0, replace the list
        if (page.number === 0) return newFriends;
        // Otherwise append to existing list
        return [...prev, ...newFriends];
      });
      
      // Update pagination info
      setPage(prevPage => ({
        ...prevPage,
        totalElements: data.result.totalElements || 0,
        totalPages: data.result.totalPages || 1
      }));
      
      // Check if we've reached the end
      setHasMore(newFriends.length > 0 && page.number < data.result.totalPages - 1);
      
      setError(null);
    } catch (error) {
      console.error("Error fetching friends:", error);
      if (error.response?.status === 401) {
        logOut();
        navigate("/login");
      } else {
        setError("Failed to load friends. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
    } else {
      fetchFriends();
    }
  }, [navigate, page.number]);

  // Reset function to reload from the beginning
  const resetFriendsList = () => {
    setFriends([]);
    setPage({
      number: 0,
      size: 10,
      totalElements: 0,
      totalPages: 1
    });
    setHasMore(true);
  };
  
  // Handle viewing a friend's profile
  const handleViewProfile = (friendId) => {
    navigate(`/user-profile/${friendId}`);
  };
  
  // Open confirmation dialog for removing a friend
  const openRemoveDialog = (friendId, friendName) => {
    setConfirmDialog({
      open: true,
      friendId,
      friendName
    });
  };
  
  // Close confirmation dialog
  const closeRemoveDialog = () => {
    setConfirmDialog({
      ...confirmDialog,
      open: false
    });
  };
  
  // Handle removing a friend
  const handleRemoveFriend = async () => {
    try {
      setLoading(true);
      await removeFriend(confirmDialog.friendId);
      // Remove the friend from the list
      setFriends(prev => prev.filter(friend => friend.id !== confirmDialog.friendId));
      closeRemoveDialog();
    } catch (error) {
      console.error("Error removing friend:", error);
      // Show error message
    } finally {
      setLoading(false);
    }
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
            {isOwnFriendsList ? 'My Friends' : 'User\'s Friends'}
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

        {loading ? (
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
            <Typography>Loading friends...</Typography>
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        ) : friends.length === 0 ? (
          <Typography sx={{ textAlign: "center", py: 4 }}>
            You don't have any friends yet.
          </Typography>
        ) : (
          <>
            <List sx={{ width: "100%" }}>
              {friends.map((friend, index) => (
                <ListItem
                  ref={index === friends.length - 1 ? lastFriendElementRef : null}
                  key={`${friend.id}-${index}`}
                  alignItems="flex-start"
                  secondaryAction={
                    <Box>
                      <Tooltip title="View Profile" arrow>
                        <IconButton 
                          edge="end" 
                          color="primary" 
                          onClick={() => handleViewProfile(friend.id)}
                          size="small"
                          sx={{ mr: 1 }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      {isOwnFriendsList && (
                        <Tooltip title="Remove Friend" arrow>
                          <IconButton 
                            edge="end" 
                            color="error" 
                            onClick={() => openRemoveDialog(friend.id, `${friend.firstName || ''} ${friend.lastName || ''}`)} 
                            size="small"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  }
                  sx={{ 
                    borderBottom: "1px solid #eee",
                    "&:last-child": { borderBottom: "none" },
                    pr: 8 // Add padding to the right for the action buttons
                  }}
                >
                  <ListItemAvatar>
                    <Avatar>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${friend.firstName || ""} ${friend.lastName || ""}`}
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                        >
                          {friend.username}
                        </Typography>
                        {friend.city && ` — ${friend.city}`}
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
            
            {/* Loading indicator at the bottom */}
            {loading && friends.length > 0 && (
              <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
                <CircularProgress size={30} />
              </Box>
            )}
            
            {/* End of list message */}
            {!loading && !hasMore && friends.length > 0 && (
              <Typography sx={{ textAlign: "center", py: 2, color: "text.secondary" }}>
                No more friends to load
              </Typography>
            )}
          </>
        )}
      </Card>
      
      {/* Confirmation Dialog for removing a friend */}
      <Dialog
        open={confirmDialog.open}
        onClose={closeRemoveDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Remove Friend
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to remove {confirmDialog.friendName} from your friends list?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeRemoveDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleRemoveFriend} color="error" autoFocus>
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </Scene>
  );
}

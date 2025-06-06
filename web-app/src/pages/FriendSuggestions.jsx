import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CircularProgress,
  Typography,
  Grid,
  Avatar,
  Alert,
  Button,
  Paper,
  Container,
  useTheme,
  alpha
} from "@mui/material";
import { formatAvatarUrl, getUserInitials } from "../utils/avatarUtils";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import GroupAddIcon from "@mui/icons-material/GroupAdd";

import { getFriendSuggestions, sendFriendRequest, cancelFriendRequest } from "../services/userService";
import useUserInfo from "../hooks/useUserInfo";
import { isAuthenticated, logOut } from "../services/authenticationService";
import Scene from "./Scene";

export default function FriendSuggestions() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { userInfo } = useUserInfo();
  
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState({
    number: 0,
    size: 10,
    totalElements: 0,
    totalPages: 1
  });
  
  // Observer for infinite scrolling
  const observer = useRef();
  const lastSuggestionElementRef = useCallback(node => {
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

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const response = await getFriendSuggestions({
        number: page.number,
        size: page.size
      });
      
      const data = response.data;
      let newSuggestions = data.result.content || [];
      
      // Đảm bảo mỗi suggestion có đủ thông tin cần thiết
      newSuggestions = newSuggestions.map(suggestion => ({
        ...suggestion,
        // Đảm bảo avatarUrl luôn có giá trị đúng định dạng
        avatarUrl: suggestion.avatarUrl || null,
        // Đảm bảo firstName, lastName và username luôn có giá trị
        firstName: suggestion.firstName || '',
        lastName: suggestion.lastName || '',
        username: suggestion.username || 'user'
      }));
      
      // Append new suggestions to existing list for infinite scroll
      setSuggestions(prev => {
        // If we're on page 0, replace the list
        if (page.number === 0) return newSuggestions;
        // Otherwise append to existing list
        return [...prev, ...newSuggestions];
      });
      
      // Update pagination info
      setPage(prevPage => ({
        ...prevPage,
        totalElements: data.result.totalElements || 0,
        totalPages: data.result.totalPages || 1
      }));
      
      // Check if we've reached the end
      setHasMore(newSuggestions.length > 0 && page.number < data.result.totalPages - 1);
      
      setError(null);
    } catch (error) {
      console.error("Error fetching friend suggestions:", error);
      if (error.response?.status === 401) {
        logOut();
        navigate("/login");
      } else {
        setError("Failed to load friend suggestions. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
    } else {
      fetchSuggestions();
    }
  }, [navigate, page.number]);

  // Reset function to reload from the beginning
  const resetSuggestionsList = () => {
    setSuggestions([]);
    setPage({
      number: 0,
      size: 10,
      totalElements: 0,
      totalPages: 1
    });
    setHasMore(true);
  };
  
  // Handle sending a friend request
  const handleSendRequest = async (userId) => {
    try {
      await sendFriendRequest(userId);
      // Update the UI to show the request has been sent
      setSuggestions(prev => 
        prev.map(user => 
          user.id === userId 
            ? { ...user, requestSent: true } 
            : user
        )
      );
    } catch (error) {
      console.error("Error sending friend request:", error);
      setError("Failed to send friend request. Please try again.");
    }
  };

  // Handle canceling a friend request
  const handleCancelRequest = async (userId) => {
    try {
      await cancelFriendRequest(userId);
      // Update the UI to show the request has been canceled
      setSuggestions(prev => 
        prev.map(user => 
          user.id === userId 
            ? { ...user, requestSent: false } 
            : user
        )
      );
    } catch (error) {
      console.error("Error canceling friend request:", error);
      setError("Failed to cancel friend request. Please try again.");
    }
  };
  
  // Handle viewing a user's profile
  const handleViewProfile = (userId) => {
    navigate(`/user-profile/${userId}`);
  };

  return (
    <Scene>
      {/* Header with gradient background */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: '100px', sm: '120px' },
          width: '100%',
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          overflow: 'hidden',
          mb: { xs: -6, sm: -8 },
          zIndex: 0,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")',
            opacity: 0.2
          }
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ pt: { xs: 2, sm: 4 }, color: 'white', position: 'relative', zIndex: 1 }}>
            <Typography variant="h4" fontWeight="bold" sx={{ 
              textShadow: '0px 2px 4px rgba(0,0,0,0.3)',
              fontSize: { xs: '1.75rem', sm: '2.125rem' }
            }}>
              Friend Suggestions
            </Typography>
          </Box>
        </Container>
        
        {/* Decorative circles */}
        <Box sx={{ 
          position: 'absolute', 
          top: -50, 
          right: -50, 
          width: 200, 
          height: 200, 
          borderRadius: '50%', 
          backgroundColor: alpha(theme.palette.common.white, 0.1),
          zIndex: 0
        }} />
        <Box sx={{ 
          position: 'absolute', 
          bottom: -70, 
          left: '30%', 
          width: 150, 
          height: 150, 
          borderRadius: '50%', 
          backgroundColor: alpha(theme.palette.common.white, 0.05),
          zIndex: 0
        }} />
      </Box>
      
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, px: { xs: 2, sm: 3, md: 4 } }}>
        <Card
          elevation={8}
          sx={{
            minWidth: { xs: '100%', sm: 350 },
            width: '100%',
            margin: "auto",
            borderRadius: { xs: 2, sm: 4 },
            overflow: 'visible',
            position: 'relative',
            pb: 3
          }}
        >
          {/* Hiển thị số lượng gợi ý kết bạn */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: { xs: 2, sm: 3 }, py: { xs: 1.5, sm: 2 }, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle1" fontWeight="medium">
              {suggestions.length} {suggestions.length === 1 ? 'Suggestion' : 'Suggestions'}
            </Typography>
          </Box>

          <Box sx={{ px: { xs: 2, sm: 3 } }}>
            {loading && suggestions.length === 0 ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "30px",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "300px",
                }}
              >
                <CircularProgress />
                <Typography>Finding people you may know...</Typography>
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ mb: 3, mt: 2 }}>
                {error}
              </Alert>
            ) : suggestions.length === 0 ? (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                py: 8,
                textAlign: 'center'
              }}>
                <Avatar 
                  sx={{ 
                    width: 80, 
                    height: 80, 
                    mb: 2, 
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main
                  }}
                >
                  <GroupAddIcon fontSize="large" />
                </Avatar>
                <Typography variant="h6" gutterBottom>
                  No suggestions available
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
                  We don't have any friend suggestions for you at the moment. Check back later!
                </Typography>
              </Box>
            ) : (
              <>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  {suggestions.map((suggestion, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={`${suggestion.id}-${index}`}>
                      <Paper
                        ref={index === suggestions.length - 1 ? lastSuggestionElementRef : null}
                        elevation={2}
                        sx={{ 
                          p: { xs: 1.5, sm: 2 }, 
                          borderRadius: { xs: 2, sm: 3 },
                          transition: 'all 0.3s ease',
                          '&:hover': { 
                            transform: { xs: 'none', sm: 'translateY(-4px)' },
                            boxShadow: 6,
                            bgcolor: alpha(theme.palette.primary.main, 0.03)
                          },
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          height: '100%'
                        }}
                      >
                        <Avatar 
                          src={formatAvatarUrl(suggestion.avatarUrl)}
                          sx={{ 
                            width: { xs: 60, sm: 80 }, 
                            height: { xs: 60, sm: 80 }, 
                            mb: { xs: 1.5, sm: 2 },
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            cursor: 'pointer',
                            bgcolor: !suggestion.avatarUrl ? theme.palette.primary.main : 'inherit'
                          }}
                          onClick={() => handleViewProfile(suggestion.id)}
                        >
                          {!suggestion.avatarUrl && getUserInitials(suggestion)}
                        </Avatar>
                        
                        <Typography 
                          variant="h6" 
                          align="center"
                          noWrap
                          sx={{ 
                            fontWeight: 'bold', 
                            mb: 0.5,
                            cursor: 'pointer'
                          }}
                          onClick={() => handleViewProfile(suggestion.id)}
                        >
                          {`${suggestion.firstName || ""} ${suggestion.lastName || ""}`}
                        </Typography>
                        
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          align="center"
                          noWrap
                          sx={{ mb: 1 }}
                        >
                          @{suggestion.username}
                        </Typography>
                        
                        {suggestion.mutualFriends > 0 && (
                          <Typography 
                            variant="caption" 
                            color="text.secondary"
                            align="center"
                            sx={{ mb: 2 }}
                          >
                            {suggestion.mutualFriends} mutual {suggestion.mutualFriends === 1 ? 'friend' : 'friends'}
                          </Typography>
                        )}
                        
                        {suggestion.requestSent ? (
                          <Button 
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => handleCancelRequest(suggestion.id)}
                            sx={{ 
                              mt: 'auto', 
                              borderRadius: 4,
                              minWidth: '120px'
                            }}
                          >
                            Cancel Request
                          </Button>
                        ) : (
                          <Button 
                            variant="contained"
                            startIcon={<PersonAddIcon />}
                            size="small"
                            onClick={() => handleSendRequest(suggestion.id)}
                            sx={{ 
                              mt: 'auto', 
                              borderRadius: 4,
                              minWidth: '120px'
                            }}
                          >
                            Add Friend
                          </Button>
                        )}
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
                
                {/* Loading indicator at the bottom */}
                {loading && suggestions.length > 0 && (
                  <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
                    <CircularProgress size={30} />
                  </Box>
                )}
                
                {/* End of list message */}
                {!loading && !hasMore && suggestions.length > 0 && (
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      textAlign: "center", 
                      py: 2, 
                      px: 3,
                      mt: 3, 
                      borderRadius: 3,
                      borderStyle: 'dashed'
                    }}
                  >
                    <Typography color="text.secondary">
                      You've reached the end of the list
                    </Typography>
                  </Paper>
                )}
              </>
            )}
          </Box>
        </Card>
      </Container>
    </Scene>
  );
}

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
  Button,
  Paper,
  Chip,
  Container,
  Tab,
  Tabs,
  useTheme,
  alpha
} from "@mui/material";
import { formatAvatarUrl, getUserInitials } from "../utils/avatarUtils";
import PersonIcon from "@mui/icons-material/Person";
import HomeIcon from "@mui/icons-material/Home";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import SortIcon from "@mui/icons-material/Sort";
import GroupAddIcon from "@mui/icons-material/GroupAdd";


import { getMyFriends, removeFriend, listFriends, getPendingRequests, acceptFriendRequest, rejectFriendRequest } from "../services/userService";
import useUserInfo from "../hooks/useUserInfo";
import { isAuthenticated, logOut } from "../services/authenticationService";
import Scene from "./Scene";

export default function Friends() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const { userInfo } = useUserInfo(); // Thêm hook useUserInfo để lấy thông tin người dùng
  
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [error, setError] = useState(null);
  const [requestsError, setRequestsError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [hasMoreRequests, setHasMoreRequests] = useState(true);
  const [page, setPage] = useState({
    number: 0,
    size: 10,
    totalElements: 0,
    totalPages: 1
  });
  const [requestsPage, setRequestsPage] = useState({
    number: 0,
    size: 10,
    totalElements: 0,
    totalPages: 1
  });
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  
  // Check if we're viewing someone else's friends list
  const queryParams = new URLSearchParams(location.search);
  const userId = queryParams.get('userId');
  const isOwnFriendsList = !userId;
  
  // Observer for infinite scrolling - friends list
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
  
  // Observer for infinite scrolling - friend requests list
  const requestsObserver = useRef();
  const lastRequestElementRef = useCallback(node => {
    if (loadingRequests) return;
    if (requestsObserver.current) requestsObserver.current.disconnect();
    requestsObserver.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMoreRequests) {
        setRequestsPage(prevPage => ({
          ...prevPage,
          number: prevPage.number + 1
        }));
      }
    });
    if (node) requestsObserver.current.observe(node);
  }, [loadingRequests, hasMoreRequests]);

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
  
  // Fetch pending friend requests
  const fetchPendingRequests = async () => {
    if (!isOwnFriendsList) return; // Only fetch for the current user
    
    try {
      setLoadingRequests(true);
      const response = await getPendingRequests({
        number: requestsPage.number,
        size: requestsPage.size
      });
      
      const data = response.data;
      const newRequests = data.result.content || [];
      
      // Append new requests to existing list for infinite scroll
      setPendingRequests(prev => {
        // If we're on page 0, replace the list
        if (requestsPage.number === 0) return newRequests;
        // Otherwise append to existing list
        return [...prev, ...newRequests];
      });
      
      // Update pagination info
      setRequestsPage(prevPage => ({
        ...prevPage,
        totalElements: data.result.totalElements || 0,
        totalPages: data.result.totalPages || 1
      }));
      
      // Check if we've reached the end
      setHasMoreRequests(newRequests.length > 0 && requestsPage.number < data.result.totalPages - 1);
      
      setRequestsError(null);
    } catch (error) {
      console.error("Error fetching friend requests:", error);
      if (error.response?.status === 401) {
        logOut();
        navigate("/login");
      } else {
        setRequestsError("Failed to load friend requests. Please try again later.");
      }
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
    } else {
      fetchFriends();
    }
  }, [navigate, page.number]);
  
  // Effect for fetching pending requests when tab changes or page changes
  useEffect(() => {
    if (isOwnFriendsList && activeTab === 1) {
      fetchPendingRequests();
    }
  }, [isOwnFriendsList, activeTab, requestsPage.number]);

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
  
  // Reset function for friend requests
  const resetRequestsList = () => {
    setPendingRequests([]);
    setRequestsPage({
      number: 0,
      size: 10,
      totalElements: 0,
      totalPages: 1
    });
    setHasMoreRequests(true);
  };
  
  // Handle accepting a friend request
  const handleAcceptRequest = async (senderId) => {
    try {
      await acceptFriendRequest(senderId);
      // Remove the accepted request from the list
      setPendingRequests(prev => prev.filter(request => request.id !== senderId));
    } catch (error) {
      console.error("Error accepting friend request:", error);
      setRequestsError("Failed to accept friend request. Please try again.");
    }
  };
  
  // Handle rejecting a friend request
  const handleRejectRequest = async (senderId) => {
    try {
      await rejectFriendRequest(senderId);
      // Remove the rejected request from the list
      setPendingRequests(prev => prev.filter(request => request.id !== senderId));
    } catch (error) {
      console.error("Error rejecting friend request:", error);
      setRequestsError("Failed to reject friend request. Please try again.");
    }
  };
  
  // Handle viewing a friend's profile
  const handleViewProfile = (friendId) => {
    navigate(`/user-profile/${friendId}`);
  };
  


  // Tab handling đã được di chuyển lên đầu component

  return (
    <Scene>
      {/* Simple header */}
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
              {isOwnFriendsList ? 'My Friends' : 'User\'s Friends'}
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
          {/* Loại bỏ các nút action không cần thiết */}
          
          {/* Tabs navigation - Chỉ hiển thị tab Friend Requests khi xem danh sách bạn bè của chính mình */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', px: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 3 } }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange} 
              aria-label="friends tabs"
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab 
                icon={<PeopleAltIcon />} 
                label="All Friends" 
                iconPosition="start" 
                sx={{ 
                  fontWeight: 'medium',
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                  minHeight: { xs: 48, sm: 'auto' },
                  px: { xs: 1, sm: 2 }
                }} 
              />
              {isOwnFriendsList && (
                <Tab 
                  icon={<PersonAddIcon />} 
                  label="Friend Requests" 
                  iconPosition="start" 
                  sx={{ 
                    fontWeight: 'medium',
                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                    minHeight: { xs: 48, sm: 'auto' },
                    px: { xs: 1, sm: 2 }
                  }} 
                />
              )}
            </Tabs>
          </Box>
          
          {/* Hiển thị số lượng bạn bè hoặc lời mời kết bạn */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: { xs: 2, sm: 3 }, py: { xs: 1.5, sm: 2 } }}>
            <Typography variant="subtitle1" fontWeight="medium">
              {activeTab === 0 ? (
                <>{friends.length} {friends.length === 1 ? 'Friend' : 'Friends'}</>
              ) : (
                <>{pendingRequests.length} {pendingRequests.length === 1 ? 'Friend Request' : 'Friend Requests'}</>
              )}
            </Typography>
          </Box>

        <Box sx={{ px: { xs: 2, sm: 3 } }}>
          {/* Tab content - Hiển thị nội dung tương ứng với tab đang chọn */}
          {activeTab === 0 ? (
            // Tab All Friends
            loading && friends.length === 0 ? (
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
              <Typography>Loading friends...</Typography>
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 3, mt: 2 }}>
              {error}
            </Alert>
          ) : friends.length === 0 ? (
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
                No friends yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
                {isOwnFriendsList 
                  ? "You don't have any friends yet. Start connecting with people to build your network!"
                  : "This user doesn't have any friends yet."}
              </Typography>
              {isOwnFriendsList && (
                <Button 
                  variant="contained" 
                  startIcon={<PersonAddIcon />}
                  sx={{ borderRadius: 4 }}
                >
                  Find Friends
                </Button>
              )}
            </Box>
          ) : (
            <>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {friends.map((friend, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={`${friend.id}-${index}`}>
                    <Paper
                      ref={index === friends.length - 1 ? lastFriendElementRef : null}
                      elevation={2}
                      sx={{ 
                        p: { xs: 1.5, sm: 2 }, 
                        borderRadius: { xs: 2, sm: 3 },
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': { 
                          transform: { xs: 'none', sm: 'translateY(-4px)' },
                          boxShadow: 6,
                          bgcolor: alpha(theme.palette.primary.main, 0.03)
                        },
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        height: '100%',
                        touchAction: 'manipulation'
                      }}
                      onClick={() => handleViewProfile(friend.id)}
                    >
                      <Avatar 
                        src={formatAvatarUrl(friend.avatarUrl)}
                        sx={{ 
                          width: { xs: 60, sm: 80 }, 
                          height: { xs: 60, sm: 80 }, 
                          mb: { xs: 1.5, sm: 2 },
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                      >
                        {!friend.avatarUrl && getUserInitials(friend)}
                      </Avatar>
                      
                      <Typography 
                        variant="h6" 
                        align="center"
                        noWrap
                        sx={{ fontWeight: 'bold', mb: 0.5 }}
                      >
                        {`${friend.firstName || ""} ${friend.lastName || ""}`}
                      </Typography>
                      
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        align="center"
                        noWrap
                        sx={{ mb: 1 }}
                      >
                        @{friend.username}
                      </Typography>
                      
                      {friend.city && (
                        <Chip 
                          label={friend.city} 
                          size="small" 
                          sx={{ mt: 'auto' }}
                        />
                      )}
                    </Paper>
                  </Grid>
                ))}
              </Grid>
              
              {/* Loading indicator at the bottom */}
              {loading && friends.length > 0 && (
                <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
                  <CircularProgress size={30} />
                </Box>
              )}
              
              {/* End of list message */}
              {!loading && !hasMore && friends.length > 0 && (
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
          )
        ) : (
          // Tab Friend Requests - Chỉ hiển thị khi isOwnFriendsList = true
          loadingRequests && pendingRequests.length === 0 ? (
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
              <Typography>Loading friend requests...</Typography>
            </Box>
          ) : requestsError ? (
            <Alert severity="error" sx={{ mb: 3, mt: 2 }}>
              {requestsError}
            </Alert>
          ) : pendingRequests.length === 0 ? (
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
                <PersonAddIcon fontSize="large" />
              </Avatar>
              <Typography variant="h6" gutterBottom>
                No friend requests
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
                You don't have any pending friend requests at the moment.
              </Typography>
            </Box>
          ) : (
            <>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {pendingRequests.map((request, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={`request-${request.id}-${index}`}>
                    <Paper
                      elevation={2}
                      sx={{ 
                        p: { xs: 1.5, sm: 2 }, 
                        borderRadius: { xs: 2, sm: 3 },
                        transition: 'all 0.3s ease',
                        '&:hover': { 
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
                        src={request.avatarUrl}
                        sx={{ 
                          width: { xs: 60, sm: 80 }, 
                          height: { xs: 60, sm: 80 }, 
                          mb: { xs: 1.5, sm: 2 },
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                      >
                        {!request.avatarUrl && (request.firstName?.charAt(0) || request.username?.charAt(0))}
                      </Avatar>
                      
                      <Typography 
                        variant="h6" 
                        align="center"
                        noWrap
                        sx={{ fontWeight: 'bold', mb: 0.5 }}
                      >
                        {`${request.firstName || ""} ${request.lastName || ""}`}
                      </Typography>
                      
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        align="center"
                        noWrap
                        sx={{ mb: 2 }}
                      >
                        @{request.username}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: { xs: 0.5, sm: 1 }, mt: 'auto', flexWrap: { xs: 'wrap', sm: 'nowrap' }, justifyContent: 'center' }}>
                        <Button 
                          variant="contained" 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAcceptRequest(request.id);
                          }}
                          sx={{ 
                            borderRadius: 4,
                            fontSize: { xs: '0.7rem', sm: '0.8125rem' },
                            py: { xs: 0.5 },
                            px: { xs: 1, sm: 2 },
                            minWidth: { xs: '65px', sm: '64px' }
                          }}
                        >
                          Accept
                        </Button>
                        <Button 
                          variant="outlined" 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRejectRequest(request.id);
                          }}
                          sx={{ 
                            borderRadius: 4,
                            fontSize: { xs: '0.7rem', sm: '0.8125rem' },
                            py: { xs: 0.5 },
                            px: { xs: 1, sm: 2 },
                            minWidth: { xs: '65px', sm: '64px' }
                          }}
                        >
                          Decline
                        </Button>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
              
              {/* Loading indicator at the bottom */}
              {loadingRequests && pendingRequests.length > 0 && (
                <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
                  <CircularProgress size={30} />
                </Box>
              )}
              
              {/* End of list message */}
              {!loadingRequests && !hasMoreRequests && pendingRequests.length > 0 && (
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
          )
        )}
        </Box>
      </Card>
    </Container>
    </Scene>
  );
}

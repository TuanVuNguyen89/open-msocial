import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  Avatar,
  Box,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Badge,
  Skeleton,
  Tooltip,
  Button,
  useTheme
} from "@mui/material";

// Icons
import HomeIcon from "@mui/icons-material/Home";
import PeopleIcon from "@mui/icons-material/People";
import PersonIcon from "@mui/icons-material/Person";
import NotificationsIcon from "@mui/icons-material/Notifications";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import MessageIcon from "@mui/icons-material/Message";
import ExploreIcon from "@mui/icons-material/Explore";

// Services
import { getMyInfo } from "../services/userService";
import { logOut } from "../services/authenticationService";
import useUserInfo from "../hooks/useUserInfo";

function SideMenu() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Sử dụng hook useUserInfo để lấy thông tin người dùng
  const { userInfo, loadingUserInfo } = useUserInfo();
  const [notificationCount, setNotificationCount] = useState(3); // Example notification count

  // Handle logout
  const handleLogout = () => {
    logOut();
    navigate("/login");
  };

  // Navigation items
  const mainNavItems = [
    { text: "Home", icon: <HomeIcon />, path: "/" },
    { text: "Friends", icon: <PeopleIcon />, path: "/friends" },
    { text: "Messages", icon: <MessageIcon />, path: "/messages", badge: 5 },
    { text: "Notifications", icon: <NotificationsIcon />, path: "/notifications", badge: notificationCount },
    { text: "Explore", icon: <ExploreIcon />, path: "/explore" },
  ];

  const secondaryNavItems = [
    { text: "Saved Posts", icon: <BookmarkIcon />, path: "/saved" },
    { text: "Settings", icon: <SettingsIcon />, path: "/settings" },
  ];

  // Check if a nav item is active
  const isActive = (path) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  // Render nav item with optional badge
  const renderNavItem = (item) => (
    <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
      <ListItemButton 
        component={Link} 
        to={item.path}
        sx={{
          borderRadius: 2,
          mx: 1,
          backgroundColor: isActive(item.path) ? `${theme.palette.primary.main}15` : 'transparent',
          '&:hover': {
            backgroundColor: isActive(item.path) ? `${theme.palette.primary.main}25` : `${theme.palette.action.hover}`
          }
        }}
      >
        <ListItemIcon sx={{ color: isActive(item.path) ? theme.palette.primary.main : 'inherit' }}>
          {item.badge ? (
            <Badge badgeContent={item.badge} color="error">
              {item.icon}
            </Badge>
          ) : (
            item.icon
          )}
        </ListItemIcon>
        <ListItemText
          primary={item.text}
          primaryTypographyProps={{ 
            fontWeight: isActive(item.path) ? "bold" : "medium",
            color: isActive(item.path) ? theme.palette.primary.main : 'inherit'
          }}
        />
      </ListItemButton>
    </ListItem>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar />
      
      {/* User Profile Section with Background */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        position: 'relative',
        width: '100%',
        pb: 2,
        mb: 10 // Thêm margin bottom để tạo khoảng cách với các phần tử phía dưới
      }}>
        {/* Background Image */}
        <Box
          sx={{
            height: 80, // Giảm chiều cao của background
            width: '100%',
            backgroundImage: userInfo?.backgroundUrl 
              ? `url(${userInfo.backgroundUrl})` 
              : 'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative'
          }}
        />
        
        {/* Avatar and User Info */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          position: 'absolute',
          top: 30, // Điều chỉnh vị trí avatar
          width: '100%'
        }}>
          {loadingUserInfo ? (
            <>
              <Skeleton variant="circular" width={80} height={80} />
              <Skeleton variant="text" width={150} height={30} sx={{ mt: 1 }} />
              <Skeleton variant="text" width={100} height={20} />
            </>
          ) : (
            <>
              <Avatar 
                src={userInfo?.avatarUrl} 
                alt={userInfo?.username}
                sx={{ 
                  width: 70, // Giảm kích thước avatar
                  height: 70, 
                  mb: 1, 
                  boxShadow: 2,
                  border: '3px solid white',
                  cursor: 'pointer',
                  backgroundColor: theme.palette.primary.main
                }}
                onClick={() => navigate('/profile')}
              >
                {userInfo?.firstName?.charAt(0) || userInfo?.username?.charAt(0)}
              </Avatar>
              <Typography variant="subtitle1" fontWeight="bold" noWrap>
                {userInfo?.firstName && userInfo?.lastName 
                  ? `${userInfo.firstName} ${userInfo.lastName}` 
                  : userInfo?.username || 'User Name'}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                @{userInfo?.username || 'username'}
              </Typography>
              
              <Button 
                variant="outlined" 
                size="small" 
                startIcon={<PersonIcon />}
                onClick={() => navigate('/profile')}
                sx={{ mt: 1, borderRadius: 4 }}
              >
                View Profile
              </Button>
            </>
          )}
        </Box>
      </Box>
      
      <Divider sx={{ mt: 8, mb: 2 }} /> {/* Tăng margin top */}
      
      {/* Main Navigation */}
      <List sx={{ px: 1, flexGrow: 0, width: '100%' }}>
        {mainNavItems.map(renderNavItem)}
      </List>
      
      <Divider sx={{ my: 2 }} />
      
      {/* Secondary Navigation */}
      <List sx={{ px: 1, flexGrow: 0, width: '100%' }}>
        {secondaryNavItems.map(renderNavItem)}
      </List>
      
      {/* Logout Button - at the bottom */}
      <Box sx={{ mt: 'auto', mb: 2, px: 3 }}>
        <Button
          variant="outlined"
          color="error"
          fullWidth
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{ borderRadius: 2, py: 1 }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );
}

export default SideMenu;

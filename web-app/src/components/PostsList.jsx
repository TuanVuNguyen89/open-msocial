import React from 'react';
import { Box, CircularProgress, Typography, IconButton, Tooltip } from '@mui/material';
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PublicIcon from "@mui/icons-material/Public";
import PeopleIcon from "@mui/icons-material/People";
import LockIcon from "@mui/icons-material/Lock";
import Post from './Post';

const PostsList = ({ 
  posts, 
  loading, 
  lastPostElementRef, 
  handlePostMenuOpen,
  currentUserId
}) => {
  return (
    <Box sx={{ width: "100%" }}>
      {posts.map((post, index) => {
        const isLastPost = posts.length === index + 1;
        // Check if the post belongs to the current user
        const isCurrentUserPost = post.user && post.user.id === currentUserId;
        
        return (
          <Box key={post.id} sx={{ position: "relative", width: "100%" }}>
            {isLastPost ? (
              <div ref={lastPostElementRef}>
                <Post post={post} />
              </div>
            ) : (
              <Post post={post} />
            )}
            {/* Display visibility icon */}
            {post.visibility && (
              <Tooltip title={post.visibility.toLowerCase()} placement="top">
                <Box sx={{ position: "absolute", top: { xs: 10, sm: 15 }, right: isCurrentUserPost ? { xs: 40, sm: 45 } : { xs: 10, sm: 15 } }}>
                  {post.visibility.toLowerCase() === "public" ? (
                    <PublicIcon fontSize="small" sx={{ color: "text.secondary" }} />
                  ) : post.visibility.toLowerCase() === "friends" ? (
                    <PeopleIcon fontSize="small" sx={{ color: "text.secondary" }} />
                  ) : (
                    <LockIcon fontSize="small" sx={{ color: "text.secondary" }} />
                  )}
                </Box>
              </Tooltip>
            )}
            
            {/* Only show edit/delete menu for the current user's posts */}
            {isCurrentUserPost && (
              <IconButton 
                size="small" 
                sx={{ 
                  position: "absolute", 
                  top: { xs: 5, sm: 10 }, 
                  right: { xs: 5, sm: 10 },
                  padding: { xs: 0.5, sm: 1 }
                }}
                onClick={(e) => handlePostMenuOpen(e, post.id)}
                aria-label="post-actions"
              >
                <MoreVertIcon />
              </IconButton>
            )}
          </Box>
        );
      })}
      
      {/* Loading indicator */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", width: "100%", my: 2 }}>
          <CircularProgress size={30} />
        </Box>
      )}
      
      {/* Empty state */}
      {!loading && posts.length === 0 && (
        <Box sx={{ textAlign: "center", my: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No posts to display. Create your first post!
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default PostsList;

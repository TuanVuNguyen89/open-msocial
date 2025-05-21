import React from 'react';
import { Box, CircularProgress, Typography, IconButton } from '@mui/material';
import MoreVertIcon from "@mui/icons-material/MoreVert";
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
          <Box key={post.id} sx={{ position: "relative" }}>
            <Post 
              ref={isLastPost ? lastPostElementRef : null} 
              post={post} 
            />
            {/* Only show edit/delete menu for the current user's posts */}
            {isCurrentUserPost && (
              <IconButton 
                size="small" 
                sx={{ position: "absolute", top: 10, right: 10 }}
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

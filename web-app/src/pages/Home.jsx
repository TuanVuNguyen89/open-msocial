import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Card, Menu, MenuItem } from "@mui/material";
import { isAuthenticated } from "../services/authenticationService";
import Scene from "./Scene";
import { getFeed, createPost, updatePost, deletePost } from "../services/postService";
import { logOut } from "../services/authenticationService";
import { getMyInfo } from "../services/userService";

// Import components
import PostCreationForm from "../components/PostCreationForm";
import PostsList from "../components/PostsList";
import PostEditDialog from "../components/PostEditDialog";
import DeletePostDialog from "../components/DeletePostDialog";
import Notification from "../components/Notification";
import { getFormattingTemplate } from "../utils/formattingUtils";

// Import new component files we'll create for refactoring
import PostActionsMenu from "../components/PostActionsMenu";
import usePostManagement from "../hooks/usePostManagement";
import useInfiniteScroll from "../hooks/useInfiniteScroll";
import useUserInfo from "../hooks/useUserInfo";

export default function Home() {
  // User info state
  const { userInfo, loadingUserInfo } = useUserInfo();
  
  // Post management state and handlers
  const { 
    posts, 
    loading,
    handleCreatePost,
    handleUpdatePost,
    handleDeletePost,
    handlePostMenuOpen,
    handlePostMenuClose,
    handleEditDialogOpen,
    handleEditDialogClose,
    handleDeleteDialogOpen,
    handleDeleteDialogClose,
    insertFormatting,
    newPostContent,
    setNewPostContent,
    newPostVisibility,
    setNewPostVisibility,
    isCreatingPost,
    isPostFormExpanded,
    setIsPostFormExpanded,
    editingPost,
    editPostContent,
    setEditPostContent,
    editPostVisibility,
    setEditPostVisibility,
    isEditDialogOpen,
    isDeleteDialogOpen,
    deletingPostId,
    anchorEl,
    selectedPostId
  } = usePostManagement(userInfo);
  
  // Infinite scroll functionality
  const { lastPostElementRef } = useInfiniteScroll(loading, posts);
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
    }
  }, [navigate]);
  
  // Handle snackbar close
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar(prev => ({...prev, open: false}));
  };

  return (
    <Scene>
      <Box sx={{
        maxWidth: 700,
        width: "100%",
        mx: "auto",
        px: { xs: 1, sm: 2, md: 3 },
        boxSizing: 'border-box'
      }}>
        {/* Post creation card */}
        <Card sx={{ mb: 4, boxShadow: 3, borderRadius: 2 }}>
          <PostCreationForm
            userInfo={userInfo}
            isPostFormExpanded={isPostFormExpanded}
            setIsPostFormExpanded={setIsPostFormExpanded}
            newPostContent={newPostContent}
            setNewPostContent={setNewPostContent}
            newPostVisibility={newPostVisibility}
            setNewPostVisibility={setNewPostVisibility}
            isCreatingPost={isCreatingPost}
            handleCreatePost={handleCreatePost}
            insertFormatting={insertFormatting}
          />
        </Card>
        
        {/* Posts list - Now passing the currentUserId */}
        <PostsList
          posts={posts}
          loading={loading}
          lastPostElementRef={lastPostElementRef}
          handlePostMenuOpen={handlePostMenuOpen}
          currentUserId={userInfo?.id} // Pass the current user ID to fix edit/delete functionality
        />
        
        {/* Post action menu - Extracted to a separate component */}
        <PostActionsMenu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handlePostMenuClose}
          onEdit={handleEditDialogOpen}
          onDelete={handleDeleteDialogOpen}
        />
        
        {/* Edit post dialog */}
        <PostEditDialog
          isOpen={isEditDialogOpen}
          onClose={handleEditDialogClose}
          editingPost={editingPost}
          editPostContent={editPostContent}
          setEditPostContent={setEditPostContent}
          editPostVisibility={editPostVisibility}
          setEditPostVisibility={setEditPostVisibility}
          handleUpdatePost={handleUpdatePost}
          insertFormatting={insertFormatting}
        />
        
        {/* Delete post confirmation dialog */}
        <DeletePostDialog
          isOpen={isDeleteDialogOpen}
          onClose={handleDeleteDialogClose}
          onConfirm={handleDeletePost}
        />
        
        {/* Snackbar for notifications */}
        <Notification
          snackbar={snackbar}
          handleClose={handleSnackbarClose}
        />
      </Box>
    </Scene>
  );
}

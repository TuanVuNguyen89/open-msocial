import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFeed, createPost, updatePost, deletePost } from '../services/postService';
import { logOut } from '../services/authenticationService';
import { getFormattingTemplate } from '../utils/formattingUtils';

/**
 * Custom hook to manage post operations (create, read, update, delete)
 */
const usePostManagement = (userInfo) => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  
  // Post creation state
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostVisibility, setNewPostVisibility] = useState("PUBLIC");
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [isPostFormExpanded, setIsPostFormExpanded] = useState(false);
  
  // Post editing state
  const [editingPost, setEditingPost] = useState(null);
  const [editPostContent, setEditPostContent] = useState("");
  const [editPostVisibility, setEditPostVisibility] = useState("PUBLIC");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Post deletion state
  const [deletingPostId, setDeletingPostId] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Menu state for post actions
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPostId, setSelectedPostId] = useState(null);
  
  const navigate = useNavigate();
  
  useEffect(() => {
    loadPosts(page);
  }, [page]);
  
  const loadPosts = (page) => {
    console.log(`loading feed for page ${page}`);
    setLoading(true);
    getFeed(page)
      .then((response) => {
        setTotalPages(response.data.result.totalPages);
        setPosts((prevPosts) => [...prevPosts, ...response.data.result.data]);
        setHasMore(response.data.result.data.length > 0);
        console.log("loaded feed:", response.data.result);
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          logOut();
          navigate("/login");
        } else {
          console.error("Failed to load posts:", error);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };
  
  // Handle post menu open
  const handlePostMenuOpen = (event, postId) => {
    setAnchorEl(event.currentTarget);
    setSelectedPostId(postId);
  };
  
  // Handle post menu close
  const handlePostMenuClose = () => {
    setAnchorEl(null);
    setSelectedPostId(null);
  };
  
  // Handle post creation
  const handleCreatePost = () => {
    if (!newPostContent.trim()) {
      console.error("Post content cannot be empty");
      return;
    }
    
    setIsCreatingPost(true);
    
    const newPost = {
      content: newPostContent,
      visibility: newPostVisibility
    };
    
    createPost(newPost)
      .then(response => {
        console.log("Post created successfully");
        setNewPostContent("");
        // Refresh posts by resetting and reloading
        setPosts([]);
        setPage(1);
        loadPosts(1);
      })
      .catch(error => {
        console.error("Failed to create post:", error);
      })
      .finally(() => {
        setIsCreatingPost(false);
      });
  };
  
  // Handle edit post dialog open
  const handleEditDialogOpen = () => {
    const post = posts.find(p => p.id === selectedPostId);
    if (post) {
      setEditingPost(post);
      setEditPostContent(post.content);
      setEditPostVisibility(post.visibility || "PUBLIC");
      setIsEditDialogOpen(true);
    }
    handlePostMenuClose();
  };
  
  // Handle edit post dialog close
  const handleEditDialogClose = () => {
    setIsEditDialogOpen(false);
    setEditingPost(null);
    setEditPostContent("");
  };
  
  // Handle post update
  const handleUpdatePost = () => {
    if (!editPostContent.trim()) {
      console.error("Post content cannot be empty");
      return;
    }
    
    const updatedPost = {
      content: editPostContent,
      visibility: editPostVisibility
    };
    
    updatePost(editingPost.id, updatedPost)
      .then(response => {
        console.log("Post updated successfully");
        // Update post in the local state
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post.id === editingPost.id ? 
              {...post, content: editPostContent, visibility: editPostVisibility} : 
              post
          )
        );
        handleEditDialogClose();
      })
      .catch(error => {
        console.error("Failed to update post:", error);
      });
  };
  
  // Handle delete post dialog open
  const handleDeleteDialogOpen = () => {
    setDeletingPostId(selectedPostId);
    setIsDeleteDialogOpen(true);
    handlePostMenuClose();
  };
  
  // Handle delete post dialog close
  const handleDeleteDialogClose = () => {
    setIsDeleteDialogOpen(false);
    setDeletingPostId(null);
  };
  
  // Handle post deletion
  const handleDeletePost = () => {
    deletePost(deletingPostId)
      .then(response => {
        console.log("Post deleted successfully");
        // Remove post from the local state
        setPosts(prevPosts => prevPosts.filter(post => post.id !== deletingPostId));
        handleDeleteDialogClose();
      })
      .catch(error => {
        console.error("Failed to delete post:", error);
      });
  };
  
  // Insert formatting template
  const insertFormatting = (formatType) => {
    const { template } = getFormattingTemplate(formatType);
    
    if (isEditDialogOpen) { // Edit dialog is open
      setEditPostContent(prev => prev + template);
    } else { // Create post form
      setNewPostContent(prev => prev + template);
    }
  };

  return {
    posts,
    loading,
    page,
    setPage,
    totalPages,
    hasMore,
    setHasMore,
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
  };
};

export default usePostManagement;

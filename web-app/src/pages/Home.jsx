import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Box, 
  Card, 
  CircularProgress, 
  Typography, 
  TextField, 
  Button, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  Tabs,
  Tab,
  Divider,
  Tooltip,
  Paper,
  Grid,
  Avatar
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CancelIcon from "@mui/icons-material/Cancel";
import FunctionsIcon from "@mui/icons-material/Functions";
import PreviewIcon from "@mui/icons-material/Preview";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import TitleIcon from "@mui/icons-material/Title";
import CodeIcon from "@mui/icons-material/Code";
import LinkIcon from "@mui/icons-material/Link";
import ImageIcon from "@mui/icons-material/Image";
import TableChartIcon from "@mui/icons-material/TableChart";
import FormatColorTextIcon from "@mui/icons-material/FormatColorText";
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { isAuthenticated } from "../services/authenticationService";
import Scene from "./Scene";
import Post from "../components/Post";
import { getFeed, createPost, updatePost, deletePost } from "../services/postService";
import { logOut } from "../services/authenticationService";
import { getMyInfo } from "../services/userService";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const observer = useRef();
  const lastPostElementRef = useRef();
  
  // Post creation state
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostVisibility, setNewPostVisibility] = useState("PUBLIC");
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [createTabValue, setCreateTabValue] = useState(0);
  const [createPreview, setCreatePreview] = useState("");
  const [isPostFormExpanded, setIsPostFormExpanded] = useState(false);
  const textFieldRef = useRef(null);
  
  // User info state
  const [userInfo, setUserInfo] = useState(null);
  const [loadingUserInfo, setLoadingUserInfo] = useState(true);
  
  // Post editing state
  const [editingPost, setEditingPost] = useState(null);
  const [editPostContent, setEditPostContent] = useState("");
  const [editPostVisibility, setEditPostVisibility] = useState("PUBLIC");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editTabValue, setEditTabValue] = useState(0);
  const [editPreview, setEditPreview] = useState("");
  
  // Post deletion state
  const [deletingPostId, setDeletingPostId] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Menu state for post actions
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPostId, setSelectedPostId] = useState(null);
  
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
    } else {
      loadPosts(page);
      fetchUserInfo();
    }
  }, [navigate, page]);
  
  // Fetch user info
  const fetchUserInfo = () => {
    setLoadingUserInfo(true);
    getMyInfo()
      .then(response => {
        setUserInfo(response.data.result);
        console.log("User info loaded:", response.data.result);
      })
      .catch(error => {
        console.error("Error loading user info:", error);
        if (error.response && error.response.status === 401) {
          logOut();
          navigate("/login");
        }
      })
      .finally(() => {
        setLoadingUserInfo(false);
      });
  };

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
          setSnackbar({
            open: true,
            message: "Failed to load posts. Please try again.",
            severity: "error"
          });
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
      setSnackbar({
        open: true,
        message: "Post content cannot be empty",
        severity: "error"
      });
      return;
    }
    
    setIsCreatingPost(true);
    
    const newPost = {
      content: newPostContent,
      visibility: newPostVisibility
    };
    
    createPost(newPost)
      .then(response => {
        setSnackbar({
          open: true,
          message: "Post created successfully",
          severity: "success"
        });
        setNewPostContent("");
        // Refresh posts by resetting and reloading
        setPosts([]);
        setPage(1);
        loadPosts(1);
      })
      .catch(error => {
        setSnackbar({
          open: true,
          message: "Failed to create post: " + (error.response?.data?.message || "Unknown error"),
          severity: "error"
        });
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
      setSnackbar({
        open: true,
        message: "Post content cannot be empty",
        severity: "error"
      });
      return;
    }
    
    const updatedPost = {
      content: editPostContent,
      visibility: editPostVisibility
    };
    
    updatePost(editingPost.id, updatedPost)
      .then(response => {
        setSnackbar({
          open: true,
          message: "Post updated successfully",
          severity: "success"
        });
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
        setSnackbar({
          open: true,
          message: "Failed to update post: " + (error.response?.data?.message || "Unknown error"),
          severity: "error"
        });
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
        setSnackbar({
          open: true,
          message: "Post deleted successfully",
          severity: "success"
        });
        // Remove post from the local state
        setPosts(prevPosts => prevPosts.filter(post => post.id !== deletingPostId));
        handleDeleteDialogClose();
      })
      .catch(error => {
        setSnackbar({
          open: true,
          message: "Failed to delete post: " + (error.response?.data?.message || "Unknown error"),
          severity: "error"
        });
      });
  };
  
  // Handle snackbar close
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar(prev => ({...prev, open: false}));
  };
  
  // Handle create tab change
  const handleCreateTabChange = (event, newValue) => {
    setCreateTabValue(newValue);
    if (newValue === 1) { // Preview tab
      setCreatePreview(newPostContent);
    }
  };
  
  // Handle edit tab change
  const handleEditTabChange = (event, newValue) => {
    setEditTabValue(newValue);
    if (newValue === 1) { // Preview tab
      setEditPreview(editPostContent);
    }
  };
  
  // Function to render content with LaTeX support
  const renderContentWithLatex = (text) => {
    if (!text) return "";
    
    // Regular expression to match LaTeX expressions
    // Inline LaTeX: $...$
    // Block LaTeX: $$...$$
    const inlineLatexRegex = /\$(.*?)\$/g;
    const blockLatexRegex = /\$\$(.*?)\$\$/g;
    
    // First split by block LaTeX
    const blockParts = text.split(blockLatexRegex);
    
    // Process each part
    return blockParts.map((part, index) => {
      // Even indices are regular text or might contain inline LaTeX
      if (index % 2 === 0) {
        // Split by inline LaTeX
        const inlineParts = part.split(inlineLatexRegex);
        
        return inlineParts.map((inlinePart, inlineIndex) => {
          // Even indices are regular text
          if (inlineIndex % 2 === 0) {
            return inlinePart;
          }
          // Odd indices are inline LaTeX expressions
          try {
            return <InlineMath key={`inline-${index}-${inlineIndex}`} math={inlinePart} />;
          } catch (error) {
            console.error("Error rendering inline LaTeX:", error);
            return `$${inlinePart}$`; // Return original text if rendering fails
          }
        });
      }
      // Odd indices are block LaTeX expressions
      try {
        return <BlockMath key={`block-${index}`} math={part} />;
      } catch (error) {
        console.error("Error rendering block LaTeX:", error);
        return `$$${part}$$`; // Return original text if rendering fails
      }
    });
  };
  
  // Insert formatting template
  const insertFormatting = (formatType) => {
    let template = "";
    let selectionStart = 0;
    let selectionEnd = 0;
    
    // Define templates for different formatting types
    switch (formatType) {
      case 'bold':
        template = "**Bold Text**";
        selectionStart = 2;
        selectionEnd = 11;
        break;
      case 'italic':
        template = "*Italic Text*";
        selectionStart = 1;
        selectionEnd = 12;
        break;
      case 'heading1':
        template = "# Heading 1";
        selectionStart = 2;
        selectionEnd = 10;
        break;
      case 'heading2':
        template = "## Heading 2";
        selectionStart = 3;
        selectionEnd = 11;
        break;
      case 'heading3':
        template = "### Heading 3";
        selectionStart = 4;
        selectionEnd = 12;
        break;
      case 'bulletList':
        template = "\n- Item 1\n- Item 2\n- Item 3";
        selectionStart = 3;
        selectionEnd = 9;
        break;
      case 'numberedList':
        template = "\n1. Item 1\n2. Item 2\n3. Item 3";
        selectionStart = 4;
        selectionEnd = 10;
        break;
      case 'quote':
        template = "> Blockquote text";
        selectionStart = 2;
        selectionEnd = 15;
        break;
      case 'code':
        template = "```\ncode block\n```";
        selectionStart = 4;
        selectionEnd = 13;
        break;
      case 'inlineCode':
        template = "`inline code`";
        selectionStart = 1;
        selectionEnd = 12;
        break;
      case 'link':
        template = "[Link text](https://example.com)";
        selectionStart = 1;
        selectionEnd = 10;
        break;
      case 'image':
        template = "![Image alt text](https://example.com/image.jpg)";
        selectionStart = 2;
        selectionEnd = 15;
        break;
      case 'table':
        template = "\n| Header 1 | Header 2 | Header 3 |\n| --- | --- | --- |\n| Row 1 Col 1 | Row 1 Col 2 | Row 1 Col 3 |\n| Row 2 Col 1 | Row 2 Col 2 | Row 2 Col 3 |";
        break;
      case 'horizontalRule':
        template = "\n---\n";
        break;
      case 'inlineLatex':
        template = "$x^2 + y^2 = z^2$";
        selectionStart = 1;
        selectionEnd = 13;
        break;
      case 'blockLatex':
        template = "$$\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$$";
        selectionStart = 2;
        selectionEnd = 30;
        break;
      case 'strikethrough':
        template = "~~Strikethrough text~~";
        selectionStart = 2;
        selectionEnd = 20;
        break;
      case 'highlight':
        template = "==Highlighted text==";
        selectionStart = 2;
        selectionEnd = 18;
        break;
      case 'subscript':
        template = "H~2~O";
        selectionStart = 1;
        selectionEnd = 4;
        break;
      case 'superscript':
        template = "E=mc^2^";
        selectionStart = 4;
        selectionEnd = 7;
        break;
      default:
        template = "";
    }
    
    if (createTabValue === 0) { // Edit tab for create
      setNewPostContent(prev => prev + template);
    } else if (editTabValue === 0) { // Edit tab for edit
      setEditPostContent(prev => prev + template);
    }
  };
  
  // Function to render content with Markdown and LaTeX support
  const renderContent = (text) => {
    if (!text) return "";
    
    return (
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          // Custom renderer for code blocks
          code: ({node, inline, className, children, ...props}) => {
            const match = /language-(\w+)/.exec(className || '');
            return !inline ? (
              <Paper elevation={0} sx={{ p: 1, bgcolor: 'grey.100', my: 1, borderRadius: 1, overflow: 'auto' }}>
                <pre style={{ margin: 0 }}>
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              </Paper>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          // Custom renderer for math expressions
          p: ({node, children, ...props}) => {
            const childrenArray = React.Children.toArray(children);
            const processedChildren = childrenArray.map((child, index) => {
              if (typeof child === 'string') {
                // Process inline LaTeX: $...$
                const inlineLatexRegex = /\$(.*?)\$/g;
                const parts = [];
                let lastIndex = 0;
                let match;
                
                while ((match = inlineLatexRegex.exec(child)) !== null) {
                  // Add text before the match
                  if (match.index > lastIndex) {
                    parts.push(child.substring(lastIndex, match.index));
                  }
                  
                  // Add the LaTeX component
                  try {
                    parts.push(<InlineMath key={`inline-${index}-${match.index}`} math={match[1]} />);
                  } catch (error) {
                    console.error("Error rendering inline LaTeX:", error);
                    parts.push(`$${match[1]}$`);
                  }
                  
                  lastIndex = match.index + match[0].length;
                }
                
                // Add remaining text
                if (lastIndex < child.length) {
                  parts.push(child.substring(lastIndex));
                }
                
                return parts.length > 0 ? parts : child;
              }
              
              // Process block LaTeX: $$...$$
              if (typeof child === 'string' && child.startsWith('$$') && child.endsWith('$$')) {
                const latex = child.substring(2, child.length - 2);
                try {
                  return <BlockMath key={`block-${index}`} math={latex} />;
                } catch (error) {
                  console.error("Error rendering block LaTeX:", error);
                  return child;
                }
              }
              
              return child;
            });
            
            return <p {...props}>{processedChildren}</p>;
          }
        }}
      >
        {text}
      </ReactMarkdown>
    );
  };

  useEffect(() => {
    if (!hasMore) return;

    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        if (page < totalPages) {
          setPage((prevPage) => prevPage + 1);
        }
      }
    });
    if (lastPostElementRef.current) {
      observer.current.observe(lastPostElementRef.current);
    }

    setHasMore(false);
  }, [hasMore]);

  return (
    <Scene>
      <Box sx={{ maxWidth: 700, width: "100%", mx: "auto" }}>
        {/* Post creation card */}
        <Card sx={{ mb: 4, boxShadow: 3, borderRadius: 2 }}>
          {!isPostFormExpanded ? (
            // Collapsed state - simple input field
            <Box 
              sx={{ 
                p: 2, 
                display: 'flex', 
                alignItems: 'center',
                cursor: 'text',
                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.03)' }
              }}
              onClick={() => {
                setIsPostFormExpanded(true);
                // Focus the text field after expansion
                setTimeout(() => {
                  if (textFieldRef.current) {
                    textFieldRef.current.focus();
                  }
                }, 100);
              }}
            >
              {userInfo && userInfo.avatarUrl ? (
                <Box
                  component="img"
                  src={userInfo.avatarUrl}
                  alt={userInfo.username || "User"}
                  sx={{ 
                    mr: 2, 
                    width: 40, 
                    height: 40, 
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <Box
                  sx={{ 
                    mr: 2, 
                    width: 40, 
                    height: 40, 
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                >
                  {userInfo ? userInfo.username?.charAt(0).toUpperCase() || "U" : "U"}
                </Box>
              )}
              <Typography color="text.secondary">
                What do you think?
              </Typography>
            </Box>
          ) : (
            // Expanded state - full post creation form
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Create a new post
                </Typography>
                <IconButton size="small" onClick={() => setIsPostFormExpanded(false)}>
                  <CancelIcon fontSize="small" />
                </IconButton>
              </Box>
              
              {/* Formatting toolbar */}
              <Paper variant="outlined" sx={{ mb: 2, p: 1 }}>
                <Grid container spacing={1}>
                  <Grid item>
                    <Tooltip title="Bold text (Ctrl+B)">
                      <IconButton size="small" onClick={() => insertFormatting('bold')}>
                        <FormatBoldIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                  <Grid item>
                    <Tooltip title="Italic text (Ctrl+I)">
                      <IconButton size="small" onClick={() => insertFormatting('italic')}>
                        <FormatItalicIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                  <Grid item>
                    <Tooltip title="Strikethrough text">
                      <IconButton size="small" onClick={() => insertFormatting('strikethrough')}>
                        <FormatColorTextIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                  <Grid item>
                    <Divider orientation="vertical" flexItem />
                  </Grid>
                  <Grid item>
                    <Tooltip title="Heading 1">
                      <IconButton size="small" onClick={() => insertFormatting('heading1')}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <TitleIcon fontSize="small" />
                          <Typography variant="caption" sx={{ ml: 0.5 }}>1</Typography>
                        </Box>
                      </IconButton>
                    </Tooltip>
                  </Grid>
                  <Grid item>
                    <Tooltip title="Heading 2">
                      <IconButton size="small" onClick={() => insertFormatting('heading2')}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <TitleIcon fontSize="small" />
                          <Typography variant="caption" sx={{ ml: 0.5 }}>2</Typography>
                        </Box>
                      </IconButton>
                    </Tooltip>
                  </Grid>
                  <Grid item>
                    <Tooltip title="Heading 3">
                      <IconButton size="small" onClick={() => insertFormatting('heading3')}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <TitleIcon fontSize="small" />
                          <Typography variant="caption" sx={{ ml: 0.5 }}>3</Typography>
                        </Box>
                      </IconButton>
                    </Tooltip>
                  </Grid>
                  <Grid item>
                    <Divider orientation="vertical" flexItem />
                  </Grid>
                  <Grid item>
                    <Tooltip title="Bulleted list">
                      <IconButton size="small" onClick={() => insertFormatting('bulletList')}>
                        <FormatListBulletedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                  <Grid item>
                    <Tooltip title="Numbered list">
                      <IconButton size="small" onClick={() => insertFormatting('numberedList')}>
                        <FormatListNumberedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                  <Grid item>
                    <Tooltip title="Blockquote">
                      <IconButton size="small" onClick={() => insertFormatting('quote')}>
                        <FormatQuoteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                  <Grid item>
                    <Divider orientation="vertical" flexItem />
                  </Grid>
                  <Grid item>
                    <Tooltip title="Code block">
                      <IconButton size="small" onClick={() => insertFormatting('code')}>
                        <CodeIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                  <Grid item>
                    <Tooltip title="Inline code">
                      <IconButton size="small" onClick={() => insertFormatting('inlineCode')}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CodeIcon fontSize="small" sx={{ transform: 'scale(0.8)' }} />
                        </Box>
                      </IconButton>
                    </Tooltip>
                  </Grid>
                  <Grid item>
                    <Divider orientation="vertical" flexItem />
                  </Grid>
                  <Grid item>
                    <Tooltip title="Link">
                      <IconButton size="small" onClick={() => insertFormatting('link')}>
                        <LinkIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                  <Grid item>
                    <Tooltip title="Image">
                      <IconButton size="small" onClick={() => insertFormatting('image')}>
                        <ImageIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                  <Grid item>
                    <Tooltip title="Table">
                      <IconButton size="small" onClick={() => insertFormatting('table')}>
                        <TableChartIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                  <Grid item>
                    <Divider orientation="vertical" flexItem />
                  </Grid>
                  <Grid item>
                    <Tooltip title="Inline LaTeX formula">
                      <IconButton size="small" onClick={() => insertFormatting('inlineLatex')}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <FunctionsIcon fontSize="small" sx={{ transform: 'scale(0.8)' }} />
                        </Box>
                      </IconButton>
                    </Tooltip>
                  </Grid>
                  <Grid item>
                    <Tooltip title="Block LaTeX formula">
                      <IconButton size="small" onClick={() => insertFormatting('blockLatex')}>
                        <FunctionsIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                </Grid>
              </Paper>
              
              <Tabs value={createTabValue} onChange={handleCreateTabChange} sx={{ mb: 2 }}>
                <Tab label="Edit" />
                <Tab label="Preview" />
              </Tabs>
              
              {createTabValue === 0 ? (
                <TextField
                  inputRef={textFieldRef}
                  fullWidth
                  multiline
                  minRows={3}
                  maxRows={15}
                  placeholder="What's on your mind? Use the formatting toolbar above to add rich text formatting."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  sx={{ mb: 2 }}
                  InputProps={{
                    sx: {
                      alignItems: 'flex-start',
                    },
                  }}
                />
              ) : (
                <Box sx={{ minHeight: '150px', p: 2, border: '1px solid #ddd', borderRadius: 1, mb: 2, overflow: 'auto' }}>
                  {newPostContent ? (
                    renderContent(createPreview)
                  ) : (
                    <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      Preview will appear here
                    </Typography>
                  )}
                </Box>
              )}
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <FormControl sx={{ minWidth: 120 }}>
                  <InputLabel id="visibility-label">Visibility</InputLabel>
                  <Select
                    labelId="visibility-label"
                    value={newPostVisibility}
                    label="Visibility"
                    onChange={(e) => setNewPostVisibility(e.target.value)}
                  >
                    <MenuItem value="PUBLIC">Public</MenuItem>
                    <MenuItem value="FRIENDS">Friends</MenuItem>
                    <MenuItem value="PRIVATE">Private</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    handleCreatePost();
                    setIsPostFormExpanded(false); // Collapse after posting
                  }}
                  disabled={isCreatingPost || !newPostContent.trim()}
                >
                  {isCreatingPost ? "Posting..." : "Post"}
                </Button>
              </Box>
            </Box>
          )}
        </Card>
        
        {/* Posts list */}
        <Box sx={{ width: "100%" }}>
          {posts.map((post, index) => {
            const isLastPost = posts.length === index + 1;
            return (
              <Box key={post.id} sx={{ position: "relative" }}>
                <Post 
                  ref={isLastPost ? lastPostElementRef : null} 
                  post={post} 
                />
                <IconButton 
                  size="small" 
                  sx={{ position: "absolute", top: 10, right: 10 }}
                  onClick={(e) => handlePostMenuOpen(e, post.id)}
                >
                  <MoreVertIcon />
                </IconButton>
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
        
        {/* Post action menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handlePostMenuClose}
        >
          <MenuItem onClick={handleEditDialogOpen}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            Edit
          </MenuItem>
          <MenuItem onClick={handleDeleteDialogOpen} sx={{ color: "error.main" }}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Delete
          </MenuItem>
        </Menu>
        
        {/* Edit post dialog */}
        <Dialog open={isEditDialogOpen} onClose={handleEditDialogClose} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Typography>Edit Post</Typography>
          </DialogTitle>
          <DialogContent>
            {/* Formatting toolbar */}
            <Paper variant="outlined" sx={{ mb: 2, p: 1, mt: 2 }}>
              <Grid container spacing={1}>
                <Grid item>
                  <Tooltip title="Bold text (Ctrl+B)">
                    <IconButton size="small" onClick={() => insertFormatting('bold')}>
                      <FormatBoldIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Grid>
                <Grid item>
                  <Tooltip title="Italic text (Ctrl+I)">
                    <IconButton size="small" onClick={() => insertFormatting('italic')}>
                      <FormatItalicIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Grid>
                <Grid item>
                  <Tooltip title="Strikethrough text">
                    <IconButton size="small" onClick={() => insertFormatting('strikethrough')}>
                      <FormatColorTextIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Grid>
                <Grid item>
                  <Divider orientation="vertical" flexItem />
                </Grid>
                <Grid item>
                  <Tooltip title="Heading 1">
                    <IconButton size="small" onClick={() => insertFormatting('heading1')}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <TitleIcon fontSize="small" />
                        <Typography variant="caption" sx={{ ml: 0.5 }}>1</Typography>
                      </Box>
                    </IconButton>
                  </Tooltip>
                </Grid>
                <Grid item>
                  <Tooltip title="Bulleted list">
                    <IconButton size="small" onClick={() => insertFormatting('bulletList')}>
                      <FormatListBulletedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Grid>
                <Grid item>
                  <Tooltip title="Numbered list">
                    <IconButton size="small" onClick={() => insertFormatting('numberedList')}>
                      <FormatListNumberedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Grid>
                <Grid item>
                  <Tooltip title="Code block">
                    <IconButton size="small" onClick={() => insertFormatting('code')}>
                      <CodeIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Grid>
                <Grid item>
                  <Tooltip title="Link">
                    <IconButton size="small" onClick={() => insertFormatting('link')}>
                      <LinkIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Grid>
                <Grid item>
                  <Tooltip title="Image">
                    <IconButton size="small" onClick={() => insertFormatting('image')}>
                      <ImageIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Grid>
                <Grid item>
                  <Tooltip title="Inline LaTeX formula">
                    <IconButton size="small" onClick={() => insertFormatting('inlineLatex')}>
                      <FunctionsIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Grid>
              </Grid>
            </Paper>
            
            <Tabs value={editTabValue} onChange={handleEditTabChange} sx={{ mb: 2 }}>
              <Tab label="Edit" />
              <Tab label="Preview" />
            </Tabs>
            
            {editTabValue === 0 ? (
              <TextField
                fullWidth
                multiline
                rows={6}
                value={editPostContent}
                onChange={(e) => setEditPostContent(e.target.value)}
                placeholder="Use the formatting toolbar above to add rich text formatting."
                sx={{ mt: 2 }}
              />
            ) : (
              <Box sx={{ minHeight: '150px', p: 2, border: '1px solid #ddd', borderRadius: 1, mb: 2, mt: 2, overflow: 'auto' }}>
                {editPostContent ? (
                  renderContent(editPreview)
                ) : (
                  <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    Preview will appear here
                  </Typography>
                )}
              </Box>
            )}
            
            <FormControl sx={{ minWidth: 120, mt: 2 }}>
              <InputLabel id="edit-visibility-label">Visibility</InputLabel>
              <Select
                labelId="edit-visibility-label"
                value={editPostVisibility}
                label="Visibility"
                onChange={(e) => setEditPostVisibility(e.target.value)}
              >
                <MenuItem value="PUBLIC">Public</MenuItem>
                <MenuItem value="FRIENDS">Friends</MenuItem>
                <MenuItem value="PRIVATE">Private</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditDialogClose}>Cancel</Button>
            <Button onClick={handleUpdatePost} variant="contained">
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Delete post confirmation dialog */}
        <Dialog open={isDeleteDialogOpen} onClose={handleDeleteDialogClose}>
          <DialogTitle>Delete Post</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this post? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteDialogClose}>Cancel</Button>
            <Button onClick={handleDeletePost} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Snackbar for notifications */}
        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={6000} 
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Scene>
  );
}

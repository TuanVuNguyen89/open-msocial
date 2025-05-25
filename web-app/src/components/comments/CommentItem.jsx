import React, { useState } from 'react';
import { Box, Avatar, Typography, IconButton, Menu, MenuItem, TextField, Button } from '@mui/material';
import { MoreVert as MoreVertIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { formatAvatarUrl, getUserInitials } from '../../utils/avatarUtils';
import { updateComment, deleteComment } from '../../services/commentService';
import { getProfile } from '../../services/userService';

const CommentItem = ({ comment, onCommentUpdated, onCommentDeleted, onReplyClick, currentUserId }) => {
  // Kiểm tra cấu trúc comment để debug
  console.log('Comment data for debug:', {
    comment,
    pUser: comment.pUser,
    content: comment.content
  });
  
  const { id, content, user = {}, pUser, createdAt } = comment;
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content || '');
  const isOwnComment = user?.id === currentUserId;
  
  const formattedDate = createdAt ? 
    formatDistanceToNow(new Date(createdAt), { addSuffix: true }) : 
    'just now';
  
  const handleUserClick = (userId) => {
    if (userId) {
      console.log('Navigating to user profile:', userId);
      navigate(`/user-profile/${userId}`);
    } else {
      console.log('No userId provided for navigation');
    }
  };
  
  // Hàm xử lý click vào tag username - sử dụng API searchUserByUsername
  const handleUsernameClick = async (username) => {
    try {
      // Nếu tag trùng với username của pUser
      if (pUser && pUser.username === username && pUser.id) {
        handleUserClick(pUser.id);
        return;
      }
      
      // Nếu tag trùng với username của người dùng hiện tại
      if (user && user.username === username && user.id) {
        handleUserClick(user.id);
        return;
      }
      
      // Sử dụng API mới để tìm kiếm người dùng theo username
      import('../services/userService')
        .then(async (module) => {
          try {
            const response = await module.searchUserByUsername(username);
            if (response && response.data && response.data.id) {
              // Nếu tìm thấy người dùng, chuyển hướng đến profile của họ
              handleUserClick(response.data.id);
            } else {
              console.log('Không tìm thấy người dùng với username:', username);
            }
          } catch (error) {
            console.error('Lỗi khi tìm kiếm người dùng theo username:', error);
          }
        })
        .catch(error => {
          console.error('Lỗi khi import userService:', error);
        });
    } catch (error) {
      console.error('Lỗi khi xử lý click vào tag username:', error);
    }
  };
  
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleEditClick = () => {
    setIsEditing(true);
    handleMenuClose();
  };
  
  const handleDeleteClick = async () => {
    try {
      await deleteComment(id);
      onCommentDeleted(id);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
    handleMenuClose();
  };
  
  const handleUpdateComment = async () => {
    try {
      await updateComment({ id, content: editedContent });
      onCommentUpdated({ ...comment, content: editedContent });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };
  
  const handleReplyClick = () => {
    onReplyClick(comment);
  };
  
  // Function to parse content and create links for @username mentions
  const renderContent = (text) => {
    if (!text) return '';
    
    // Regex to match @username mentions
    const mentionRegex = /@(\w+)/g;
    
    // Split text by mention regex
    const parts = [];
    let lastIndex = 0;
    let match;
    
    while ((match = mentionRegex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      
      // Add the mention as a link
      const mentionedUsername = match[1];
      
      // Luôn tạo link cho tất cả các @username
      // Nếu pUser tồn tại và username khớp, sử dụng ID của pUser
      const userId = (pUser && pUser.username === mentionedUsername) ? pUser.id : null;
      
      parts.push(
        <Typography
          component="span"
          key={`mention-${match.index}`}
          sx={{
            color: 'primary.main',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
          onClick={() => {
            // Sử dụng hàm handleUsernameClick mới để xử lý click vào tag username
            handleUsernameClick(mentionedUsername);
          }}
        >
          @{mentionedUsername}
        </Typography>
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    
    return parts.length > 0 ? parts : text;
  };
  
  return (
    <Box sx={{ display: 'flex', mb: 2 }}>
      <Avatar 
        src={formatAvatarUrl(user?.avatarUrl)} 
        sx={{ mr: 1, cursor: 'pointer' }}
        onClick={() => user?.id && handleUserClick(user.id)}
      >
        {!user?.avatarUrl && getUserInitials(user)}
      </Avatar>
      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography 
              variant="subtitle2" 
              component="span" 
              sx={{ cursor: 'pointer', fontWeight: 'bold' }}
              onClick={() => user?.id && handleUserClick(user.id)}
            >
              {user?.firstName || ''} {user?.lastName || ''}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
              {formattedDate}
            </Typography>
          </Box>
          {isOwnComment && (
            <Box>
              <IconButton size="small" onClick={handleMenuOpen}>
                <MoreVertIcon fontSize="small" />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleEditClick}>
                  <EditIcon fontSize="small" sx={{ mr: 1 }} />
                  Edit
                </MenuItem>
                <MenuItem onClick={handleDeleteClick}>
                  <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                  Delete
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Box>
        
        {isEditing ? (
          <Box sx={{ mt: 1 }}>
            <TextField
              fullWidth
              multiline
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              size="small"
              sx={{ mb: 1 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                size="small" 
                onClick={handleUpdateComment}
              >
                Save
              </Button>
            </Box>
          </Box>
        ) : (
          <Box>
            <Typography variant="body2">{renderContent(content || '')}</Typography>
            <Button 
              variant="text" 
              size="small" 
              sx={{ mt: 0.5, textTransform: 'none' }}
              onClick={handleReplyClick}
            >
              Reply
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default CommentItem;

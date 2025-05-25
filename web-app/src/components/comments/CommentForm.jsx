import React, { useState } from 'react';
import { Box, TextField, Button, Avatar } from '@mui/material';
import { createComment } from '../../services/commentService';
import { formatAvatarUrl, getUserInitials } from '../../utils/avatarUtils';

const CommentForm = ({ postId, currentUser, parentComment = null, onCommentAdded, onCancelReply = null }) => {
  const [content, setContent] = useState(
    parentComment ? `@${parentComment.user.username} ` : ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      const commentData = {
        postId,
        content,
        parentId: parentComment ? parentComment.id : null
      };
      
      const response = await createComment(commentData);
      
      // Kiểm tra cấu trúc dữ liệu trả về từ API
      console.log('Comment response:', response.data.result );
      
      if (response.data.result) {
        // Đảm bảo thêm thông tin người dùng hiện tại vào comment trước khi gửi lên
        const commentData = response.data.result;
        
        const commentWithUserInfo = {
          ...commentData,
          content: commentData.content, // Đảm bảo nội dung được gán đúng
          user: currentUser // Thêm thông tin người dùng hiện tại
        };
        
        onCommentAdded(commentWithUserInfo);
        setContent('');
        if (onCancelReply) onCancelReply();
      }
    } catch (error) {
      console.error('Error creating comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCancel = () => {
    if (onCancelReply) {
      onCancelReply();
    }
  };
  
  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', mb: 2, width: '100%' }}>
      <Avatar 
        src={formatAvatarUrl(currentUser?.avatarUrl)} 
        sx={{ mr: 1, mt: 0.5 }}
      >
        {!currentUser?.avatarUrl && getUserInitials(currentUser)}
      </Avatar>
      <Box sx={{ flexGrow: 1 }}>
        <TextField
          fullWidth
          multiline
          size="small"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={parentComment ? "Trả lời..." : "Viết bình luận..."}
          sx={{ mb: 1 }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          {parentComment && (
            <Button
              variant="outlined"
              size="small"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
          )}
          <Button
            type="submit"
            variant="contained"
            size="small"
            disabled={!content.trim() || isSubmitting}
          >
            {isSubmitting ? 'Đang gửi...' : 'Gửi'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default CommentForm;

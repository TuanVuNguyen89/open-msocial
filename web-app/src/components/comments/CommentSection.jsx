import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Divider, CircularProgress } from '@mui/material';
import { getAllCommentsByPostId } from '../../services/commentService';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';

const CommentSection = ({ postId, currentUser }) => {
  const [comments, setComments] = useState([]);
  const [replyToComment, setReplyToComment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMoreComments, setHasMoreComments] = useState(false);
  const PAGE_SIZE = 10;
  
  const fetchComments = async (pageNum = 0, append = false) => {
    setLoading(true);
    try {
      const response = await getAllCommentsByPostId(postId, pageNum, PAGE_SIZE);
      //console.log('Fetched comments response:', response.data);
      
      // Xử lý dữ liệu tùy theo cấu trúc API
      let fetchedComments = [];
      let totalPages = 0;
      
      if (response.data?.result) {
        // Nếu API trả về result
        fetchedComments = response.data.result.content || [];
        totalPages = response.data.result.totalPages || 0;
      } else if (response.data?.content) {
        // Nếu API trả về content trực tiếp
        fetchedComments = response.data.content || [];
        totalPages = response.data.totalPages || 0;
      } else {
        // Trường hợp khác
        fetchedComments = Array.isArray(response.data) ? response.data : [];
      }
      
      //console.log('Processed comments:', fetchedComments);
      setComments(prev => append ? [...prev, ...fetchedComments] : fetchedComments);
      setHasMoreComments(pageNum < totalPages - 1);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch comments when the component mounts or postId changes
  useEffect(() => {
    fetchComments();
  }, [postId]);
  
  const handleCommentAdded = (newComment) => {
    console.log('New comment received:', newComment);
    
    // Check if the comment data is nested in result property
    const commentData = newComment.result || newComment;
    
    // Make sure the comment has the proper structure with user data
    const formattedComment = {
      ...commentData,
      content: commentData.content || '', // Ensure content exists
      // If user data isn't present, use currentUser data
      user: commentData.user || {
        id: currentUser.id,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        username: currentUser.username,
        avatarUrl: currentUser.avatarUrl
      }
    };
    
    console.log('Formatted comment with content:', formattedComment);
    
    // Add the new comment to the top of the list
    setComments(prev => [formattedComment, ...prev]);
  };
  
  const handleCommentUpdated = (updatedComment) => {
    // Update the comment in the list
    setComments(prev => 
      prev.map(comment => 
        comment.id === updatedComment.id ? updatedComment : comment
      )
    );
  };
  
  const handleCommentDeleted = (commentId) => {
    // Remove the comment from the list
    setComments(prev => prev.filter(comment => comment.id !== commentId));
  };
  
  const handleReplyClick = (comment) => {
    setReplyToComment(comment);
  };
  
  const handleCancelReply = () => {
    setReplyToComment(null);
  };
  
  const handleLoadMoreComments = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchComments(nextPage, true);
  };
  
  // Group comments by rootId to create a two-level structure
  // Tất cả các replies (comment bậc 2 trở lên) sẽ được hiển thị ở cùng một mức
  const organizeComments = (commentList) => {
    const rootComments = [];
    const repliesByRootId = new Map(); // Tất cả các replies theo rootId
    
    // Phân loại comment thành root và replies
    commentList.forEach(comment => {
      // Nếu là comment gốc
      if (!comment.rootId || comment.rootId === comment.id) {
        rootComments.push({
          ...comment,
          replies: []
        });
      } else {
        // Nếu là reply, thêm vào danh sách replies của rootId tương ứng
        const rootId = comment.rootId;
        if (!repliesByRootId.has(rootId)) {
          repliesByRootId.set(rootId, []);
        }
        repliesByRootId.get(rootId).push(comment);
      }
    });
    
    // Gán các replies vào comment gốc tương ứng
    rootComments.forEach(rootComment => {
      const replies = repliesByRootId.get(rootComment.id) || [];
      rootComment.replies = replies;
    });
    
    return rootComments;
  };
  
  const organizedComments = organizeComments(comments);
  
  return (
    <Box sx={{ mt: 2 }}>
      <Divider sx={{ my: 2 }} />
      
      <Typography variant="h6" gutterBottom>
        Bình luận
      </Typography>
      
      {currentUser ? (
        <CommentForm
          postId={postId}
          currentUser={currentUser}
          onCommentAdded={handleCommentAdded}
        />
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress size={24} />
          <Typography variant="body2" sx={{ ml: 2 }}>
            Đang tải thông tin người dùng...
          </Typography>
        </Box>
      )}
      
      {loading && page === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress size={24} />
        </Box>
      ) : (
        <>
          {organizedComments.length > 0 ? (
            <Box sx={{ mt: 2 }}>
              {organizedComments.map(comment => (
                <Box key={comment.id} sx={{ mb: 2 }}>
                  <CommentItem
                    comment={comment}
                    onCommentUpdated={handleCommentUpdated}
                    onCommentDeleted={handleCommentDeleted}
                    onReplyClick={handleReplyClick}
                    currentUserId={currentUser?.id}
                  />
                  
                  {/* Display replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <Box sx={{ pl: 5, mt: 1 }}>
                      {comment.replies.map(reply => (
                        <Box key={reply.id} sx={{ mb: 2 }}>
                          <CommentItem
                            comment={reply}
                            onCommentUpdated={handleCommentUpdated}
                            onCommentDeleted={handleCommentDeleted}
                            onReplyClick={handleReplyClick}
                            currentUserId={currentUser?.id}
                          />
                          
                          {/* Reply form for reply comments (bậc 2 trở lên) */}
                          {replyToComment && replyToComment.id === reply.id && (
                            <Box sx={{ mt: 1 }}>
                              <CommentForm
                                postId={postId}
                                currentUser={currentUser}
                                parentComment={replyToComment}
                                onCommentAdded={handleCommentAdded}
                                onCancelReply={handleCancelReply}
                              />
                            </Box>
                          )}
                        </Box>
                      ))}
                    </Box>
                  )}
                  
                  {/* Reply form for root comments (bậc 1) */}
                  {replyToComment && replyToComment.id === comment.id && (
                    <Box sx={{ pl: 5, mt: 1 }}>
                      <CommentForm
                        postId={postId}
                        currentUser={currentUser}
                        parentComment={replyToComment}
                        onCommentAdded={handleCommentAdded}
                        onCancelReply={handleCancelReply}
                      />
                    </Box>
                  )}
                </Box>
              ))}
              
              {hasMoreComments && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Button 
                    variant="outlined" 
                    onClick={handleLoadMoreComments}
                    disabled={loading}
                  >
                    {loading ? (
                      <CircularProgress size={24} sx={{ mr: 1 }} />
                    ) : null}
                    Xem thêm bình luận
                  </Button>
                </Box>
              )}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
              Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
            </Typography>
          )}
        </>
      )}
    </Box>
  );
};

export default CommentSection;

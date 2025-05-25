import { Box, Avatar, Typography, Card, Paper } from "@mui/material";
import React, { forwardRef, useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { formatAvatarUrl, getUserInitials } from "../utils/avatarUtils";
import CommentSection from "./comments/CommentSection";
import { getMyInfo } from "../services/userService";

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

const Post = forwardRef((props, ref) => {
  const { content, created, createdDate, visibility, id: postId } = props.post;
  const user = props.post.user || {};
  const { avatarUrl, username, id: userId } = user;
  const [currentUser, setCurrentUser] = useState(null);
  const [showComments, setShowComments] = useState(true);
  
  const navigate = useNavigate();
  
  // Format the date if createdDate is available
  const formattedDate = createdDate ? 
    formatDistanceToNow(new Date(createdDate), { addSuffix: true }) : 
    created;
  
  // Fetch current user information
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await getMyInfo();
        if (response.data && response.data.result) {
          console.log("USER: ", response.data.result);
          setCurrentUser(response.data.result);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };
    
    fetchCurrentUser();
  }, []);
  
  const handleUserClick = () => {
    if (userId) {
      navigate(`/user-profile/${userId}`);
    }
  };
  
  return (
    <Card
      ref={ref}
      sx={{
        width: "100%",
        padding: 3,
        marginBottom: 3,
        boxShadow: 2,
        borderRadius: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
        }}
      >
        <Avatar 
          src={formatAvatarUrl(avatarUrl)} 
          sx={{ 
            marginRight: 2,
            cursor: "pointer",
          }} 
          onClick={handleUserClick}
        >
          {!avatarUrl && getUserInitials(user)}
        </Avatar>
        <Box sx={{ width: "100%" }}>
          <Box sx={{ display: "flex", flexDirection: "row", gap: "10px", alignItems: "center", width: "100%", pr: 4 }}>
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
              onClick={handleUserClick}
            >
              {username || "Unknown User"}
            </Typography>
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 400,
                color: "text.secondary",
              }}
            >
              {formattedDate}
            </Typography>
            {visibility && (
              <Typography
                sx={{
                  fontSize: 12,
                  color: "text.secondary",
                  marginLeft: "auto",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                {visibility.toLowerCase()}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              fontSize: 14,
              marginTop: 1,
              '& p': { margin: '0.5em 0' },
              '& h1': { fontSize: '1.5em', fontWeight: 'bold', margin: '0.5em 0' },
              '& h2': { fontSize: '1.3em', fontWeight: 'bold', margin: '0.5em 0' },
              '& h3': { fontSize: '1.1em', fontWeight: 'bold', margin: '0.5em 0' },
              '& ul, & ol': { paddingLeft: '1.5em', margin: '0.5em 0' },
              '& blockquote': { borderLeft: '3px solid #ccc', paddingLeft: '1em', margin: '0.5em 0' },
              '& code': { fontFamily: 'monospace', backgroundColor: 'rgba(0,0,0,0.05)', padding: '0.1em 0.3em', borderRadius: '3px' },
              '& a': { color: 'primary.main', textDecoration: 'none' },
              '& img': { maxWidth: '100%', height: 'auto' },
              '& table': { borderCollapse: 'collapse', width: '100%', margin: '0.5em 0' },
              '& th, & td': { border: '1px solid #ddd', padding: '0.5em' },
              '& th': { backgroundColor: 'rgba(0,0,0,0.05)' },
            }}
          >
            {renderContent(content)}
          </Box>
          
          {/* Comment Section */}
          {postId && showComments && currentUser && (
            <CommentSection postId={postId} currentUser={currentUser} />
          )}
        </Box>
      </Box>
    </Card>
  );
});

export default Post;

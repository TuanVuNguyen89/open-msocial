import { Box, Avatar, Typography, Card, Paper } from "@mui/material";
import React, { useState, useEffect } from 'react';
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

const Post = (props) => {
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
          //console.log("USER: ", response.data.result);
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
      sx={{
        width: "100%",
        padding: { xs: 2, sm: 3 },
        marginBottom: 3,
        boxShadow: 2,
        borderRadius: 2,
        overflow: 'hidden',
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
            marginRight: { xs: 1, sm: 2 },
            cursor: "pointer",
            width: { xs: 32, sm: 40 },
            height: { xs: 32, sm: 40 },
          }} 
          onClick={handleUserClick}
        >
          {!avatarUrl && getUserInitials(user)}
        </Avatar>
        <Box sx={{ width: "100%" }}>
          <Box sx={{ 
            display: "flex", 
            flexDirection: "row", 
            gap: { xs: "5px", sm: "10px" }, 
            alignItems: "center", 
            width: "100%", 
            pr: { xs: 2, sm: 4 },
            flexWrap: "wrap",
          }}>
            <Typography
              sx={{
                fontSize: { xs: 13, sm: 14 },
                fontWeight: 600,
                cursor: "pointer",
                mr: 1,
              }}
              onClick={handleUserClick}
            >
              {username || "Unknown User"}
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: 11, sm: 12 },
                fontWeight: 400,
                color: "text.secondary",
                lineHeight: 1.5,
              }}
            >
              {formattedDate}
            </Typography>

          </Box>
          <Box
            sx={{
              fontSize: { xs: 13, sm: 14 },
              marginTop: 1,
              overflowWrap: 'break-word',
              wordBreak: 'break-word',
              maxWidth: '100%',
              boxSizing: 'border-box',
              '& p': { margin: '0.5em 0', maxWidth: '100%' },
              '& h1': { fontSize: { xs: '1.3em', sm: '1.5em' }, fontWeight: 'bold', margin: '0.5em 0', maxWidth: '100%' },
              '& h2': { fontSize: { xs: '1.1em', sm: '1.3em' }, fontWeight: 'bold', margin: '0.5em 0', maxWidth: '100%' },
              '& h3': { fontSize: { xs: '1em', sm: '1.1em' }, fontWeight: 'bold', margin: '0.5em 0', maxWidth: '100%' },
              '& ul, & ol': { paddingLeft: '1.5em', margin: '0.5em 0', maxWidth: '100%' },
              '& blockquote': { borderLeft: '3px solid #ccc', paddingLeft: '1em', margin: '0.5em 0', maxWidth: '100%' },
              '& code': { fontFamily: 'monospace', backgroundColor: 'rgba(0,0,0,0.05)', padding: '0.1em 0.3em', borderRadius: '3px', fontSize: { xs: '0.85em', sm: '1em' }, overflowX: 'auto', display: 'inline-block', maxWidth: '100%' },
              '& pre': { overflowX: 'auto', maxWidth: '100%', whiteSpace: 'pre-wrap' },
              '& a': { color: 'primary.main', textDecoration: 'none', wordBreak: 'break-all' },
              '& img': { maxWidth: '100%', height: 'auto', display: 'block' },
              '& table': { borderCollapse: 'collapse', width: '100%', margin: '0.5em 0', display: { xs: 'block', sm: 'table' }, overflowX: 'auto', tableLayout: 'fixed' },
              '& th, & td': { border: '1px solid #ddd', padding: { xs: '0.3em', sm: '0.5em' }, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' },
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
};

export default Post;

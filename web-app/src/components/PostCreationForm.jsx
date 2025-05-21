import React, { useState, useRef } from "react";
import { 
  Box, 
  TextField, 
  Button, 
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Typography,
  IconButton,
  Paper,
  Grid,
  Divider,
  Tooltip
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CancelIcon from "@mui/icons-material/Cancel";
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
import FunctionsIcon from "@mui/icons-material/Functions";
import MarkdownRenderer from "./MarkdownRenderer";

const PostCreationForm = ({ 
  userInfo, 
  isPostFormExpanded, 
  setIsPostFormExpanded, 
  newPostContent, 
  setNewPostContent, 
  newPostVisibility, 
  setNewPostVisibility, 
  isCreatingPost, 
  handleCreatePost,
  insertFormatting
}) => {
  const [createTabValue, setCreateTabValue] = useState(0);
  const [createPreview, setCreatePreview] = useState("");
  const textFieldRef = useRef(null);

  // Handle create tab change
  const handleCreateTabChange = (event, newValue) => {
    setCreateTabValue(newValue);
    if (newValue === 1) { // Preview tab
      setCreatePreview(newPostContent);
    }
  };

  // Collapsed view - simple input field
  if (!isPostFormExpanded) {
    return (
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
    );
  }

  // Expanded view - full post creation form
  return (
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
      <FormattingToolbar insertFormatting={insertFormatting} />
      
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
            <MarkdownRenderer content={createPreview} />
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
  );
};

// Formatting toolbar component
const FormattingToolbar = ({ insertFormatting }) => {
  return (
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
  );
};

export default PostCreationForm;

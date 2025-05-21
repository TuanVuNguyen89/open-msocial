import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Box,
  Paper,
  Grid,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import TitleIcon from "@mui/icons-material/Title";
import CodeIcon from "@mui/icons-material/Code";
import LinkIcon from "@mui/icons-material/Link";
import ImageIcon from "@mui/icons-material/Image";
import FormatColorTextIcon from "@mui/icons-material/FormatColorText";
import FunctionsIcon from "@mui/icons-material/Functions";
import MarkdownRenderer from './MarkdownRenderer';

const PostEditDialog = ({
  isOpen,
  onClose,
  editingPost,
  editPostContent,
  setEditPostContent,
  editPostVisibility,
  setEditPostVisibility,
  handleUpdatePost,
  insertFormatting
}) => {
  const [editTabValue, setEditTabValue] = useState(0);
  const [editPreview, setEditPreview] = useState("");

  // Handle edit tab change
  const handleEditTabChange = (event, newValue) => {
    setEditTabValue(newValue);
    if (newValue === 1) { // Preview tab
      setEditPreview(editPostContent);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
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
              <MarkdownRenderer content={editPreview} />
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
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleUpdatePost} variant="contained">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PostEditDialog;

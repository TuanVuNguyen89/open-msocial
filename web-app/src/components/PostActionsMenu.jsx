import React from 'react';
import { Menu, MenuItem } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

/**
 * Component for post actions menu (edit, delete)
 */
const PostActionsMenu = ({ anchorEl, open, onClose, onEdit, onDelete }) => {
  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
    >
      <MenuItem onClick={onEdit} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <EditIcon fontSize="small" />
        Edit
      </MenuItem>
      <MenuItem onClick={onDelete} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <DeleteIcon fontSize="small" />
        Delete
      </MenuItem>
    </Menu>
  );
};

export default PostActionsMenu;

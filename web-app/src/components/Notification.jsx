import React from 'react';
import { Snackbar, Alert } from '@mui/material';

const Notification = ({ snackbar, handleClose }) => {
  return (
    <Snackbar 
      open={snackbar.open} 
      autoHideDuration={6000} 
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert onClose={handleClose} severity={snackbar.severity} sx={{ width: '100%' }}>
        {snackbar.message}
      </Alert>
    </Snackbar>
  );
};

export default Notification;

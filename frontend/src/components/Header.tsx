import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';

interface HeaderProps {
  isConnected: boolean;
  onRetry?: () => void;
}

const Header: React.FC<HeaderProps> = ({ isConnected, onRetry }) => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          PythonIDE
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                bgcolor: isConnected ? 'success.main' : 'error.main',
              }}
            />
            <Typography variant="body2">
              {isConnected ? 'Connected' : 'Disconnected'}
            </Typography>
          </Box>
          {!isConnected && onRetry && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={onRetry}
              size="small"
            >
              Retry Connection
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 
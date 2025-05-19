import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Chip,
  useTheme,
  Button,
} from '@mui/material';
import { FiberManualRecord as StatusIcon, Refresh as RefreshIcon } from '@mui/icons-material';

interface HeaderProps {
  isConnected: boolean;
  onRetry?: () => void;
}

const Header: React.FC<HeaderProps> = ({ isConnected, onRetry }) => {
  const theme = useTheme();

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          PythonIDE
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
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
              color="inherit"
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
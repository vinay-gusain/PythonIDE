import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Container, Paper, Typography, useTheme, Alert, Snackbar, CircularProgress, Button } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import Editor from './components/Editor';
import Terminal from './components/Terminal';
import Header from './components/Header';
import config from './config';

const WS_RECONNECT_DELAY = 2000; // 2 seconds
const MAX_RECONNECT_ATTEMPTS = 5;

const App: React.FC = () => {
  const theme = useTheme();
  const [sessionId] = useState(() => uuidv4());
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [output, setOutput] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    // Clear any existing reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    setIsConnecting(true);
    setError(null);

    try {
      const ws = new WebSocket(`${config.wsUrl}/ws/${sessionId}`);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setIsConnecting(false);
        setError(null);
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'output') {
            setOutput((prev) => [...prev, data.content]);
          } else if (data.type === 'error') {
            setError(data.content);
            setOutput((prev) => [...prev, `Error: ${data.content}`]);
          }
        } catch (e) {
          console.error('Error parsing message:', e);
          setOutput((prev) => [...prev, event.data]);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Connection error occurred');
        setIsConnected(false);
        setIsConnecting(false);
      };

      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        setIsConnected(false);
        setIsConnecting(false);

        // Attempt to reconnect if we haven't exceeded max attempts
        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttemptsRef.current += 1;
          console.log(`Attempting to reconnect (${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})...`);
          reconnectTimeoutRef.current = setTimeout(connectWebSocket, WS_RECONNECT_DELAY);
        } else {
          setError('Failed to connect to server after multiple attempts. Please refresh the page.');
        }
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('Error creating WebSocket:', err);
      setError('Failed to create connection');
      setIsConnecting(false);
    }
  }, [sessionId]);

  const handleRunCode = useCallback((code: string) => {
    if (!isConnected || !wsRef.current) {
      setError('Not connected to the server');
      return;
    }

    try {
      wsRef.current.send(JSON.stringify({
        type: 'execute',
        code: code
      }));
      setOutput((prev) => [...prev, '> Executing code...']);
    } catch (err) {
      setError('Failed to send code to server');
      console.error('Error sending code:', err);
    }
  }, [isConnected]);

  useEffect(() => {
    // Initial connection
    connectWebSocket();

    // Cleanup on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connectWebSocket]);

  const handleCloseError = () => {
    setError(null);
  };

  const handleRetryConnection = () => {
    reconnectAttemptsRef.current = 0;
    connectWebSocket();
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: theme.palette.background.default,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Header isConnected={isConnected} onRetry={handleRetryConnection} />
      <Container maxWidth="xl" sx={{ flex: 1, py: 2 }}>
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={handleCloseError}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseError} 
            severity="error" 
            sx={{ width: '100%' }}
            action={
              error?.includes('Failed to connect') && (
                <Button color="inherit" size="small" onClick={handleRetryConnection}>
                  Retry
                </Button>
              )
            }
          >
            {error}
          </Alert>
        </Snackbar>
        {isConnecting ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <CircularProgress />
            <Typography variant="h6" sx={{ ml: 2 }}>
              Connecting to server...
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 2,
              height: 'calc(100vh - 120px)',
            }}
          >
            <Paper
              elevation={3}
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
              }}
            >
              <Typography variant="h6" gutterBottom>
                Code Editor
              </Typography>
              <Box sx={{ flex: 1, minHeight: 0 }}>
                <Editor onRunCode={handleRunCode} />
              </Box>
            </Paper>
            <Paper
              elevation={3}
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
              }}
            >
              <Typography variant="h6" gutterBottom>
                Terminal Output
              </Typography>
              <Box sx={{ flex: 1, minHeight: 0 }}>
                <Terminal output={output} />
              </Box>
            </Paper>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default App; 
import React from 'react';
import { Box, Paper } from '@mui/material';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

interface TerminalProps {
  output: string[];
}

const Terminal: React.FC<TerminalProps> = ({ output }) => {
  const terminalRef = React.useRef<HTMLDivElement>(null);
  const xtermRef = React.useRef<XTerm | null>(null);

  React.useEffect(() => {
    if (terminalRef.current && !xtermRef.current) {
      const term = new XTerm({
        theme: {
          background: '#1e1e1e',
          foreground: '#ffffff',
          cursor: '#ffffff',
          black: '#000000',
          red: '#cd3131',
          green: '#0dbc79',
          yellow: '#e5e510',
          blue: '#2472c8',
          magenta: '#bc3fbc',
          cyan: '#11a8cd',
          white: '#e5e5e5',
          brightBlack: '#666666',
          brightRed: '#f14c4c',
          brightGreen: '#23d18b',
          brightYellow: '#f5f543',
          brightBlue: '#3b8eea',
          brightMagenta: '#d670d6',
          brightCyan: '#29b8db',
          brightWhite: '#ffffff'
        },
        fontFamily: 'monospace',
        fontSize: 14,
        cursorBlink: true,
        cursorStyle: 'block',
        scrollback: 1000,
      });

      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      term.open(terminalRef.current);
      fitAddon.fit();

      xtermRef.current = term;

      // Handle window resize
      const handleResize = () => {
        fitAddon.fit();
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        term.dispose();
      };
    }
  }, []);

  React.useEffect(() => {
    if (xtermRef.current && output.length > 0) {
      const lastOutput = output[output.length - 1];
      xtermRef.current.writeln(lastOutput);
    }
  }, [output]);

  return (
    <Paper
      ref={terminalRef}
      sx={{
        height: '100%',
        bgcolor: '#1e1e1e',
        p: 1,
        overflow: 'hidden',
      }}
    />
  );
};

export default Terminal; 
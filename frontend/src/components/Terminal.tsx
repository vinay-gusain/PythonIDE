import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import 'xterm/css/xterm.css';

interface TerminalProps {
  output: string[];
}

const Terminal: React.FC<TerminalProps> = ({ output }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);

  useEffect(() => {
    if (terminalRef.current && !xtermRef.current) {
      const term = new XTerm({
        cursorBlink: true,
        fontSize: 14,
        fontFamily: 'Fira Code, monospace',
        theme: {
          background: '#1e1e1e',
          foreground: '#d4d4d4',
          cursor: '#ffffff',
          selection: '#264f78',
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
          brightWhite: '#ffffff',
        },
      });

      const fitAddon = new FitAddon();
      const webLinksAddon = new WebLinksAddon();

      term.loadAddon(fitAddon);
      term.loadAddon(webLinksAddon);
      term.open(terminalRef.current);
      fitAddon.fit();

      xtermRef.current = term;

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

  useEffect(() => {
    if (xtermRef.current && output.length > 0) {
      const lastOutput = output[output.length - 1];
      xtermRef.current.writeln(lastOutput);
    }
  }, [output]);

  return (
    <Box
      ref={terminalRef}
      sx={{
        height: '100%',
        bgcolor: '#1e1e1e',
        p: 1,
        borderRadius: 1,
        '& .xterm': {
          height: '100%',
        },
        '& .xterm-viewport': {
          overflowY: 'auto',
        },
      }}
    />
  );
};

export default Terminal; 
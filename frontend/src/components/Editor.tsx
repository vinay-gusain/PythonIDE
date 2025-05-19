import React, { useRef, useState, useCallback } from 'react';
import { Box, Button, Stack, IconButton, Tooltip } from '@mui/material';
import { PlayArrow as RunIcon, ContentCopy as CopyIcon, Delete as ClearIcon } from '@mui/icons-material';
import Editor, { Monaco } from '@monaco-editor/react';

interface EditorProps {
  onRunCode: (code: string) => void;
}

const DEFAULT_CODE = `# Welcome to PythonIDE!
# Write your Python code here and click Run.
# Press Ctrl+Enter to run your code.

def greet(name: str) -> str:
    """A simple greeting function."""
    return f"Hello, {name}!"

# Try it out:
print(greet("World"))`;

const CodeEditor: React.FC<EditorProps> = ({ onRunCode }) => {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const [code, setCode] = useState<string>(DEFAULT_CODE);

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Configure editor settings
    editor.updateOptions({
      wordWrap: 'on',
      lineNumbers: 'on',
      minimap: { enabled: false },
      fontSize: 14,
      tabSize: 4,
      automaticLayout: true,
      suggestOnTriggerCharacters: true,
      quickSuggestions: true,
      parameterHints: { enabled: true },
      formatOnPaste: true,
      formatOnType: true,
      scrollBeyondLastLine: false,
      roundedSelection: false,
      padding: { top: 10 },
      contextmenu: true,
      multiCursorModifier: 'alt',
      bracketPairColorization: { enabled: true },
      guides: { bracketPairs: true },
    });

    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleRun();
    });
  };

  const handleRun = useCallback(() => {
    if (editorRef.current) {
      const code = editorRef.current.getValue();
      onRunCode(code);
    }
  }, [onRunCode]);

  const handleCopy = useCallback(() => {
    if (editorRef.current) {
      const code = editorRef.current.getValue();
      navigator.clipboard.writeText(code);
    }
  }, []);

  const handleClear = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.setValue('');
      setCode('');
    }
  }, []);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <Editor
          height="100%"
          defaultLanguage="python"
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value || '')}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            wordWrap: 'on',
            suggestOnTriggerCharacters: true,
            quickSuggestions: true,
            parameterHints: { enabled: true },
            formatOnPaste: true,
            formatOnType: true,
          }}
        />
      </Box>
      <Stack
        direction="row"
        spacing={1}
        sx={{ p: 1, bgcolor: 'background.paper' }}
      >
        <Button
          variant="contained"
          color="primary"
          startIcon={<RunIcon />}
          onClick={handleRun}
        >
          Run Code (Ctrl+Enter)
        </Button>
        <Tooltip title="Copy code to clipboard">
          <IconButton onClick={handleCopy} color="primary">
            <CopyIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Clear editor">
          <IconButton onClick={handleClear} color="error">
            <ClearIcon />
          </IconButton>
        </Tooltip>
      </Stack>
    </Box>
  );
};

export default CodeEditor; 
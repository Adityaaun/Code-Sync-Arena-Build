import React from 'react';
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  code: string;
  onChange: (value: string | undefined) => void;
  language: string;
  setLanguage: (lang: string) => void;
  isReadOnly?: boolean;
  label?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange, language, setLanguage, isReadOnly = false, label }) => {
  return (
    <div style={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      borderRadius: '8px',
      overflow: 'hidden',
      border: '1px solid #e2e8f0',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{ 
        padding: '10px 16px', 
        backgroundColor: '#edf2f7', 
        borderBottom: '1px solid #e2e8f0', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {label && <span style={{ fontWeight: 'bold', fontSize: '0.85em', color: '#4a5568' }}>{label.toUpperCase()}</span>}
          {!isReadOnly && (
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              style={{ 
                padding: '4px 8px', 
                borderRadius: '4px',
                border: '1px solid #cbd5e0',
                fontSize: '0.85em',
                backgroundColor: 'white',
                outline: 'none'
              }}
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
            </select>
          )}
        </div>
        {isReadOnly && <span style={{ color: '#718096', fontSize: '0.75em', fontStyle: 'italic' }}>READ-ONLY VIEW</span>}
      </div>
      <div style={{ flexGrow: 1 }}>
        <Editor
          height="100%"
          language={language === 'cpp' ? 'cpp' : language}
          value={code}
          onChange={onChange}
          theme="vs-light"
          options={{
            readOnly: isReadOnly,
            minimap: { enabled: false },
            fontSize: 14,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 10, bottom: 10 }
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;

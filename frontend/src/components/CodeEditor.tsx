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
      backgroundColor: 'var(--panel-bg)'
    }}>
      <div style={{ 
        padding: '8px 16px', 
        backgroundColor: '#161e31', 
        borderBottom: '1px solid var(--border)', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {label && <span style={{ fontWeight: '800', fontSize: '11px', color: 'var(--text-sec)', letterSpacing: '0.05em' }}>{label.toUpperCase()}</span>}
          {!isReadOnly && (
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              style={{ 
                padding: '2px 6px', 
                borderRadius: '4px',
                border: '1px solid var(--border)',
                fontSize: '11px',
                backgroundColor: 'var(--bg-dark)',
                color: 'var(--text-main)',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
            </select>
          )}
        </div>
        {isReadOnly && <span style={{ color: '#4b5563', fontSize: '10px', fontWeight: 'bold' }}>READ-ONLY</span>}
      </div>
      <div style={{ flexGrow: 1 }}>
        <Editor
          height="100%"
          language={language === 'cpp' ? 'cpp' : language}
          value={code}
          onChange={onChange}
          theme="vs-dark"
          options={{
            readOnly: isReadOnly,
            minimap: { enabled: false },
            fontSize: 14,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 10, bottom: 10 },
            backgroundColor: '#0b1220'
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;

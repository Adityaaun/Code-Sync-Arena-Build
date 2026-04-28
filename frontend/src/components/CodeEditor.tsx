import React from 'react';
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  code: string;
  onChange: (value: string | undefined) => void;
  language: string;
  setLanguage: (lang: string) => void;
  isReadOnly?: boolean;
  label?: string;
  isBlurred?: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange, language, setLanguage, isReadOnly = false, label, isBlurred = false }) => {
  return (
    <div style={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: 'var(--panel-bg)',
      position: 'relative'
    }}>
      {isBlurred && (
        <div style={{
          position: 'absolute',
          top: '36px',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 10,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(11, 18, 32, 0.4)',
          backdropFilter: 'blur(8px)',
          pointerEvents: 'none'
        }}>
          <div style={{
            padding: '12px 24px',
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            color: 'var(--text-sec)',
            fontSize: '12px',
            fontWeight: 'bold',
            letterSpacing: '0.05em'
          }}>
            CODE HIDDEN DURING BATTLE
          </div>
        </div>
      )}
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
            padding: { top: 10, bottom: 10 }
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;

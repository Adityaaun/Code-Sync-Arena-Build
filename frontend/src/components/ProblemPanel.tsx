import React from 'react';

interface ProblemProps {
  title: string;
  description: string;
  examples: { input: string; output: string; explanation?: string }[];
}

const ProblemPanel: React.FC<ProblemProps> = ({ title, description, examples }) => {
  return (
    <div style={{ 
      padding: '24px', 
      overflowY: 'auto', 
      height: '100%', 
      backgroundColor: 'white',
      borderRadius: '8px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
    }}>
      <h2 style={{ 
        marginBottom: '16px', 
        fontSize: '1.5em', 
        color: '#1a202c',
        borderBottom: '2px solid #edf2f7',
        paddingBottom: '8px'
      }}>
        {title}
      </h2>
      <p style={{ 
        lineHeight: '1.7', 
        marginBottom: '24px', 
        color: '#4a5568',
        fontSize: '1em'
      }}>
        {description}
      </p>
      
      <h3 style={{ marginBottom: '12px', fontSize: '1.1em', color: '#2d3748' }}>Examples</h3>
      {examples.map((ex, index) => (
        <div key={index} style={{ 
          backgroundColor: '#f8fafc', 
          padding: '16px', 
          borderRadius: '6px', 
          marginBottom: '16px', 
          border: '1px solid #edf2f7' 
        }}>
          <div style={{ marginBottom: '8px' }}>
            <strong style={{ color: '#718096', fontSize: '0.8em', textTransform: 'uppercase' }}>Input</strong>
            <pre style={{ margin: '4px 0', fontSize: '0.9em', color: '#2d3748', backgroundColor: '#fff', padding: '8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>{ex.input}</pre>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <strong style={{ color: '#718096', fontSize: '0.8em', textTransform: 'uppercase' }}>Output</strong>
            <pre style={{ margin: '4px 0', fontSize: '0.9em', color: '#2d3748', backgroundColor: '#fff', padding: '8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>{ex.output}</pre>
          </div>
          {ex.explanation && (
            <p style={{ fontSize: '0.9em', color: '#718096', margin: '8px 0 0 0' }}>
              <em>{ex.explanation}</em>
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProblemPanel;

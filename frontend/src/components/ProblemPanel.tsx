import React from 'react';

interface ProblemProps {
  title: string;
  description: string;
  examples: { input: string; output: string; explanation?: string }[];
}

const ProblemPanel: React.FC<ProblemProps> = ({ title, description, examples }) => {
  return (
    <div style={{ 
      padding: '20px', 
      overflowY: 'auto', 
      height: '100%', 
      backgroundColor: 'var(--panel-bg)',
      color: 'var(--text-main)'
    }}>
      <h2 style={{ 
        marginBottom: '16px', 
        fontSize: '1.2em', 
        fontWeight: 'bold',
        color: 'white',
        borderBottom: '1px solid var(--border)',
        paddingBottom: '8px'
      }}>
        {title}
      </h2>
      <p style={{ 
        lineHeight: '1.6', 
        marginBottom: '24px', 
        color: 'var(--text-sec)',
        fontSize: '0.95em'
      }}>
        {description}
      </p>
      
      <h3 style={{ marginBottom: '12px', fontSize: '1em', color: 'white', fontWeight: 'bold' }}>Examples</h3>
      {examples.map((ex, index) => (
        <div key={index} style={{ 
          backgroundColor: 'rgba(255,255,255,0.02)', 
          padding: '16px', 
          borderRadius: '4px', 
          marginBottom: '16px', 
          border: '1px solid var(--border)' 
        }}>
          <div style={{ marginBottom: '8px' }}>
            <strong style={{ color: 'var(--primary)', fontSize: '0.75em', textTransform: 'uppercase' }}>Input</strong>
            <pre style={{ margin: '4px 0', fontSize: '0.9em', color: 'var(--text-main)', backgroundColor: '#000', padding: '8px', borderRadius: '4px', border: '1px solid var(--border)' }}>{ex.input}</pre>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <strong style={{ color: 'var(--success)', fontSize: '0.75em', textTransform: 'uppercase' }}>Output</strong>
            <pre style={{ margin: '4px 0', fontSize: '0.9em', color: 'var(--text-main)', backgroundColor: '#000', padding: '8px', borderRadius: '4px', border: '1px solid var(--border)' }}>{ex.output}</pre>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProblemPanel;

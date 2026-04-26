import React from 'react';

interface ProblemProps {
  title: string;
  description: string;
  examples: { input: string; output: string; explanation?: string }[];
}

const ProblemPanel: React.FC<ProblemProps> = ({ title, description, examples }) => {
  return (
    <div style={{ padding: '20px', overflowY: 'auto', height: '100%', borderRight: '1px solid #ddd', backgroundColor: '#f9f9f9' }}>
      <h2 style={{ marginBottom: '10px' }}>{title}</h2>
      <p style={{ lineHeight: '1.6', marginBottom: '20px' }}>{description}</p>
      
      <h3 style={{ marginBottom: '10px' }}>Examples:</h3>
      {examples.map((ex, index) => (
        <div key={index} style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '4px', marginBottom: '15px', border: '1px solid #eee' }}>
          <p><strong>Input:</strong> <code>{ex.input}</code></p>
          <p><strong>Output:</strong> <code>{ex.output}</code></p>
          {ex.explanation && <p style={{ fontSize: '0.9em', color: '#666' }}><em>{ex.explanation}</em></p>}
        </div>
      ))}
    </div>
  );
};

export default ProblemPanel;

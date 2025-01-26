import { useState } from 'react';

const WorksheetList = ({ worksheets }) => {
  const [expandedId, setExpandedId] = useState(null);

  const handleDownload = (worksheet) => {
    const blob = new Blob(
      [
        `
${worksheet.title}
Grade: ${worksheet.grade}
Subject: ${worksheet.subject}
Date: ${new Date(worksheet.createdAt).toLocaleDateString()}

${worksheet.content}
        `,
      ],
      { type: 'text/plain' }
    );

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${worksheet.title.replace(/\s+/g, '_')}.txt`;

    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="worksheet-list">
      <h2>Your Worksheets</h2>
      {worksheets.length === 0 ? (
        <p>No worksheets created yet.</p>
      ) : (
        <div className="worksheets-grid">
          {worksheets.map((worksheet) => (
            <div key={worksheet._id} className="worksheet-card">
              <h3>{worksheet.title}</h3>
              <p>Subject: {worksheet.subject}</p>
              <p>Grade: {worksheet.grade}</p>
              <p>
                Created: {new Date(worksheet.createdAt).toLocaleDateString()}
              </p>

              <div className="worksheet-content">
                {expandedId === worksheet._id ? (
                  <>
                    <pre>{worksheet.content}</pre>
                    <button onClick={() => toggleExpand(worksheet._id)}>
                      Show Less
                    </button>
                  </>
                ) : (
                  <button onClick={() => toggleExpand(worksheet._id)}>
                    Preview Content
                  </button>
                )}
              </div>

              <div className="worksheet-actions">
                <button onClick={() => handleDownload(worksheet)}>
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorksheetList;

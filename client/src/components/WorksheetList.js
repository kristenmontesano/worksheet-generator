import React, { useState } from 'react';
import { FaEdit, FaDownload, FaEye, FaEyeSlash } from 'react-icons/fa';

const WorksheetList = ({ worksheets, onEditWorksheet }) => {
    const [expandedId, setExpandedId] = useState(null);

    const handleDownload = async (worksheet) => {
        try {
            // Assuming there's an endpoint to get the PDF version
            const response = await fetch(`http://localhost:5002/api/worksheets/${worksheet._id}/pdf`);
            if (!response.ok) {
                // Fallback to text download if PDF isn't available
                const blob = new Blob([`
${worksheet.title}
Grade: ${worksheet.grade}
Subject: ${worksheet.subject}
Date: ${new Date(worksheet.createdAt).toLocaleDateString()}

${worksheet.content}
                `], { type: 'text/plain' });
                
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${worksheet.title.replace(/\s+/g, '_')}.txt`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                return;
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${worksheet.title.replace(/\s+/g, '_')}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading worksheet:', error);
            alert('Failed to download worksheet');
        }
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
                            <div className="worksheet-header">
                                <h3>{worksheet.title}</h3>
                                <div className="worksheet-meta">
                                    <span>Subject: {worksheet.subject}</span>
                                    <br />
                                    <span>Grade: {worksheet.grade}</span>
                                    <br />
                                    <span>Created: {new Date(worksheet.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                            
                            <div className="worksheet-content">
                                {expandedId === worksheet._id ? (
                                    <>
                                        <pre>{worksheet.content}</pre>
                                        <button 
                                            className="preview-button"
                                            onClick={() => toggleExpand(worksheet._id)}
                                        >
                                            <FaEyeSlash /> Hide Preview
                                        </button>
                                    </>
                                ) : (
                                    <button 
                                        className="preview-button"
                                        onClick={() => toggleExpand(worksheet._id)}
                                    >
                                        <FaEye /> Preview Content
                                    </button>
                                )}
                            </div>
                            
                            <div className="worksheet-actions">
                                <button 
                                    className="edit-button"
                                    onClick={() => onEditWorksheet(worksheet)}
                                >
                                    <FaEdit /> Edit
                                </button>
                                {/* <button 
                                    className="download-button"
                                    onClick={() => handleDownload(worksheet)}
                                >
                                    <FaDownload /> Download
                                </button> */}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WorksheetList; 
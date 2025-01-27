import React, { useState, useEffect } from 'react';
import { fabric } from 'fabric';
import './WorksheetEditor.css';
import { FaHome, FaDownload } from 'react-icons/fa';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const TEMPLATE_ELEMENTS = {
    headers: [
        { name: 'Classic Header', height: 80 },
        { name: 'Modern Header', height: 60 },
    ],
    sections: [
        { name: 'Learning Objectives' },
        { name: 'Warm-up Questions' },
        { name: 'Main Exercises' },
        { name: 'Challenge Question' }
    ],
    shapes: [
        { name: 'Answer Box' },
        { name: 'Number Line' },
        { name: 'Grid' },
        { name: 'Circle' },
        { name: 'Answer Lines' },
        { name: 'Name & Date' }
    ]
};

const WorksheetEditor = ({ worksheetData }) => {
    const [canvas, setCanvas] = useState(null);
    const [activeTab, setActiveTab] = useState('layout');
    const [generatedContent, setGeneratedContent] = useState(worksheetData?.content || '');
    const [worksheetId] = useState(worksheetData?._id);

    useEffect(() => {
        const newCanvas = new fabric.Canvas('worksheet-canvas', {
            width: 800,
            height: 1100,
            backgroundColor: '#ffffff'
        });

        // Set default properties for text
        fabric.Object.prototype.set({
            fill: '#000000',
            fontFamily: 'Arial'
        });

        // Load saved state if it exists
        if (worksheetData?.state) {
            newCanvas.loadFromJSON(worksheetData.state, () => {
                newCanvas.renderAll();
            });
        }

        setCanvas(newCanvas);

        return () => {
            newCanvas.dispose();
        };
    }, [worksheetData]);

    const addText = () => {
        if (!canvas) return;
        const text = new fabric.Textbox('Click to edit text', {
            left: 50,
            top: 50,
            width: 200,
            fontSize: 16,
            fontFamily: 'Arial',
            fill: '#000000',
            backgroundColor: 'transparent'
        });
        canvas.add(text);
        canvas.setActiveObject(text);
    };

    const addSection = (sectionName) => {
        if (!canvas) return;
        const section = new fabric.Textbox(sectionName, {
            left: 50,
            top: canvas.height / 2,
            width: canvas.width - 100,
            fontSize: 18,
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fill: '#000000',
            backgroundColor: '#f5f5f5',
            padding: 10
        });
        canvas.add(section);
    };

    const addShape = (shapeName) => {
        if (!canvas) return;
        let shape;
        switch (shapeName) {
            case 'Answer Box':
                shape = new fabric.Rect({
                    left: 50,
                    top: 50,
                    width: 200,
                    height: 50,
                    fill: 'transparent',
                    stroke: '#000',
                    strokeWidth: 1
                });
                break;
            case 'Grid':
                // Create a group to hold all grid lines
                const gridSize = 20; // Size of each grid cell
                const gridWidth = 200;
                const gridHeight = 200;
                const gridLines = [];

                // Create vertical lines
                for (let i = 0; i <= gridWidth; i += gridSize) {
                    gridLines.push(new fabric.Line([i, 0, i, gridHeight], {
                        stroke: '#ccc',
                        strokeWidth: 1
                    }));
                }

                // Create horizontal lines
                for (let i = 0; i <= gridHeight; i += gridSize) {
                    gridLines.push(new fabric.Line([0, i, gridWidth, i], {
                        stroke: '#ccc',
                        strokeWidth: 1
                    }));
                }

                shape = new fabric.Group(gridLines, {
                    left: 50,
                    top: 50,
                    selectable: true
                });
                break;
            case 'Number Line':
                const lineLength = 300;
                const tickSpacing = 30;
                const tickHeight = 10;
                const numberLine = [];

                // Main horizontal line
                numberLine.push(new fabric.Line([0, 0, lineLength, 0], {
                    stroke: '#000',
                    strokeWidth: 2
                }));

                // Add ticks and numbers
                for (let i = 0; i <= lineLength; i += tickSpacing) {
                    // Tick mark
                    numberLine.push(new fabric.Line([i, -tickHeight/2, i, tickHeight/2], {
                        stroke: '#000',
                        strokeWidth: 1
                    }));
                    
                    // Number label
                    numberLine.push(new fabric.Text((i/tickSpacing).toString(), {
                        left: i - 3,
                        top: tickHeight,
                        fontSize: 12,
                        fontFamily: 'Arial'
                    }));
                }

                shape = new fabric.Group(numberLine, {
                    left: 50,
                    top: 50,
                    selectable: true
                });
                break;
            case 'Circle':
                shape = new fabric.Circle({
                    left: 50,
                    top: 50,
                    radius: 50,
                    fill: 'transparent',
                    stroke: '#000',
                    strokeWidth: 1
                });
                break;
            case 'Answer Lines':
                const lineSpacing = 30; // Space between lines
                const lineWidth = 300;  // Width of each line
                const numLines = 4;     // Number of lines to create
                const answerLines = [];

                // Create multiple horizontal lines
                for (let i = 0; i < numLines; i++) {
                    answerLines.push(new fabric.Line([
                        0,
                        i * lineSpacing,
                        lineWidth,
                        i * lineSpacing
                    ], {
                        stroke: '#000',
                        strokeWidth: 1
                    }));
                }

                shape = new fabric.Group(answerLines, {
                    left: 50,
                    top: 50,
                    selectable: true
                });
                break;
            case 'Name & Date':
                const nameText = new fabric.Text('Name:', {
                    left: 0,
                    top: 0,
                    fontSize: 14,
                    fontFamily: 'Arial'
                });

                const nameLine = new fabric.Line([
                    nameText.width + 10, 
                    nameText.height - 5,
                    nameText.width + 300,
                    nameText.height - 5
                ], {
                    stroke: '#000',
                    strokeWidth: 1
                });

                const dateText = new fabric.Text('Date:', {
                    left: nameText.width + 330,
                    top: 0,
                    fontSize: 14,
                    fontFamily: 'Arial'
                });

                const dateLine = new fabric.Line([
                    nameText.width + dateText.width + 340,
                    nameText.height - 5,
                    nameText.width + dateText.width + 550,
                    nameText.height - 5
                ], {
                    stroke: '#000',
                    strokeWidth: 1
                });

                shape = new fabric.Group([nameText, nameLine, dateText, dateLine], {
                    left: 50,
                    top: 50,
                    selectable: true
                });
                break;
            default:
                return;
        }
        if (shape) {
            canvas.add(shape);
            canvas.setActiveObject(shape);
        }
    };

    // Add new helper function to detect and group multiple choice questions
    const parseContent = (content) => {
        const lines = content.split('\n').filter(line => line.trim());
        const parsedContent = [];
        let currentQuestion = null;

        lines.forEach(line => {
            // Detect question pattern (e.g., "1.", "Q1.", "Question 1:")
            const questionStart = line.match(/^(?:\d+\.|Q\d+\.|Question \d+:)/);
            // Detect answer choice pattern (e.g., "a)", "A)", "(a)", "(A)")
            const choiceStart = line.match(/^[[(]?[a-dA-D][)\].]?\s/);

            if (questionStart) {
                // If there was a previous question, add it to parsed content
                if (currentQuestion) {
                    parsedContent.push(currentQuestion);
                }
                // Start new question
                currentQuestion = {
                    type: 'multiple-choice',
                    question: line,
                    choices: []
                };
            } else if (choiceStart && currentQuestion) {
                // Add choice to current question
                currentQuestion.choices.push(line);
            } else {
                // If not part of a multiple choice question, add as regular content
                if (currentQuestion) {
                    parsedContent.push(currentQuestion);
                    currentQuestion = null;
                }
                parsedContent.push({ type: 'text', content: line });
            }
        });

        // Add final question if exists
        if (currentQuestion) {
            parsedContent.push(currentQuestion);
        }

        return parsedContent;
    };

    // Modify the handleCanvasDrop function to handle multiple choice questions
    const handleCanvasDrop = (e) => {
        if (!canvas) return;
        
        const data = e.dataTransfer.getData('text');
        let content;
        try {
            content = JSON.parse(data);
        } catch {
            content = { type: 'text', content: data };
        }
        
        const canvasEl = canvas.getElement();
        const rect = canvasEl.getBoundingClientRect();
        const dropX = e.clientX - rect.left;
        const dropY = e.clientY - rect.top;

        if (content.type === 'multiple-choice') {
            // Create group of text objects for question and choices
            const questionText = new fabric.Textbox(content.question, {
                left: 0,
                top: 0,
                width: 300,
                fontSize: 14,
                fontFamily: 'Arial'
            });

            // Calculate the height of the question text to properly space the first choice
            const questionHeight = questionText.height || 25;

            const choiceObjects = content.choices.map((choice, index) => {
                return new fabric.Textbox(choice, {
                    left: 20, // Indent choices
                    top: questionHeight + 10 + (index * 30), // Add 10px padding after question
                    width: 280,
                    fontSize: 14,
                    fontFamily: 'Arial'
                });
            });

            const group = new fabric.Group([questionText, ...choiceObjects], {
                left: dropX,
                top: dropY,
                selectable: true
            });

            canvas.add(group);
            canvas.setActiveObject(group);
        } else {
            // Handle regular text as before
            const textbox = new fabric.Textbox(content.content, {
                left: dropX,
                top: dropY,
                width: 300,
                fontSize: 14,
                fontFamily: 'Arial',
                fill: '#000000',
                backgroundColor: 'transparent'
            });

            canvas.add(textbox);
            canvas.setActiveObject(textbox);
        }
        
        canvas.renderAll();
    };

    const handleHomeClick = async () => {
        if (!canvas) return;

        try {
            // Convert canvas to JSON
            const worksheetState = canvas.toJSON();
            
            // Save worksheet state
            await fetch('/api/worksheets/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: worksheetId,
                    state: worksheetState,
                    // Add any other relevant data you want to save
                    lastModified: new Date().toISOString()
                })
            });

            // Navigate home after successful save
            window.location.href = '/';
        } catch (error) {
            console.error('Error saving worksheet:', error);
            // You might want to show an error message to the user here
            window.location.href = '/';
        }
    };

    const handleDownloadPDF = async () => {
        if (!canvas) return;

        try {
            // Deselect all objects before generating PDF
            canvas.discardActiveObject();
            canvas.renderAll();

            // Get the canvas DOM element
            const canvasElement = document.getElementById('worksheet-canvas');
            
            // Convert the canvas to an image
            const canvasImage = await html2canvas(canvasElement);
            
            // Create PDF document
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });

            // Add the image to the PDF
            pdf.addImage(
                canvasImage.toDataURL('image/png'),
                'PNG',
                0,
                0,
                canvas.width,
                canvas.height
            );

            // Download the PDF
            pdf.save('worksheet.pdf');

            // Optionally: Restore the last selected object
            const lastActiveObject = canvas.getActiveObject();
            if (lastActiveObject) {
                canvas.setActiveObject(lastActiveObject);
                canvas.renderAll();
            }
        } catch (error) {
            console.error('Error generating PDF:', error);
            // You might want to show an error message to the user here
        }
    };

    // Update the content section render to handle grouped multiple choice questions
    const renderContentSection = () => {
        const parsedContent = parseContent(generatedContent);
        
        return (
            <div className="content-section">
                <div className="ai-content">
                    {parsedContent.map((item, i) => (
                        <div key={i} className="content-line-container">
                            <div 
                                className="content-line"
                                draggable
                                onDragStart={(e) => {
                                    e.dataTransfer.setData('text', JSON.stringify(item));
                                }}
                            >
                                {item.type === 'multiple-choice' ? (
                                    <div className="multiple-choice-item">
                                        <div>{item.question}</div>
                                        {item.choices.map((choice, j) => (
                                            <div key={j} className="choice-item">
                                                {choice}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    item.content
                                )}
                            </div>
                            <button 
                                className="copy-button"
                                onClick={() => {
                                    const textToCopy = item.type === 'multiple-choice' 
                                        ? [item.question, ...item.choices].join('\n')
                                        : item.content;
                                    navigator.clipboard.writeText(textToCopy);
                                }}
                                title="Copy to clipboard"
                            >
                                Copy
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="worksheet-editor">
            <div className="editor-sidebar">
                <div className="sidebar-tabs">
                    <button 
                        className={activeTab === 'layout' ? 'active' : ''} 
                        onClick={() => setActiveTab('layout')}
                    >
                        Layout
                    </button>
                    <button 
                        className={activeTab === 'elements' ? 'active' : ''} 
                        onClick={() => setActiveTab('elements')}
                    >
                        Elements
                    </button>
                    <button 
                        className={activeTab === 'content' ? 'active' : ''} 
                        onClick={() => setActiveTab('content')}
                    >
                        AI Content
                    </button>
                </div>

                <div className="sidebar-content">
                    {activeTab === 'layout' && (
                        <div className="template-section">
                            <h3>Headers</h3>
                            {TEMPLATE_ELEMENTS.headers.map(header => (
                                <div 
                                    key={header.name} 
                                    className="template-item"
                                    onClick={() => addSection(header.name)}
                                >
                                    {header.name}
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'elements' && (
                        <div className="elements-section">
                            <button onClick={addText}>Add Text</button>
                            {TEMPLATE_ELEMENTS.shapes.map(shape => (
                                <button 
                                    key={shape.name}
                                    onClick={() => addShape(shape.name)}
                                >
                                    {shape.name}
                                </button>
                            ))}
                        </div>
                    )}

                    {activeTab === 'content' && renderContentSection()}
                </div>
            </div>

            <div 
                className="editor-main"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleCanvasDrop}
            >
                <div className="editor-toolbar">
                    <button 
                        className="home-button"
                        onClick={handleHomeClick}
                        title="Return to Home"
                    >
                        <FaHome />
                    </button>
                    <button 
                        className="download-button"
                        onClick={handleDownloadPDF}
                        title="Download as PDF"
                    >
                        <FaDownload />
                    </button>
                </div>
                <div className="canvas-container">
                    <canvas id="worksheet-canvas" />
                </div>
            </div>
        </div>
    );
};

export default WorksheetEditor; 
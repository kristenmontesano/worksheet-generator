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
    ],
    buttons: [
        { name: 'Auto-create Layout' }
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

    // Replace the parseContent function
    const parseContent = (content) => {
        const lines = content.split('\n').filter(line => line.trim());
        const parsedContent = [];
        let currentQuestion = null;

        lines.forEach(line => {
            const trimmedLine = line.trim();
            
            // Match numbered questions and their types
            const questionMatch = trimmedLine.match(/^\d+\.\s*(.*?)$/i);
            const isLetterOption = trimmedLine.match(/^[a-d]\.\s+\w+/i);
            const isMatchingAnswer = trimmedLine.match(/^[A-D]{2}\.\s+\w+/);
            
            if (questionMatch) {
                // If there was a previous question, add it
                if (currentQuestion) {
                    parsedContent.push(currentQuestion);
                    currentQuestion = null;
                }
                
                const questionText = questionMatch[1].trim();
                
                // Check if this is a multiple choice or matching question
                if (questionText.toLowerCase().includes('multiple choice') || 
                    questionText.toLowerCase().includes('matching')) {
                    // Start a new grouped question
                    currentQuestion = {
                        type: questionText.toLowerCase().includes('matching') ? 'matching' : 'multiple-choice',
                        question: trimmedLine,
                        choices: [],
                        answers: []
                    };
                } else {
                    // Regular question
                    currentQuestion = {
                        type: 'text',
                        content: trimmedLine
                    };
                }
            } else if (isLetterOption && currentQuestion) {
                // Add choice to current multiple choice or matching question
                currentQuestion.choices.push(trimmedLine);
            } else if (isMatchingAnswer && currentQuestion?.type === 'matching') {
                // Add matching answer (AA., BB., etc.)
                currentQuestion.answers.push(trimmedLine);
            } else if (trimmedLine) {
                // If there's a current question and this line isn't a choice/answer,
                // append it to the question content
                if (currentQuestion) {
                    if (currentQuestion.type === 'text') {
                        // For regular questions, combine with ": " if it's just the question type
                        if (currentQuestion.content.toLowerCase().match(/(multiple choice|matching|short answer|long answer|challenge question)$/i)) {
                            currentQuestion.content += ': ' + trimmedLine;
                        } else if (!currentQuestion.content.includes('\n')) {
                            currentQuestion.content += '\n' + trimmedLine;
                        }
                    } else if (!currentQuestion.question.includes('\n')) {
                        // For multiple choice/matching, add as new line to question
                        currentQuestion.question += '\n' + trimmedLine;
                    }
                } else {
                    // If no current question, create new text content
                    parsedContent.push({
                        type: 'text',
                        content: trimmedLine
                    });
                }
            }
        });

        // Add the last question if exists
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

        if (content.type === 'multiple-choice' || content.type === 'matching') {
            // Create group of text objects for question and choices
            const questionText = new fabric.Textbox(content.question || '', {
                left: 0,
                top: 0,
                width: 300,
                fontSize: 14,
                fontFamily: 'Arial'
            });

            // Calculate the height of the question text to properly space the first choice
            const questionHeight = questionText.height || 25;

            const choiceObjects = content.choices.map((choice, index) => {
                return new fabric.Textbox(choice || '', {
                    left: 20, // Indent choices
                    top: questionHeight + 10 + (index * 30), // Add 10px padding after question
                    width: 280,
                    fontSize: 14,
                    fontFamily: 'Arial'
                });
            });

            const elements = [questionText, ...choiceObjects];

            // Add matching answers if they exist
            if (content.type === 'matching' && content.answers) {
                content.answers.forEach((answer, index) => {
                    const answerText = new fabric.Textbox(answer || '', {
                        left: 320, // Position answers to the right of choices
                        top: questionHeight + 10 + (index * 30),
                        width: 280,
                        fontSize: 14,
                        fontFamily: 'Arial'
                    });
                    elements.push(answerText);
                });
            }

            const group = new fabric.Group(elements, {
                left: dropX,
                top: dropY,
                selectable: true
            });

            canvas.add(group);
            canvas.setActiveObject(group);
        } else {
            // Handle regular text as before
            const textbox = new fabric.Textbox(content.content || '', {
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

        window.location.href = '/';
    };

    const handleDownloadPDF = async () => {
        if (!canvas) return;

        try {
            // Deselect all objects before generating PDF
            canvas.discardActiveObject();
            canvas.renderAll();

            const PAGE_HEIGHT = 1100;
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: [canvas.width, PAGE_HEIGHT]
            });

            // Calculate number of pages
            const totalHeight = canvas.height;
            const numPages = Math.ceil(totalHeight / PAGE_HEIGHT);

            // Add each page to the PDF
            for (let i = 0; i < numPages; i++) {
                if (i > 0) {
                    pdf.addPage();
                }

                // Create a temporary canvas for this page section
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = canvas.width;
                tempCanvas.height = PAGE_HEIGHT;
                const ctx = tempCanvas.getContext('2d');
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

                // Copy the portion of the main canvas for this page
                ctx.drawImage(
                    canvas.getElement(),
                    0,
                    PAGE_HEIGHT * i,
                    canvas.width,
                    PAGE_HEIGHT,
                    0,
                    0,
                    canvas.width,
                    PAGE_HEIGHT
                );

                // Add this page section to the PDF
                pdf.addImage(
                    tempCanvas.toDataURL('image/png'),
                    'PNG',
                    0,
                    0,
                    canvas.width,
                    PAGE_HEIGHT
                );
            }

            // Download the PDF
            pdf.save('worksheet.pdf');

        } catch (error) {
            console.error('Error generating PDF:', error);
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
                                {item.type === 'multiple-choice' || item.type === 'matching' ? (
                                    <div className="multiple-choice-item">
                                        <div>{item.question}</div>
                                        {item.choices.map((choice, j) => (
                                            <div key={j} className="choice-item">
                                                {choice}
                                            </div>
                                        ))}
                                        {item.type === 'matching' && item.answers && (
                                            item.answers.map((answer, j) => (
                                                <div key={`answer-${j}`} className="choice-item">
                                                    {answer}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                ) : (
                                    item.content
                                )}
                            </div>
                            <button 
                                className="copy-button"
                                onClick={() => {
                                    const textToCopy = item.type === 'multiple-choice' || item.type === 'matching'
                                        ? [
                                            item.question, 
                                            ...item.choices,
                                            ...(item.type === 'matching' && item.answers ? item.answers : [])
                                        ].join('\n')
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

    // Update the autoCreateLayout function
    const autoCreateLayout = () => {
        if (!canvas || !worksheetData) return;

        // Clear existing canvas
        canvas.clear();

        // Add Name & Date at the top
        addShape('Name & Date');

        // Add title
        const title = new fabric.Textbox(worksheetData.title || 'Worksheet', {
            left: 50,
            top: 100,
            width: canvas.width - 100,
            fontSize: 24,
            fontFamily: 'Arial',
            fontWeight: 'bold',
            textAlign: 'center'
        });
        canvas.add(title);

        // Parse and add content
        const parsedContent = parseContent(generatedContent);
        let currentTop = 160;

        parsedContent.forEach((item) => {
            if (item.type === 'multiple-choice' || item.type === 'matching') {
                // Create grouped question (multiple choice or matching)
                const questionText = new fabric.Textbox(item.question, {
                    left: 50,
                    top: 0,
                    width: canvas.width - 100,
                    fontSize: 14,
                    fontFamily: 'Arial'
                });

                const elements = [questionText];
                let currentHeight = questionText.height;

                // Add choices
                item.choices.forEach((choice, idx) => {
                    const choiceText = new fabric.Textbox(choice, {
                        left: 70,
                        top: currentHeight + (idx * 25),
                        width: (canvas.width - 100) / 2 - 20, // Half width for matching
                        fontSize: 14,
                        fontFamily: 'Arial'
                    });
                    elements.push(choiceText);
                });

                // Add matching answers if they exist
                if (item.type === 'matching' && item.answers) {
                    item.answers.forEach((answer, idx) => {
                        const answerText = new fabric.Textbox(answer, {
                            left: canvas.width / 2,
                            top: questionText.height + (idx * 25),
                            width: (canvas.width - 100) / 2 - 20,
                            fontSize: 14,
                            fontFamily: 'Arial'
                        });
                        elements.push(answerText);
                    });
                }

                const group = new fabric.Group(elements, {
                    left: 50,
                    top: currentTop
                });

                canvas.add(group);
                currentTop += group.height + 30;

            } else {
                // Add regular question text
                const text = new fabric.Textbox(item.content, {
                    left: 50,
                    top: currentTop,
                    width: canvas.width - 100,
                    fontSize: 14,
                    fontFamily: 'Arial'
                });
                canvas.add(text);
                currentTop += text.height + 15;

                // Add answer box for non-multiple choice/matching questions
                const isLongAnswer = item.content.toLowerCase().includes('long answer');
                const boxHeight = isLongAnswer ? 120 : 90;

                const answerBox = new fabric.Rect({
                    left: 50,
                    top: currentTop,
                    width: canvas.width - 100,
                    height: boxHeight,
                    fill: 'transparent',
                    stroke: '#000',
                    strokeWidth: 1
                });
                canvas.add(answerBox);
                currentTop += boxHeight + 30;
            }
        });

        canvas.renderAll();
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
                            <button 
                                className="auto-create-button"
                                onClick={autoCreateLayout}
                            >
                                Auto-create Layout
                            </button>
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
import React, { useState, useEffect } from 'react';
import { fabric } from 'fabric';
import './WorksheetEditor.css';
import { FaHome, FaDownload } from 'react-icons/fa';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { TEMPLATE_ELEMENTS, parseContent, createShape, createTextbox } from '../utils/editorUtils';

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

        // Add keyboard event listener for delete functionality
        const handleKeyDown = (e) => {
            if (e.key === 'Backspace' && newCanvas.getActiveObject()) {
                e.preventDefault(); // Prevent browser back navigation
                const activeObjects = newCanvas.getActiveObjects();
                activeObjects.forEach(obj => newCanvas.remove(obj));
                newCanvas.discardActiveObject();
                newCanvas.renderAll();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        setCanvas(newCanvas);

        // Clean up event listeners when component unmounts
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            newCanvas.dispose();
        };
    }, [worksheetData]);

    const addText = () => {
        if (!canvas) return;
        const text = createTextbox({
            text: 'Click to edit text',
            width: 200,
            fontSize: 16
        });
        canvas.add(text);
        canvas.setActiveObject(text);
    };

    const addSection = (sectionName) => {
        if (!canvas) return;
        const section = createTextbox({
            text: sectionName,
            top: canvas.height / 2,
            width: canvas.width - 100,
            fontSize: 18,
            fontWeight: 'bold',
            backgroundColor: '#f5f5f5',
            padding: 10
        });
        canvas.add(section);
    };

    const addShape = (shapeName) => {
        if (!canvas) return;
        const shape = createShape(shapeName, canvas);
        if (shape) {
            canvas.add(shape);
            canvas.setActiveObject(shape);
        }
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
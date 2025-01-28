import React, { useState, useEffect } from 'react';
import { fabric } from 'fabric';
import './WorksheetEditor.css';
import { FaHome, FaDownload, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { 
    TEMPLATE_ELEMENTS, 
    parseContent, 
    createShape, 
    createTextbox,
    createMultipleChoiceGroup,
    initializeCanvas,
    generatePDF
} from '../utils/editorUtils';

const WorksheetEditor = ({ worksheetData }) => {
    const [canvases, setCanvases] = useState([]);
    const [activePageIndex, setActivePageIndex] = useState(0);
    const [activeTab, setActiveTab] = useState('layout');
    const [generatedContent, setGeneratedContent] = useState(worksheetData?.content || '');

    useEffect(() => {
        // Initialize two canvases
        const canvas1 = initializeCanvas('worksheet-canvas-1', 800, 1100, worksheetData);
        const canvas2 = initializeCanvas('worksheet-canvas-2', 800, 1100, worksheetData);
        
        setCanvases([canvas1, canvas2]);

        // Move keydown handler outside to avoid stale closure
        return () => {
            canvas1?.dispose();
            canvas2?.dispose();
        };
    }, [worksheetData]);

    // Add separate effect for keyboard events to avoid stale closure
    useEffect(() => {
        const handleKeyDown = (e) => {
            const activeCanvas = canvases[activePageIndex];
            if (e.key === 'Backspace' || e.key === 'Delete') {
                if (activeCanvas?.getActiveObject()) {
                    e.preventDefault();
                    const activeObjects = activeCanvas.getActiveObjects();
                    activeObjects.forEach(obj => activeCanvas.remove(obj));
                    activeCanvas.discardActiveObject();
                    activeCanvas.renderAll();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [canvases, activePageIndex]);

    // Add effect for canvas selection/dragging
    useEffect(() => {
        canvases.forEach(canvas => {
            if (canvas) {
                // Enable object selection and movement
                canvas.selection = true;
                canvas.on('object:moving', (e) => {
                    const obj = e.target;
                    // Optional: Add bounds checking if needed
                    if (obj.left < 0) obj.left = 0;
                    if (obj.top < 0) obj.top = 0;
                    if (obj.left > canvas.width - obj.width * obj.scaleX) {
                        obj.left = canvas.width - obj.width * obj.scaleX;
                    }
                    if (obj.top > canvas.height - obj.height * obj.scaleY) {
                        obj.top = canvas.height - obj.height * obj.scaleY;
                    }
                });
            }
        });
    }, [canvases]);

    // Update the useEffect for page switching
    useEffect(() => {
        canvases.forEach((canvas, index) => {
            if (!canvas) return;

            if (index === activePageIndex) {
                canvas.setZoom(1); // Reset zoom
                canvas.selection = true;
                canvas.interactive = true;
                canvas.forEachObject(obj => {
                    obj.selectable = true;
                    obj.evented = true;
                });
                canvas.renderAll();
                canvas.calcOffset(); // Recalculate offset after showing
            } else {
                canvas.selection = false;
                canvas.interactive = false;
                canvas.forEachObject(obj => {
                    obj.selectable = false;
                    obj.evented = false;
                });
                canvas.renderAll();
            }
        });
    }, [canvases, activePageIndex]);

    const activeCanvas = canvases[activePageIndex];

    const addText = () => {
        if (!activeCanvas) return;
        const text = createTextbox({
            text: 'Click to edit text',
            width: 200,
            fontSize: 16
        });
        activeCanvas.add(text);
        activeCanvas.setActiveObject(text);
    };

    const addSection = (sectionName) => {
        if (!activeCanvas) return;
        const section = createTextbox({
            text: sectionName,
            top: activeCanvas.height / 2,
            width: activeCanvas.width - 100,
            fontSize: 18,
            fontWeight: 'bold',
            backgroundColor: '#f5f5f5',
            padding: 10
        });
        activeCanvas.add(section);
    };

    const handleCanvasDrop = (e) => {
        if (!activeCanvas) return;
        
        const data = e.dataTransfer.getData('text');
        let content;
        try {
            content = JSON.parse(data);
        } catch {
            content = { type: 'text', content: data };
        }
        
        const canvasEl = activeCanvas.getElement();
        const rect = canvasEl.getBoundingClientRect();
        const dropX = e.clientX - rect.left;
        const dropY = e.clientY - rect.top;

        if (content.type === 'multiple-choice' || content.type === 'matching') {
            const group = createMultipleChoiceGroup(content, dropX, dropY);
            activeCanvas.add(group);
            activeCanvas.setActiveObject(group);
        } else {
            const textbox = createTextbox({
                text: content.content || '',
                left: dropX,
                top: dropY,
                width: 300
            });
            activeCanvas.add(textbox);
            activeCanvas.setActiveObject(textbox);
        }
        
        activeCanvas.renderAll();
    };

    const handleHomeClick = () => window.location.href = '/';

    const handleDownloadPDF = async () => {
        if (canvases.length === 0) return;
        try {
            const pdf = await generatePDF(canvases);
            pdf.save('worksheet.pdf');
        } catch (error) {
            console.error('Error generating PDF:', error);
        }
    };

    const addShape = (shapeName) => {
        if (!activeCanvas) return;
        const shape = createShape(shapeName, activeCanvas);
        if (shape) {
            activeCanvas.add(shape);
            activeCanvas.setActiveObject(shape);
        }
    };

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

    const autoCreateLayout = () => {
        if (!canvases || !worksheetData) return;

        // Clear both canvases
        canvases.forEach(canvas => canvas.clear());
        let currentCanvas = canvases[0];
        
        // Start with page 1
        addShape('Name & Date');

        const title = new fabric.Textbox(worksheetData.title || 'Worksheet', {
            left: 50,
            top: 100,
            width: currentCanvas.width - 100,
            fontSize: 24,
            fontFamily: 'Arial',
            fontWeight: 'bold',
            textAlign: 'center'
        });
        currentCanvas.add(title);

        const parsedContent = parseContent(generatedContent);
        let currentTop = 160;
        let currentPage = 0;

        const checkAndSwitchPage = (requiredHeight) => {
            // Check if content will overflow current page
            if (currentTop + requiredHeight > currentCanvas.height - 50) { // 50px margin at bottom
                if (currentPage < canvases.length - 1) {
                    // Switch to next page
                    currentPage++;
                    currentCanvas = canvases[currentPage];
                    currentTop = 50; // Reset to top of new page with margin
                    return true;
                }
            }
            return false;
        };

        parsedContent.forEach((item) => {
            let contentHeight = 0;
            let elements = [];

            if (item.type === 'multiple-choice' || item.type === 'matching') {
                // Calculate total height for multiple choice/matching question
                const questionText = new fabric.Textbox(item.question, {
                    left: 50,
                    top: 0,
                    width: currentCanvas.width - 100,
                    fontSize: 14,
                    fontFamily: 'Arial'
                });

                contentHeight = questionText.height + 10;
                elements.push(questionText);

                const choicesHeight = item.choices.length * 25;
                contentHeight += choicesHeight;

                item.choices.forEach((choice, idx) => {
                    const choiceText = new fabric.Textbox(choice, {
                        left: 70,
                        top: questionText.height + 10 + (idx * 25),
                        width: (currentCanvas.width - 100) / 2 - 20,
                        fontSize: 14,
                        fontFamily: 'Arial'
                    });
                    elements.push(choiceText);
                });

                if (item.type === 'matching' && item.answers) {
                    item.answers.forEach((answer, idx) => {
                        const answerText = new fabric.Textbox(answer, {
                            left: currentCanvas.width / 2,
                            top: questionText.height + 10 + (idx * 25),
                            width: (currentCanvas.width - 100) / 2 - 20,
                            fontSize: 14,
                            fontFamily: 'Arial'
                        });
                        elements.push(answerText);
                    });
                }

                contentHeight += 30; // Margin after question

                // Check if we need to switch pages
                if (checkAndSwitchPage(contentHeight)) {
                    // Recalculate positions for new page
                    elements.forEach(el => {
                        el.set({ top: el.top + currentTop });
                    });
                }

                const group = new fabric.Group(elements, {
                    left: 50,
                    top: currentTop
                });

                currentCanvas.add(group);
                currentTop += contentHeight;

            } else {
                // Regular question
                const text = new fabric.Textbox(item.content, {
                    left: 50,
                    top: currentTop,
                    width: currentCanvas.width - 100,
                    fontSize: 14,
                    fontFamily: 'Arial'
                });

                const isLongAnswer = item.content.toLowerCase().includes('long answer');
                const boxHeight = isLongAnswer ? 120 : 90;
                contentHeight = text.height + 15 + boxHeight + 30;

                // Check if we need to switch pages
                if (checkAndSwitchPage(contentHeight)) {
                    // Add text to new page
                    text.set({ top: currentTop });
                }

                currentCanvas.add(text);
                currentTop += text.height + 15;

                const answerBox = new fabric.Rect({
                    left: 50,
                    top: currentTop,
                    width: currentCanvas.width - 100,
                    height: boxHeight,
                    fill: 'transparent',
                    stroke: '#000',
                    strokeWidth: 1
                });
                currentCanvas.add(answerBox);
                currentTop += boxHeight + 30;
            }
        });

        // Render both canvases
        canvases.forEach(canvas => canvas.renderAll());
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
                    <div className="page-controls">
                        <button 
                            onClick={() => {
                                const prevCanvas = canvases[activePageIndex];
                                prevCanvas?.discardActiveObject();
                                prevCanvas?.renderAll();
                                setActivePageIndex(0);
                            }}
                            className={activePageIndex === 0 ? 'active' : ''}
                            disabled={activePageIndex === 0}
                        >
                            <FaChevronLeft />
                        </button>
                        <span>Page {activePageIndex + 1} of {canvases.length}</span>
                        <button 
                            onClick={() => {
                                const prevCanvas = canvases[activePageIndex];
                                prevCanvas?.discardActiveObject();
                                prevCanvas?.renderAll();
                                setActivePageIndex(1);
                            }}
                            className={activePageIndex === 1 ? 'active' : ''}
                            disabled={activePageIndex === 1}
                        >
                            <FaChevronRight />
                        </button>
                    </div>
                    <button 
                        className="download-button"
                        onClick={handleDownloadPDF}
                        title="Download as PDF"
                    >
                        <FaDownload />
                    </button>
                </div>
                <div className="canvas-container">
                    <div style={{ display: activePageIndex === 0 ? 'block' : 'none' }}>
                        <canvas id="worksheet-canvas-1" />
                    </div>
                    <div style={{ display: activePageIndex === 1 ? 'block' : 'none' }}>
                        <canvas id="worksheet-canvas-2" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorksheetEditor; 
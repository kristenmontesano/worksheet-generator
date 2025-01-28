import React, { useState, useEffect } from 'react';
import { fabric } from 'fabric';
import './WorksheetEditor.css';
import { FaHome, FaDownload } from 'react-icons/fa';
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
    const [canvas, setCanvas] = useState(null);
    const [activeTab, setActiveTab] = useState('layout');
    const [generatedContent, setGeneratedContent] = useState(worksheetData?.content || '');

    useEffect(() => {
        const newCanvas = initializeCanvas('worksheet-canvas', 800, 1100, worksheetData);

        const handleKeyDown = (e) => {
            if (e.key === 'Backspace' && newCanvas.getActiveObject()) {
                e.preventDefault();
                const activeObjects = newCanvas.getActiveObjects();
                activeObjects.forEach(obj => newCanvas.remove(obj));
                newCanvas.discardActiveObject();
                newCanvas.renderAll();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        setCanvas(newCanvas);

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
            const group = createMultipleChoiceGroup(content, dropX, dropY);
            canvas.add(group);
            canvas.setActiveObject(group);
        } else {
            const textbox = createTextbox({
                text: content.content || '',
                left: dropX,
                top: dropY,
                width: 300
            });
            canvas.add(textbox);
            canvas.setActiveObject(textbox);
        }
        
        canvas.renderAll();
    };

    const handleHomeClick = () => window.location.href = '/';

    const handleDownloadPDF = async () => {
        if (!canvas) return;
        try {
            canvas.discardActiveObject();
            canvas.renderAll();
            const pdf = await generatePDF(canvas);
            pdf.save('worksheet.pdf');
        } catch (error) {
            console.error('Error generating PDF:', error);
        }
    };

    const addShape = (shapeName) => {
        if (!canvas) return;
        const shape = createShape(shapeName, canvas);
        if (shape) {
            canvas.add(shape);
            canvas.setActiveObject(shape);
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
        if (!canvas || !worksheetData) return;

        canvas.clear();

        addShape('Name & Date');

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

        const parsedContent = parseContent(generatedContent);
        let currentTop = 160;

        parsedContent.forEach((item) => {
            if (item.type === 'multiple-choice' || item.type === 'matching') {
                const questionText = new fabric.Textbox(item.question, {
                    left: 50,
                    top: 0,
                    width: canvas.width - 100,
                    fontSize: 14,
                    fontFamily: 'Arial'
                });

                const elements = [questionText];
                let currentHeight = questionText.height;

                item.choices.forEach((choice, idx) => {
                    const choiceText = new fabric.Textbox(choice, {
                        left: 70,
                        top: currentHeight + (idx * 25),
                        width: (canvas.width - 100) / 2 - 20,
                        fontSize: 14,
                        fontFamily: 'Arial'
                    });
                    elements.push(choiceText);
                });

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
                const text = new fabric.Textbox(item.content, {
                    left: 50,
                    top: currentTop,
                    width: canvas.width - 100,
                    fontSize: 14,
                    fontFamily: 'Arial'
                });
                canvas.add(text);
                currentTop += text.height + 15;

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
import React, { useState, useEffect } from 'react';
import { fabric } from 'fabric';
import './WorksheetEditor.css';

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
        { name: 'Circle' }
    ]
};

const WorksheetEditor = ({ worksheetData }) => {
    const [canvas, setCanvas] = useState(null);
    const [activeTab, setActiveTab] = useState('layout');
    const [generatedContent, setGeneratedContent] = useState(worksheetData?.content || '');

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

        setCanvas(newCanvas);

        return () => {
            newCanvas.dispose();
        };
    }, []);

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
                // Add grid implementation
                break;
            default:
                return;
        }
        if (shape) {
            canvas.add(shape);
            canvas.setActiveObject(shape);
        }
    };

    // Add this function to handle dropping text onto canvas
    const handleCanvasDrop = (e) => {
        if (!canvas) return;
        
        // Get the text content that was dragged
        const text = e.dataTransfer.getData('text');
        
        // Calculate drop position relative to canvas
        const canvasEl = canvas.getElement();
        const rect = canvasEl.getBoundingClientRect();
        const dropX = e.clientX - rect.left;
        const dropY = e.clientY - rect.top;

        // Create new text object at drop position
        const textbox = new fabric.Textbox(text, {
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

                    {activeTab === 'content' && (
                        <div className="content-section">
                            <div className="ai-content">
                                {generatedContent.split('\n').map((line, i) => (
                                    <div 
                                        key={i} 
                                        className="content-line"
                                        draggable
                                        onDragStart={(e) => {
                                            e.dataTransfer.setData('text', line);
                                        }}
                                    >
                                        {line}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div 
                className="editor-main"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleCanvasDrop}
            >
                <div className="canvas-container">
                    <canvas id="worksheet-canvas" />
                </div>
            </div>
        </div>
    );
};

export default WorksheetEditor; 
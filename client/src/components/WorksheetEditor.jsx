import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as fabric from 'fabric';
import './WorksheetEditor.css';
import WorksheetForm from './WorksheetForm';
import generateWorksheetContent from '../utils/generateWorksheetContent';
import CanvasHistory from '../utils/canvasHistory';

const TEMPLATE_ELEMENTS = {
  headers: [
    { name: 'Classic Header', height: 80 },
    { name: 'Modern Header', height: 60 },
  ],
  sections: [
    { name: 'Learning Objectives:' },
    { name: 'Warm-Up Questions:' },
    { name: 'Main Exercises:' },
    { name: 'Challenge Question:' },
  ],
  shapes: [
    { name: 'Answer Box' },
    { name: 'Number Line' },
    { name: 'Grid' },
    { name: 'Star' },
    { name: 'Circle' },
  ],
};

const WorksheetEditor = ({ worksheetData }) => {
  const originalWidth = 800; // Original canvas width
  const originalHeight = 1100; // Original canvas height

  const [searchParams] = useSearchParams();
  const [responses, setResponses] = useState([
    ...(worksheetData?.content.split('\n').filter(Boolean) || []),
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [canvas, setCanvas] = useState(null);
  const [activeTab, setActiveTab] = useState('layout');
  const historyRef = useRef([]);

  // Extract query parameters
  const [inputs, setInputs] = useState({
    subject: searchParams.get('subject') || '',
    topic: searchParams.get('topic') || '',
    grade: searchParams.get('grade') || '',
  });

  useEffect(() => {
    const newInputs = {};
    ['subject', 'topic', 'grade'].forEach((param) => {
      if (searchParams.has(param)) {
        newInputs[param] = searchParams.get(param);
      }
    });
    setInputs((prevState) => ({ ...prevState, ...newInputs }));
  }, [searchParams]);

  const toggleExpand = () => setIsModalOpen((prevState) => !prevState);

  const initializeCanvas = () => {
    const newCanvas = new fabric.Canvas('worksheet-canvas', {
      backgroundColor: '#ffffff',
      containerClassName: 'theCanvas',
      preserveObjectStacking: true,
    });

    fabric.FabricObject.prototype.fill = '#000000';
    fabric.FabricObject.prototype.fontFamily = 'Arial';

    // Initialize CanvasHistory
    const canvasHistory = new CanvasHistory(newCanvas);
    historyRef.current = canvasHistory;

    setCanvas(newCanvas);

    return newCanvas;
  };

  const undo = () => {
    if (historyRef.current) {
      historyRef.current.undo();
    } else {
      console.warn('History manager not initialized');
    }
  };

  const redo = () => {
    if (historyRef.current) {
      historyRef.current.redo();
    } else {
      console.warn('History manager not initialized');
    }
  };

  useEffect(() => {
    const newCanvas = initializeCanvas();

    const resizeCanvas = () => {
      const containerWidth = window.innerWidth;
      const containerHeight = window.innerHeight - 40; // Account for 20px margin on top and bottom

      const widthRatio = containerWidth / originalWidth;
      const heightRatio = containerHeight / originalHeight;
      const ratio = Math.min(widthRatio, heightRatio);

      const newWidth = originalWidth * ratio;
      const newHeight = originalHeight * ratio;

      newCanvas.setDimensions({ width: newWidth, height: newHeight });
      newCanvas.setViewportTransform([ratio, 0, 0, ratio, 0, 0]);
      newCanvas.renderAll();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      newCanvas.dispose();
    };
  }, []);

  useEffect(() => {
    // Add a keydown listener to handle keyboard shortcuts
    const handleKeyDown = (e) => {
      const isMac = navigator.userAgent.includes('Mac'); // Detect macOS
      const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        const activeObject = canvas.getActiveObject();

        if (activeObject) {
          if (activeObject.type.toLowerCase() === 'activeselection') {
            // If multiple objects are selected, iterate and remove them
            const objects = activeObject.getObjects();
            objects.forEach((obj) => {
              canvas.remove(obj); // Remove each object from the canvas
            });
            canvas.discardActiveObject(); // Clear the active selection
          } else {
            // If a single object is selected, remove it
            canvas.remove(activeObject);
          }
          canvas.renderAll(); // Update the canvas
        }
      } else if (ctrlOrCmd && e.key === 'a') {
        // Handle Select All (Ctrl+A or Cmd+A)
        e.preventDefault(); // Prevent default browser behavior
        const objects = canvas.getObjects();
        if (objects.length) {
          const selection = new fabric.ActiveSelection(objects, {
            canvas: canvas,
          });
          canvas.setActiveObject(selection);
          canvas.renderAll();
        }
      } else if (e.key === 'Escape') {
        // Handle Deselect All (Esc)
        canvas.discardActiveObject();
        canvas.renderAll();
      } else if (ctrlOrCmd && e.key === 'z' && !e.shiftKey) {
        // Undo (Cmd + Z or Ctrl + Z)
        e.preventDefault();
        console.log('Undo action triggered');
        undo(); // Call the undo function
      } else if (ctrlOrCmd && e.shiftKey && e.key.toLowerCase() === 'z') {
        // Redo (Cmd + Shift + Z or Ctrl + Shift + Z)
        e.preventDefault();
        console.log('Redo action triggered');
        redo(); // Call the redo function
      }
    };

    // Attach the event listener to the window
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [canvas]);

  const addTextToCanvas = (text = 'Click to edit text', options = {}) => {
    if (!canvas) return;

    // Ensure `text` is a string
    const validText = typeof text === 'string' ? text : 'Click to edit text';

    // Get the last added object from the canvas
    const objects = canvas.getObjects();
    const lastObject = objects.length > 0 ? objects[objects.length - 1] : null;

    // Calculate the position of the new text
    let newTop = 20; // Default top position
    if (lastObject) {
      newTop = lastObject.top + lastObject.height + 20; // Place below the last object with a margin of 20px
    }

    // Ensure it doesn’t exceed canvas height
    if (newTop + (options.height || 50) > canvas.height) {
      console.warn(
        'Text exceeds canvas height, placing on top of the last object.'
      );
      newTop = lastObject ? lastObject.top : 20;
    }

    // Create a text box with wrapping
    const textBox = new fabric.Textbox(validText, {
      left: options.left || 20,
      top: newTop,
      width: options.width || originalWidth - 40, // Set maximum width
      fontSize: 16,
      fontFamily: 'Arial',
      fill: '#000000',
      backgroundColor: options.backgroundColor || 'transparent',
      textAlign: 'left', // Align text to the left
      editable: true, // Allow user to edit text
      ...options, // Merge additional options
    });

    // Add text box to the canvas
    canvas.add(textBox);
    canvas.setActiveObject(textBox);
    canvas.renderAll();
  };

  const addSection = (sectionName, options = {}) => {
    if (!canvas) return;

    const boxWidth = options.width || originalWidth - 100; // Desired bounding box width
    const boxHeight = options.height || 40; // Set the height (for alignment)

    // Create the text object with a fixed width
    const text = new fabric.FabricText(sectionName, {
      left: options.left || 50, // Position on canvas
      top: options.top || 20, // Position on canvas
      fontSize: options.fontSize || 18,
      fontFamily: options.fontFamily || 'Arial',
      fontWeight: options.fontWeight || 'bold',
      fill: options.fill || '#000000',
      width: boxWidth, // Set the fixed width
      height: boxHeight, // Set the fixed height (not enforced, just for layout)
      textAlign: 'left', // Align text within the bounding box
      editable: true, // Enable editing
      backgroundColor: options.backgroundColor || '#f5f5f5', // Add background to the text
      originX: 'left',
      originY: 'top',
      padding: options.padding || 10, // Optional padding for better spacing
      ...options,
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
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
          strokeWidth: 1,
        });
        break;

      case 'Grid': {
        const gridSize = 20; // Size of each grid cell
        const gridWidth = 400; // Total grid width
        const gridHeight = 400; // Total grid height

        // Predefine grid lines for performance
        const horizontalLines = Array.from(
          { length: Math.ceil(gridHeight / gridSize) + 1 },
          (_, i) =>
            new fabric.Line([0, i * gridSize, gridWidth, i * gridSize], {
              stroke: '#ccc',
              selectable: false,
            })
        );

        const verticalLines = Array.from(
          { length: Math.ceil(gridWidth / gridSize) + 1 },
          (_, i) =>
            new fabric.Line([i * gridSize, 0, i * gridSize, gridHeight], {
              stroke: '#ccc',
              selectable: false,
            })
        );

        shape = new fabric.Group([...horizontalLines, ...verticalLines], {
          left: 50,
          top: 50,
          selectable: true,
        });
        break;
      }

      case 'Number Line': {
        const numberLineLength = 400;
        const tickSpacing = 40;
        const tickCount = Math.ceil(numberLineLength / tickSpacing);

        const mainLine = new fabric.Line([0, 0, numberLineLength, 0], {
          stroke: '#000',
          selectable: false,
        });

        const tickMarks = Array.from({ length: tickCount + 1 }, (_, i) => [
          new fabric.Line([i * tickSpacing, -5, i * tickSpacing, 5], {
            stroke: '#000',
            selectable: false,
          }),
          new fabric.FabricText(String(i), {
            fontSize: 12,
            left: i * tickSpacing - 5,
            top: 10,
            selectable: false,
          }),
        ]).flat();

        shape = new fabric.Group([mainLine, ...tickMarks], {
          left: 50,
          top: 50,
          selectable: true,
        });
        break;
      }

      case 'Circle':
        shape = new fabric.Circle({
          left: 50,
          top: 50,
          radius: 50,
          fill: 'transparent',
          stroke: '#000',
          strokeWidth: 1,
        });
        break;

      case 'Star': {
        const starPoints = 5; // Number of star points
        const outerRadius = 50; // Outer radius
        const innerRadius = 25; // Inner radius

        // Calculate the points of the star
        const points = [];
        for (let i = 0; i < starPoints * 2; i++) {
          const angle = (i * Math.PI) / starPoints; // Angle for each point
          const radius = i % 2 === 0 ? outerRadius : innerRadius; // Alternate between outer and inner radius
          points.push({
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius,
          });
        }

        shape = new fabric.Polygon(points, {
          left: 50,
          top: 50,
          fill: 'transparent',
          stroke: '#000',
          strokeWidth: 1,
        });
        break;
      }

      default:
        return;
    }

    if (shape) {
      canvas.add(shape);
      canvas.setActiveObject(shape);
      canvas.renderAll();
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
    const textbox = new fabric.FabricText(text, {
      left: dropX,
      top: dropY,
      width: 300,
      fontSize: 14,
      fontFamily: 'Arial',
      fill: '#000000',
      backgroundColor: 'transparent',
    });

    canvas.add(textbox);
    canvas.setActiveObject(textbox);
    canvas.renderAll();
  };

  // Simple fuzzy match function
  const isFuzzyMatch = (header, line, threshold = 0.8) => {
    const normalize = (str) => str.toLowerCase().trim();
    const headerWords = normalize(header).split(' ');
    const lineWords = normalize(line).split(' ');

    // Count matching words
    const matches = headerWords.filter((word) =>
      lineWords.includes(word)
    ).length;
    const similarityScore =
      matches / Math.max(headerWords.length, lineWords.length);

    return similarityScore >= threshold;
  };

  const autoLayoutToCanvas = () => {
    if (!canvas || !responses) return;

    const sectionHeaders = TEMPLATE_ELEMENTS.sections.map((section) =>
      section.name.toLowerCase().trim()
    );

    let currentTop = 50; // Start at the top of the canvas
    const sectionIndent = 20; // Indentation for section headers
    const contentIndent = 40; // Indentation for section content
    const regularSpacing = 20; // Default spacing between items
    const extraSpacing = 55; // Extra spacing between non-section items

    responses.forEach((line) => {
      const normalizedLine = line.toLowerCase().trim(); // Normalize the line
      const isSectionHeader = sectionHeaders.some((header) =>
        isFuzzyMatch(header, normalizedLine)
      );

      if (isSectionHeader) {
        // Add section header using addSection
        addSection(line, {
          left: sectionIndent,
          top: currentTop,
        });
      } else {
        // Add regular content using addTextToCanvas
        addTextToCanvas(line, {
          left: contentIndent,
          top: currentTop,
          fontSize: 16,
          fontWeight: 'normal',
          width: originalWidth - 100 - contentIndent,
        });

        // Add extra spacing after non-section items
        currentTop += extraSpacing;
      }

      // Adjust the next `top` position based on the height of the last added object
      const lastObject = canvas.getObjects().at(-1);
      if (lastObject) {
        currentTop =
          lastObject.top +
          lastObject.height +
          (isSectionHeader ? regularSpacing : extraSpacing);
      }

      // Ensure the content doesn't exceed the canvas height
      if (currentTop + 50 > canvas.height) {
        console.warn(
          'Content exceeds canvas height. Some items may be truncated.'
        );
        return; // Stop adding more content
      }
    });

    canvas.renderAll(); // Ensure the canvas updates
  };

  // Regenerate AI Response
  const regenerateResponse = async () => {
    setLoading(true);
    try {
      const data = await generateWorksheetContent(
        '/api/worksheets/generate',
        inputs
      );

      if (data.content) {
        setResponses((prevState) => [
          ...prevState,
          ...data.content.split('\n').filter(Boolean),
        ]);
      }
    } catch (error) {
      console.error('Error regenerating content:', error);
      alert('Failed to regenerate content. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="worksheet-editor">
      <aside className="editor-sidebar">
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
            <>
              <h3>Headers</h3>
              {TEMPLATE_ELEMENTS.headers.map((header) => (
                <div
                  key={header.name}
                  className="template-item"
                  onClick={() => addSection(header.name)}
                >
                  {header.name}
                </div>
              ))}
            </>
          )}

          {activeTab === 'elements' && (
            <>
              <h3>Worksheet Sections</h3>
              <button onClick={addTextToCanvas}>Add Text</button>
              {TEMPLATE_ELEMENTS.shapes.map((shape) => (
                <button key={shape.name} onClick={() => addShape(shape.name)}>
                  {shape.name}
                </button>
              ))}
            </>
          )}

          {activeTab === 'content' && (
            <>
              {/* Regenerate and Edit Buttons */}
              <div className="actions">
                <button onClick={regenerateResponse} disabled={loading}>
                  {loading ? 'Regenerating...' : 'Generate Another Response'}
                </button>
                <button onClick={toggleExpand} disabled={loading}>
                  Edit Inputs
                </button>
                <button
                  onClick={autoLayoutToCanvas}
                  disabled={loading || !responses.length}
                >
                  Auto Layout
                </button>
              </div>

              {/* Modal for Editing Inputs */}
              {isModalOpen && (
                <div className="modal">
                  <WorksheetForm
                    inputs={inputs}
                    formTitle={null}
                    buttonText="Regenerate"
                    onSubmitSuccess={(data) => {
                      if (data.content) {
                        const newResponses = data.content
                          .split('\n')
                          .filter(Boolean);

                        setResponses((prevState) => [
                          ...prevState,
                          ...newResponses,
                        ]);
                      }
                    }}
                  />
                </div>
              )}

              {/* Original AI Content */}
              {responses.length > 0 &&
                responses.map((line, i) => (
                  <div
                    key={i}
                    className="content-line"
                    draggable
                    onClick={() => addTextToCanvas(line)}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text', line);
                    }}
                  >
                    {line}
                  </div>
                ))}
            </>
          )}
        </div>
      </aside>

      <div
        className="editor-main"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleCanvasDrop}
      >
        <div className="canvas-sizer">
          <canvas id="worksheet-canvas" />
        </div>
      </div>
    </div>
  );
};

export default WorksheetEditor;

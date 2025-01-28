import { fabric } from 'fabric';
import jsPDF from 'jspdf';

export const TEMPLATE_ELEMENTS = {
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

export const parseContent = (content) => {
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

export const createShape = (shapeName, canvas) => {
    if (!canvas) return null;
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
            return null;
    }
    
    return shape;
};

export const createTextbox = (options) => {
    return new fabric.Textbox(options.text || '', {
        left: options.left || 50,
        top: options.top || 50,
        width: options.width || 300,
        fontSize: options.fontSize || 14,
        fontFamily: options.fontFamily || 'Arial',
        fill: options.fill || '#000000',
        backgroundColor: options.backgroundColor || 'transparent',
        ...options
    });
};

export const createMultipleChoiceGroup = (content, dropX, dropY) => {
    const questionText = new fabric.Textbox(content.question || '', {
        left: 0,
        top: 0,
        width: 300,
        fontSize: 14,
        fontFamily: 'Arial'
    });

    const questionHeight = questionText.height || 25;

    const choiceObjects = content.choices.map((choice, index) => {
        return new fabric.Textbox(choice || '', {
            left: 20,
            top: questionHeight + 10 + (index * 30),
            width: 280,
            fontSize: 14,
            fontFamily: 'Arial'
        });
    });

    const elements = [questionText, ...choiceObjects];

    if (content.type === 'matching' && content.answers) {
        content.answers.forEach((answer, index) => {
            const answerText = new fabric.Textbox(answer || '', {
                left: 320,
                top: questionHeight + 10 + (index * 30),
                width: 280,
                fontSize: 14,
                fontFamily: 'Arial'
            });
            elements.push(answerText);
        });
    }

    return new fabric.Group(elements, {
        left: dropX,
        top: dropY,
        selectable: true
    });
};

export const initializeCanvas = (canvasId, width, height, worksheetData) => {
    const newCanvas = new fabric.Canvas(canvasId, {
        width,
        height,
        backgroundColor: '#ffffff',
        selection: true,
        preserveObjectStacking: true,
        interactive: true
    });

    fabric.Object.prototype.set({
        fill: '#000000',
        fontFamily: 'Arial',
        cornerSize: 8,
        transparentCorners: false,
        cornerColor: '#007bff',
        borderColor: '#007bff',
        cornerStyle: 'circle',
        padding: 5,
        selectable: true,
        hasControls: true,
        hasBorders: true
    });

    if (worksheetData?.state) {
        newCanvas.loadFromJSON(worksheetData.state, () => {
            newCanvas.renderAll();
        });
    }

    return newCanvas;
};

export const generatePDF = async (canvases) => {
    const PDF_WIDTH = 215.9;
    const PDF_HEIGHT = 279.4;

    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [PDF_WIDTH, PDF_HEIGHT]
    });

    const margins = 10;
    const scaleFactor = 2;

    // Add each canvas as a new page
    for (let i = 0; i < canvases.length; i++) {
        if (i > 0) {
            pdf.addPage();
        }

        const canvas = canvases[i];
        const canvasImage = canvas.toDataURL({
            format: 'png',
            quality: 1,
            multiplier: scaleFactor
        });

        pdf.addImage(
            canvasImage,
            'PNG',
            margins,
            margins,
            PDF_WIDTH - (margins * 2),
            PDF_HEIGHT - (margins * 2),
            undefined,
            'FAST'
        );
    }

    return pdf;
};
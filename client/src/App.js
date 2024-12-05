import React, { useState } from 'react';
import WorksheetEditor from './components/WorksheetEditor';
import WorksheetForm from './components/WorksheetForm';
import './App.css';

function App() {
    const [currentWorksheet, setCurrentWorksheet] = useState(null);

    const handleWorksheetCreated = (worksheet) => {
        setCurrentWorksheet(worksheet);
    };

    return (
        <div className="app">
            {!currentWorksheet ? (
                <>
                    <header>
                        <h1>Worksheet Generator</h1>
                    </header>
                    <main>
                        <WorksheetForm onWorksheetCreated={handleWorksheetCreated} />
                    </main>
                </>
            ) : (
                <WorksheetEditor worksheetData={currentWorksheet} />
            )}
        </div>
    );
}

export default App; 
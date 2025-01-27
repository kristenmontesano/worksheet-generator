import React, { useState, useEffect } from 'react';
import WorksheetEditor from './components/WorksheetEditor';
import WorksheetForm from './components/WorksheetForm';
import './App.css';
import WorksheetList from './components/WorksheetList';

function App() {
    const [currentWorksheet, setCurrentWorksheet] = useState(null);
    const [worksheets, setWorksheets] = useState([]);

    const handleWorksheetCreated = (response) => {
        // Update both the current worksheet and the list
        setCurrentWorksheet(response.worksheet);
        setWorksheets(prev => [response.worksheet, ...prev]);
    };

    const handleEditWorksheet = (worksheet) => {
        setCurrentWorksheet(worksheet);
    };

    useEffect(() => {
        // Fetch worksheets when component mounts
        const fetchWorksheets = async () => {
            try {
                const response = await fetch('http://localhost:5002/api/worksheets');
                if (!response.ok) {
                    throw new Error('Failed to fetch worksheets');
                }
                const data = await response.json();
                console.log('Fetched worksheets:', data); // Add logging
                setWorksheets(data);
            } catch (error) {
                console.error('Error fetching worksheets:', error);
            }
        };

        fetchWorksheets();
    }, []);

    return (
        <div className="app">
            {!currentWorksheet ? (
                <>
                    <header>
                        <h1>Worksheet Generator</h1>
                    </header>
                    <main>
                        <WorksheetForm onWorksheetCreated={handleWorksheetCreated} />
                        <WorksheetList 
                            worksheets={worksheets} 
                            onEditWorksheet={handleEditWorksheet}
                        />
                    </main>
                </>
            ) : (
                <WorksheetEditor 
                    worksheetData={currentWorksheet}
                    onBack={() => setCurrentWorksheet(null)}
                />
            )}
        </div>
    );
}

export default App; 
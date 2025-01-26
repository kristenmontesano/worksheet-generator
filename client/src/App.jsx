import { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import WorksheetEditor from './components/WorksheetEditor';
import WorksheetForm from './components/WorksheetForm';
import './App.css';

function App() {
  const [currentWorksheet, setCurrentWorksheet] = useState({
    content: '',
  });

  const handleWorksheetCreated = (worksheet) => setCurrentWorksheet(worksheet);

  const clearWorksheet = () => setCurrentWorksheet(null);

  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Route for the form */}
          <Route
            path="/"
            element={
              <>
                <h1>Worksheet Generator</h1>
                <WorksheetForm onSubmitSuccess={handleWorksheetCreated} />
              </>
            }
          />
          {/* Route for the editor */}
          <Route
            path="/worksheet"
            element={
              currentWorksheet ? (
                <WorksheetEditor
                  worksheetData={currentWorksheet}
                  onClearWorksheet={clearWorksheet}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import generateWorksheetContent from '../utils/generateWorksheetContent';

const WorksheetForm = ({
  onSubmitSuccess = () => {}, // Callback to handle success
  formTitle = 'Create New Worksheet', // Customizable form title
  navigateTo = '/worksheet', // Default navigation path
  buttonText = 'Generate Worksheet', // Customizable button text
  inputs = [], // Dynamic input fields (optional)
}) => {
  const navigate = useNavigate();

  // Initialize form data with default values for all fields
  const initializeFormData = () => {
    if (inputs.length === 0) {
      const defaults = inputs.reduce(
        (acc, input) => ({
          ...acc,
          [input.name]: input.value || '', // Ensure every field has a default value
        }),
        {
          subject: '',
          topic: '',
          grade: '',
        }
      );
      return defaults;
    } else {
      return inputs;
    }
  };

  const [formData, setFormData] = useState(initializeFormData());
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await generateWorksheetContent(
        '/api/worksheets/generate',
        formData
      );

      // Call success callback if provided
      onSubmitSuccess(data);

      // Build query parameters for navigation
      const queryParams = new URLSearchParams(formData).toString();

      // Navigate or update URL
      if (navigateTo !== location.pathname) {
        navigate(`${navigateTo}?${queryParams}`, { state: data });
      } else {
        history.pushState(data, '', `${location.pathname}?${queryParams}`);
      }
    } catch (error) {
      console.error('Error generating worksheet:', error);
      alert(
        'An error occurred while generating the worksheet. Please try again.'
      );
    }

    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="worksheet-form">
      {formTitle && <h2>{formTitle}</h2>}
      <form onSubmit={handleSubmit}>
        {/* Dynamic Inputs */}
        {inputs.length > 0 ? (
          inputs.map((input) => (
            <div className="form-group" key={input.name}>
              <label>{input.label}</label>
              {input.type === 'select' ? (
                <select
                  name={input.name}
                  value={formData[input.name] || ''}
                  onChange={handleChange}
                  required={input.required}
                >
                  {input.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={input.type || 'text'}
                  name={input.name}
                  value={formData[input.name] || ''}
                  onChange={handleChange}
                  placeholder={input.placeholder || ''}
                  required={input.required}
                />
              )}
            </div>
          ))
        ) : (
          <>
            {/* Default Inputs */}
            <div className="form-group">
              <label>Subject:</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Topic:</label>
              <input
                type="text"
                name="topic"
                value={formData.topic}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Grade Level:</label>
              <select
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                required
              >
                <option value="">Select Grade</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Grade {i + 1}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        <button type="submit" disabled={loading}>
          {loading ? 'Generating...' : buttonText}
        </button>
      </form>
    </div>
  );
};

export default WorksheetForm;

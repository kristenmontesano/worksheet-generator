import React, { useState } from 'react';
import axios from 'axios';

const WorksheetForm = ({ onWorksheetCreated }) => {
    const [formData, setFormData] = useState({
        subject: '',
        topic: '',
        grade: '',
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:5002/api/worksheets/generate', formData);
            onWorksheetCreated(response.data);
            setFormData({ subject: '', topic: '', grade: '' });
        } catch (error) {
            console.error('Error generating worksheet:', error);
            alert('Failed to generate worksheet');
        }
        setLoading(false);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="worksheet-form">
            <h2>Create New Worksheet Content</h2>
            <form onSubmit={handleSubmit}>
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
                <button type="submit" disabled={loading}>
                    {loading ? 'Generating...' : 'Generate Content'}
                </button>
            </form>
        </div>
    );
};

export default WorksheetForm; 
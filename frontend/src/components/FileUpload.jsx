import React, { useState } from 'react';
import axios from 'axios';
import config from '../config';

function FileUpload({ onUploadSuccess }) {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [quiz, setQuiz] = useState(null);
    const [error, setError] = useState(null);

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
            setError(null);
        } else {
            setError('Please select a PDF file');
            setFile(null);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file');
            return;
        }

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append("pdf", file);

        try {
            const response = await axios.post(`${config.API_BASE_URL}/quiz/upload`, formData, {
                headers: { 
                    "Content-Type": "multipart/form-data"
                },
                timeout: config.TIMEOUT
            });
            
            if (response.data && response.data.questions) {
                setQuiz(response.data);
                
                // Call onUploadSuccess with the new quiz data
                onUploadSuccess(response.data);
                
                // Clear the file input
                setFile(null);
                
                // Show preview for 2 seconds then fetch updated list
                setTimeout(() => {
                    // Trigger a fetch of the latest quiz list
                    onUploadSuccess(response.data);
                }, 2000);
            }
        } catch (error) {
            console.error("Upload failed:", error);
            setError(error.response?.data?.error || 'Upload failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="file-upload">
            <h2>Upload PDF to Generate Quiz</h2>
            
            <div className="upload-controls">
                <input 
                    type="file" 
                    accept=".pdf"
                    onChange={handleFileChange} 
                    disabled={loading}
                />
                <button 
                    onClick={handleUpload} 
                    disabled={loading || !file}
                >
                    {loading ? "Generating Quiz..." : "Upload PDF"}
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {quiz && quiz.questions && (
                <div className="quiz-preview">
                    <h3>Generated Quiz</h3>
                    <div className="questions-list">
                        {quiz.questions.map((q, index) => (
                            <div key={index} className="question">
                                <p><strong>Q{index + 1}:</strong> {q.question}</p>
                                <ul>
                                    {q.options.map((opt, idx) => (
                                        <li key={idx}>{opt}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default FileUpload;
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import config from '../config';
import FileUpload from '../components/FileUpload';

function Home() {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0); // Add this line

    const fetchQuizzes = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${config.API_BASE_URL}/quiz`);
            if (!response.ok) throw new Error('Failed to fetch quizzes');
            const data = await response.json();
            setQuizzes(data);
        } catch (error) {
            console.error('Error:', error);
            setError('Failed to load quizzes');
        } finally {
            setLoading(false);
        }
    };

    const handleUploadSuccess = (newQuiz) => {
        // Force refresh of quiz list
        setRefreshTrigger(prev => prev + 1);
        // Optimistically update the UI
        setQuizzes(prevQuizzes => [newQuiz, ...prevQuizzes]);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this quiz?')) return;

        try {
            const response = await fetch(`${config.API_BASE_URL}/quiz/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Failed to delete quiz');
            
            // Refresh quiz list after successful deletion
            fetchQuizzes();
        } catch (error) {
            console.error('Error:', error);
            setError('Failed to delete quiz');
        }
    };

    // Update useEffect to depend on refreshTrigger
    useEffect(() => {
        fetchQuizzes();
    }, [refreshTrigger]);

    if (loading) return <div className="loading">Loading quizzes...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="home-container">
            <br></br>
            <h1>Quiz Generator</h1>
            <FileUpload onUploadSuccess={handleUploadSuccess} />
            
            <div className="quizzes-section">
                <h2>Available Quizzes</h2>
                {quizzes.length === 0 ? (
                    <p>No quizzes available. Upload a PDF to create one!</p>
                ) : (
                    <ul className="quiz-list">
                        {quizzes.map((quiz) => (
                            <li key={quiz._id} className="quiz-item">
                                <Link to={`/quiz/${quiz._id}`} className="quiz-title">
                                    {quiz.title || `Quiz ${quiz._id}`}
                                </Link>
                                <button
                                    onClick={() => handleDelete(quiz._id)}
                                    className="delete-button"
                                    aria-label="Delete quiz"
                                >
                                    Delete
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default Home;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import config from '../config';

function QuizPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [retryCount, setRetryCount] = useState(0);

    const fetchQuiz = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${config.API_BASE_URL}/quiz/${id}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                credentials: 'omit' // Important for mobile
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setQuiz(data);
            setError(null);
            // Initialize answers object
            const initialAnswers = {};
            data.questions.forEach((_, index) => {
                initialAnswers[index] = '';
            });
            setSelectedAnswers(initialAnswers);
        } catch (error) {
            console.error('Fetch error:', error);
            setError('Failed to load quiz. Please check your connection.');
            
            // Implement retry logic
            if (retryCount < config.MAX_RETRIES) {
                setTimeout(() => {
                    setRetryCount(prev => prev + 1);
                }, 1000 * (retryCount + 1)); // Exponential backoff
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuiz();
    }, [id, retryCount]);

    const handleOptionSelect = (questionIndex, option) => {
        setSelectedAnswers(prev => ({
            ...prev,
            [questionIndex]: option.trim()
        }));
    };

    const handleSubmit = () => {
        // Check if all questions are answered
        const unansweredQuestions = Object.values(selectedAnswers).some(answer => !answer);
        if (unansweredQuestions) {
            alert('Please answer all questions before submitting.');
            return;
        }

        navigate(`/result/${id}`, {
            state: { 
                answers: selectedAnswers,
                totalQuestions: quiz.questions.length
            }
        });
    };

    if (error) return <div className="error">{error}</div>;
    if (loading) return <div className="loading">Loading quiz...</div>;

    return (
        <div className="quiz-container">
            <h1>{quiz.title}</h1>
            {quiz.questions.map((question, index) => (
                <div key={index} className="question-card">
                    <h3>Question {index + 1}</h3>
                    <p className="question-text">{question.question}</p>
                    <div className="options">
                        {question.options.map((option, optIndex) => (
                            <label key={optIndex} className="option-label">
                                <input
                                    type="radio"
                                    name={`question-${index}`}
                                    value={option.trim()}
                                    checked={selectedAnswers[index] === option.trim()}
                                    onChange={() => handleOptionSelect(index, option)}
                                />
                                <span className="option-text">{option}</span>
                            </label>
                        ))}
                    </div>
                </div>
            ))}
            <button 
                onClick={handleSubmit} 
                className="submit-button"
                disabled={Object.values(selectedAnswers).some(answer => !answer)}
            >
                Submit Quiz
            </button>
        </div>
    );
}

export default QuizPage;

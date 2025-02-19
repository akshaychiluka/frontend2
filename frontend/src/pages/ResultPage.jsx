import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link, Navigate } from 'react-router-dom';
import config from '../config';

function ResultPage() {
    const { id } = useParams();
    const location = useLocation();
    const [quizResult, setQuizResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);
    
    // Ensure we have answers from the quiz page
    if (!location.state?.answers) {
        return <Navigate to={`/quiz/${id}`} replace />;
    }

    const userAnswers = location.state.answers;

    useEffect(() => {
        const fetchResults = async () => {
            try {
                setLoading(true);
                const queryString = `answers=${encodeURIComponent(JSON.stringify(userAnswers))}`;
                const response = await fetch(`${config.API_BASE_URL}/quiz/result/${id}?${queryString}`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    credentials: 'omit'
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch results');
                }

                const data = await response.json();
                setQuizResult(data);
                setError(null);
            } catch (error) {
                console.error('Error fetching results:', error);
                setError('Failed to load results. Please check your connection.');
                
                // Implement retry logic
                if (retryCount < config.MAX_RETRIES) {
                    setTimeout(() => {
                        setRetryCount(prev => prev + 1);
                    }, 1000 * (retryCount + 1));
                }
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [id, userAnswers, retryCount]);

    if (loading) return <div className="loading">Loading results...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!quizResult) return <div className="error">No results found</div>;

    return (
        <div className="result-container">
            <h1>Quiz Results</h1>
            
            <div className="result-summary">
                <h2>{quizResult.title}</h2>
                <div className="score-card">
                    <p>Total Questions: {quizResult.totalQuestions}</p>
                    <p>Correct Answers: {quizResult.correctAnswers}</p>
                    <p className={`final-score ${quizResult.score >= 60 ? 'passing' : 'failing'}`}>
                        Your Score: {quizResult.score}%
                    </p>
                </div>
            </div>

            <div className="questions-review">
                {quizResult.questions.map((question, index) => (
                    <div key={index} className={`question-review ${question.isCorrect ? 'correct' : 'incorrect'}`}>
                        <h3>Question {index + 1}</h3>
                        <p className="question-text">{question.question}</p>
                        
                        <div className="options-review">
                            {question.options.map((option, optIndex) => {
                                // Extract first letter of the option
                                const optionLetter = option.trim().charAt(0).toUpperCase();
                                const isUserAnswer = optionLetter === question.userAnswer;
                                const isCorrectAnswer = optionLetter === question.correctAnswer;
                                
                                return (
                                    <div 
                                        key={optIndex} 
                                        className={`option ${isCorrectAnswer ? 'correct' : ''} 
                                                         ${isUserAnswer ? 'user-answer' : ''}`}
                                    >
                                        {option}
                                        {isUserAnswer && isCorrectAnswer && (
                                            <span className="correct-indicator">✓</span>
                                        )}
                                        {isUserAnswer && !isCorrectAnswer && (
                                            <span className="incorrect-indicator">✗</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        
                        <div className={`answer-summary ${question.isCorrect ? 'correct' : 'incorrect'}`}>
                            <p className={`your-answer ${question.isCorrect ? 'correct' : 'incorrect'}`}>
                                Your Answer: {question.userAnswer}
                            </p>
                            <p className="correct-answer">
                                Correct Answer: {question.correctAnswer}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="navigation-buttons">
                <Link to="/" className="button">Back to Home</Link>
                <Link to={`/quiz/${id}`} className="button">Retake Quiz</Link>
            </div>
        </div>
    );
}

export default ResultPage;

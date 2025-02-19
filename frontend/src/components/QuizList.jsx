import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import config from '../config';

function QuizList({ refreshTrigger, newQuiz }) {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchQuizzes = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`${config.API_BASE_URL}/quizzes`);
            const data = await response.json();
            setQuizzes(data);
        } catch (error) {
            console.error('Error fetching quizzes:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchQuizzes();
    }, [fetchQuizzes, refreshTrigger]);

    // Add new quiz to the list immediately when received
    useEffect(() => {
        if (newQuiz) {
            setQuizzes(prevQuizzes => [newQuiz, ...prevQuizzes]);
        }
    }, [newQuiz]);

    if (loading) {
        return <div>Loading quizzes...</div>;
    }

    return (
        <div className="quiz-list">
            <h2>Available Quizzes</h2>
            {quizzes.length === 0 ? (
                <p>No quizzes available yet.</p>
            ) : (
                <ul>
                    {quizzes.map((quiz) => (
                        <li key={quiz._id}>
                            <Link to={`/quiz/${quiz._id}`}>{quiz.title}</Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default QuizList;

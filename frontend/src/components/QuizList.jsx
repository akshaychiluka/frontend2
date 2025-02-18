import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function QuizList() {
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    fetch('/api/quizzes')
      .then((response) => response.json())
      .then((data) => setQuizzes(data))
      .catch((error) => console.error('Error fetching quizzes:', error));
  }, []);

  return (
    <div>
      <h2>Available Quizzes</h2>
      <ul>
        {quizzes.map((quiz) => (
          <li key={quiz._id}>
            <Link to={`/quiz/${quiz._id}`}>{quiz.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default QuizList;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function QuizForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  
  useEffect(() => {
    fetch(`/api/quizzes/${id}`)
      .then((response) => response.json())
      .then((data) => setQuiz(data))
      .catch((error) => console.error('Error fetching quiz:', error));
  }, [id]);

  const handleAnswerChange = (questionId, option) => {
    setAnswers({
      ...answers,
      [questionId]: option,
    });
  };

  const handleSubmit = () => {
    // Simulate a result submission
    console.log('Answers submitted:', answers);
    // Redirect to the result page
    navigate(`/result/${id}`);
  };

  if (!quiz) return <div>Loading...</div>;

  return (
    <div>
      <h2>{quiz.title}</h2>
      <form>
        {quiz.questions.map((question) => (
          <div key={question.id}>
            <h3>{question.question}</h3>
            <ul>
              {question.options.map((option, index) => (
                <li key={index}>
                  <label>
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={option}
                      onChange={() => handleAnswerChange(question.id, option)}
                    />
                    {option}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <button type="button" onClick={handleSubmit}>Submit</button>
      </form>
    </div>
  );
}

export default QuizForm;

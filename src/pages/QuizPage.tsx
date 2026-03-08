import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { saveOfflineResult } from "../lib/offlineSync";
import { CheckCircle, XCircle } from "lucide-react";

type Quiz = {
  id: number;
  lesson_id: number;
  question: string;
  options: string; // JSON string
  correct_answer: string;
};

export default function QuizPage() {
  const { id } = useParams<{ id: string }>();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await fetch(`/api/quizzes/${id}`);
        if (res.ok) {
          const data = await res.json();
          setQuizzes(data);
          localStorage.setItem(`cachedQuizzes_${id}`, JSON.stringify(data));
        }
      } catch (error) {
        const cached = localStorage.getItem(`cachedQuizzes_${id}`);
        if (cached) setQuizzes(JSON.parse(cached));
      }
    };
    fetchQuizzes();
  }, [id]);

  const handleSubmit = async () => {
    if (!selectedOption || !user) return;

    const current = quizzes[currentQuiz];
    const isCorrect = selectedOption === current.correct_answer;
    if (isCorrect) setScore((s) => s + 1);

    const result = {
      student_id: user.id,
      quiz_id: current.id,
      is_correct: isCorrect,
      timestamp: new Date().toISOString(),
    };

    try {
      await fetch("/api/quiz-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result),
      });
    } catch (error) {
      console.log("Offline: saving quiz result locally");
      saveOfflineResult(result);
    }

    setIsSubmitted(true);
  };

  const nextQuestion = () => {
    setSelectedOption(null);
    setIsSubmitted(false);
    setCurrentQuiz((c) => c + 1);
  };

  const handleRetake = () => {
    setCurrentQuiz(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setScore(0);
  };

  if (quizzes.length === 0)
    return <div className="p-8 text-center text-gray-500">Loading quiz...</div>;

  if (currentQuiz >= quizzes.length) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl shadow-xl p-10 border border-gray-100">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-6" />
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
            Quiz Completed!
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            You scored {score} out of {quizzes.length}.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <button
              onClick={handleRetake}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Retake Quiz
            </button>
            <button
              onClick={() => navigate("/test-arena")}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back to TestArena
            </button>
            <button
              onClick={() => navigate("/ai-tutor")}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Ask AI Tutor
            </button>
          </div>
        </div>
      </div>
    );
  }

  const quiz = quizzes[currentQuiz];
  const options = JSON.parse(quiz.options);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
        <div className="bg-indigo-600 px-6 py-4">
          <h2 className="text-lg font-medium text-white">
            Question {currentQuiz + 1} of {quizzes.length}
          </h2>
        </div>
        <div className="p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">
            {quiz.question}
          </h3>

          <div className="space-y-4">
            {options.map((option: string, index: number) => {
              const isSelected = selectedOption === option;
              const isCorrect = option === quiz.correct_answer;

              let buttonClass =
                "w-full text-left px-6 py-4 rounded-xl border-2 transition-all duration-200 text-lg font-medium ";

              if (!isSubmitted) {
                buttonClass += isSelected
                  ? "border-indigo-600 bg-indigo-50 text-indigo-900"
                  : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50 text-gray-700";
              } else {
                if (isCorrect) {
                  buttonClass += "border-green-500 bg-green-50 text-green-900";
                } else if (isSelected && !isCorrect) {
                  buttonClass += "border-red-500 bg-red-50 text-red-900";
                } else {
                  buttonClass += "border-gray-200 text-gray-400 opacity-50";
                }
              }

              return (
                <button
                  key={index}
                  disabled={isSubmitted}
                  onClick={() => setSelectedOption(option)}
                  className={buttonClass}
                >
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    {isSubmitted && isCorrect && (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    )}
                    {isSubmitted && isSelected && !isCorrect && (
                      <XCircle className="h-6 w-6 text-red-500" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-10 pt-6 border-t border-gray-200 flex justify-end">
            {!isSubmitted ? (
              <button
                onClick={handleSubmit}
                disabled={!selectedOption}
                className="inline-flex items-center px-8 py-3 border border-transparent text-lg font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                className="inline-flex items-center px-8 py-3 border border-transparent text-lg font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {currentQuiz === quizzes.length - 1
                  ? "Finish Quiz"
                  : "Next Question"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, PlayCircle } from "lucide-react";

type Lesson = {
  id: number;
  title: string;
  content: string;
  video_url: string;
  topic: string;
};

export default function LessonViewer() {
  const { id } = useParams<{ id: string }>();
  const [lesson, setLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const res = await fetch("/api/lessons");
        if (res.ok) {
          const data = await res.json();
          const found = data.find((l: Lesson) => l.id === Number(id));
          setLesson(found || null);
        }
      } catch (error) {
        const cached = localStorage.getItem("cachedLessons");
        if (cached) {
          const data = JSON.parse(cached);
          const found = data.find((l: Lesson) => l.id === Number(id));
          setLesson(found || null);
        }
      }
    };
    fetchLesson();
  }, [id]);

  if (!lesson)
    return (
      <div className="p-8 text-center text-gray-500">Lesson not found.</div>
    );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        to="/lessons"
        className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500 mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to VideoLearner
      </Link>

      <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
        {lesson.video_url && (
          <div className="aspect-w-16 aspect-h-9 bg-gray-900 flex items-center justify-center relative">
            {/* In a real app, we'd embed the video or serve it locally */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
              <PlayCircle className="h-16 w-16 mb-4 opacity-80" />
              <p className="text-lg font-medium">Video Player Placeholder</p>
              <p className="text-sm opacity-75 mt-2">{lesson.video_url}</p>
              <p className="text-xs text-yellow-300 mt-4 bg-black/50 px-3 py-1 rounded-full">
                (Offline video caching would be implemented here)
              </p>
            </div>
          </div>
        )}

        <div className="p-8">
          <div className="flex items-center mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
              {lesson.topic}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-6">
            {lesson.title}
          </h1>
          <div className="prose prose-indigo max-w-none text-gray-700 text-lg leading-relaxed mb-8">
            {lesson.content}
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <PlayCircle className="w-5 h-5 text-red-600" />
              More on YouTube
            </h3>
            <p className="text-sm text-gray-600 mb-4">Want to dive deeper into <strong>{lesson.topic}</strong>? Explore closely related topics on YouTube:</p>
            <div className="flex flex-wrap gap-3">
              <a
                href={`https://www.youtube.com/results?search_query=Basic+${encodeURIComponent(lesson.topic)}+Tutorial`}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors"
              >
                {lesson.topic} Basics
              </a>
              <a
                href={`https://www.youtube.com/results?search_query=Advanced+${encodeURIComponent(lesson.topic)}+Concepts`}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors"
              >
                Advanced {lesson.topic}
              </a>
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(lesson.topic)}+Crash+Course`}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors"
              >
                Crash Course
              </a>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-gray-200 flex justify-end">
            <Link
              to={`/quiz/${lesson.id}`}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Take Quiz
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

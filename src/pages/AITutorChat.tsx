import { useState, useRef, useEffect } from "react";
import { Mic, Send, Bot, User, Loader2 } from "lucide-react";

type Message = {
  role: "user" | "ai";
  content: string;
};

export default function AITutorChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      content:
        "Hello! I'm your CampusLink AI Tutor. What would you like to learn about today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMsg }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, { role: "ai", content: data.answer }]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            content:
              "Sorry, I'm having trouble connecting to my brain right now. Please try again later.",
          },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content:
            "It seems you are offline. I need an internet connection to answer questions.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleListen = () => {
    if (isListening) {
      setIsListening(false);
      // Stop recognition logic would go here
      return;
    }

    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      alert("Your browser doesn't support speech recognition.");
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-4rem)] flex flex-col">
      <div className="bg-white shadow-xl rounded-2xl flex-1 flex flex-col overflow-hidden border border-gray-100">
        <div className="bg-indigo-600 px-6 py-4 flex items-center gap-3">
          <Bot className="h-8 w-8 text-white" />
          <div>
            <h2 className="text-lg font-bold text-white">
              AI Learning Assistant
            </h2>
            <p className="text-indigo-200 text-sm">
              Ask me anything about your lessons
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex max-w-[80%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"} items-end gap-2`}
              >
                <div
                  className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${msg.role === "user" ? "bg-indigo-100" : "bg-indigo-600"}`}
                >
                  {msg.role === "user" ? (
                    <User className="h-5 w-5 text-indigo-600" />
                  ) : (
                    <Bot className="h-5 w-5 text-white" />
                  )}
                </div>
                <div
                  className={`px-5 py-3 rounded-2xl ${msg.role === "user" ? "bg-indigo-600 text-white rounded-br-none" : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-none"}`}
                >
                  <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex max-w-[80%] flex-row items-end gap-2">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div className="px-5 py-3 rounded-2xl bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-none flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
                  <span className="text-sm text-gray-500">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white border-t border-gray-200">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleListen}
              className={`p-3 rounded-full flex-shrink-0 transition-colors ${isListening ? "bg-red-100 text-red-600 animate-pulse" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              title="Use voice input"
            >
              <Mic className="h-6 w-6" />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your question here..."
              className="flex-1 block w-full rounded-full border-gray-300 bg-gray-100 px-6 py-3 focus:border-indigo-500 focus:bg-white focus:ring-indigo-500 sm:text-sm transition-colors"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="p-3 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 transition-colors"
            >
              <Send className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

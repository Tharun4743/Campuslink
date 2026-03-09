export async function askTutor(question: string): Promise<string> {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer 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`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a helpful and encouraging AI tutor for rural school students. Explain concepts simply and clearly. Keep answers concise."
          },
          { role: "user", content: question }
        ]
      })
    });
    const data = await response.json();
    return data.choices?.[0]?.message?.content || "I'm sorry, I couldn't generate an answer.";
  } catch (err) {
    console.error(err);
    return "I'm sorry, I couldn't generate an answer at this time.";
  }
}

export async function getRecommendations(
  studentPerformance: any,
): Promise<string> {
  try {
    const prompt = `Based on the following student performance data, suggest 2 topics they should review and generate 1 practice question for their weakest topic.
    Performance Data: ${JSON.stringify(studentPerformance)}`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": ``,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are an AI recommendation engine for education. Provide a brief analysis, recommended topics, and one practice question."
          },
          { role: "user", content: prompt }
        ]
      })
    });
    const data = await response.json();
    return data.choices?.[0]?.message?.content || "No recommendations available.";
  } catch (err) {
    console.error(err);
    return "No recommendations available.";
  }
}

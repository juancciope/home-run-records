import OpenAI from 'openai';
import { QuizAnswers } from './types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateStrategyPlan = async (quizAnswers: QuizAnswers): Promise<string> => {
  try {
    const formattedAnswers = formatQuizForAI(quizAnswers);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `You are a career strategist and design thinking coach for music artists. You help artists develop their brand, create actionable plans, and grow their music careers. Your responses should be comprehensive, actionable, and encouraging.`
        },
        {
          role: "user",
          content: `Based on the following quiz answers from a music artist, generate a personalized artist development plan. The plan should include:

1. **Artist Brand Summary** - A clear definition of their unique brand identity
2. **Strategic Recommendations** - 5-7 specific, actionable strategies
3. **Project Roadmap** - Timeline for their next 6-12 months
4. **Audience Development** - Specific tactics for growing their fanbase
5. **Next Steps** - Immediate actions they can take this week

Quiz Responses:
${formattedAnswers}

Please format the response in clear sections with headers and bullet points for easy reading. Be specific and actionable in your recommendations.`
        }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || "Unable to generate strategy plan at this time.";
  } catch (error) {
    console.error('Error generating strategy plan:', error);
    throw new Error('Failed to generate strategy plan');
  }
};

function formatQuizForAI(answers: QuizAnswers): string {
  const sections = [
    {
      title: "Artist Identity",
      questions: [
        { key: "artist_name", label: "Artist Name" },
        { key: "real_name", label: "Real Name" },
        { key: "genre", label: "Genre(s)" },
        { key: "experience_level", label: "Experience Level" },
        { key: "unique_sound", label: "Unique Sound Description" }
      ]
    },
    {
      title: "Target Audience",
      questions: [
        { key: "target_age", label: "Target Age Group" },
        { key: "target_demographics", label: "Target Demographics" },
        { key: "current_fanbase", label: "Current Fanbase Size" },
        { key: "fan_connection", label: "Fan Connection Methods" },
        { key: "audience_goals", label: "Audience Growth Goals" }
      ]
    },
    {
      title: "Career Vision",
      questions: [
        { key: "career_goals", label: "Career Goals (Next 2-3 Years)" },
        { key: "success_definition", label: "Personal Definition of Success" },
        { key: "biggest_challenge", label: "Biggest Current Challenge" },
        { key: "resources_available", label: "Available Resources" },
        { key: "inspiration", label: "Musical Inspirations" }
      ]
    },
    {
      title: "Current Projects",
      questions: [
        { key: "current_projects", label: "Current Projects" },
        { key: "release_timeline", label: "Release Timeline" },
        { key: "production_stage", label: "Production Stage" },
        { key: "collaboration_interest", label: "Collaboration Interest" },
        { key: "project_description", label: "Project Description" }
      ]
    }
  ];

  let formatted = "";
  
  sections.forEach(section => {
    formatted += `\n**${section.title}:**\n`;
    section.questions.forEach(question => {
      const answer = answers[question.key];
      if (answer) {
        const formattedAnswer = Array.isArray(answer) ? answer.join(", ") : answer;
        formatted += `- ${question.label}: ${formattedAnswer}\n`;
      }
    });
  });

  return formatted;
}
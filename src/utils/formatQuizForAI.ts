import { QuizAnswers } from '@/lib/types';

export function formatQuizForAI(answers: QuizAnswers): string {
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

  let formatted = "Artist Quiz Responses:\n";
  formatted += "=" + "=".repeat(30) + "\n\n";
  
  sections.forEach(section => {
    formatted += `**${section.title}:**\n`;
    formatted += "-".repeat(section.title.length + 4) + "\n";
    
    section.questions.forEach(question => {
      const answer = answers[question.key];
      if (answer !== undefined && answer !== null && answer !== '') {
        let formattedAnswer: string;
        
        if (Array.isArray(answer)) {
          formattedAnswer = answer.length > 0 ? answer.join(", ") : "Not specified";
        } else {
          formattedAnswer = String(answer);
        }
        
        formatted += `• ${question.label}: ${formattedAnswer}\n`;
      }
    });
    formatted += "\n";
  });

  return formatted;
}

export function validateQuizAnswers(answers: QuizAnswers): { isValid: boolean; missingFields: string[] } {
  const requiredFields = [
    'artist_name',
    'real_name', 
    'genre',
    'experience_level',
    'unique_sound',
    'target_age',
    'target_demographics',
    'current_fanbase',
    'fan_connection',
    'audience_goals',
    'career_goals',
    'success_definition',
    'biggest_challenge',
    'resources_available',
    'inspiration',
    'current_projects',
    'release_timeline',
    'production_stage',
    'collaboration_interest',
    'project_description'
  ];

  const missingFields = requiredFields.filter(field => {
    const value = answers[field];
    return value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);
  });

  return {
    isValid: missingFields.length === 0,
    missingFields
  };
}

export function getQuizProgress(answers: QuizAnswers): { completed: number; total: number; percentage: number } {
  const requiredFields = [
    'artist_name', 'real_name', 'genre', 'experience_level', 'unique_sound',
    'target_age', 'target_demographics', 'current_fanbase', 'fan_connection', 'audience_goals',
    'career_goals', 'success_definition', 'biggest_challenge', 'resources_available', 'inspiration',
    'current_projects', 'release_timeline', 'production_stage', 'collaboration_interest', 'project_description'
  ];

  const completed = requiredFields.filter(field => {
    const value = answers[field];
    return value !== undefined && value !== null && value !== '' && !(Array.isArray(value) && value.length === 0);
  }).length;

  const total = requiredFields.length;
  const percentage = Math.round((completed / total) * 100);

  return { completed, total, percentage };
}
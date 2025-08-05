export interface QuizQuestion {
  id: string;
  question: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'radio';
  options?: string[];
  required: boolean;
  placeholder?: string;
}

export interface QuizSection {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
}

export const audienceQuestions: QuizQuestion[] = [
  {
    id: 'music_vibe',
    question: 'How would you describe the vibe of your music?',
    type: 'radio',
    options: [
      'High energy and upbeat',
      'Chill and relaxing',
      'Emotional and deep',
      'Party and fun',
      'Thoughtful and introspective',
      'Raw and authentic'
    ],
    required: true
  },
  {
    id: 'listener_moment',
    question: 'When would someone most likely listen to your music?',
    type: 'radio',
    options: [
      'While working out or running',
      'During study or work sessions',
      'Relaxing at home after a long day',
      'Driving or commuting',
      'At parties or social events',
      'During emotional or reflective moments'
    ],
    required: true
  },
  {
    id: 'age_group',
    question: 'What age group connects most with your music?',
    type: 'radio',
    options: [
      'Teens (13-17)',
      'Young adults (18-25)', 
      'Millennials (26-35)',
      'Gen X and older (35+)',
      'All ages'
    ],
    required: true
  },
  {
    id: 'lifestyle',
    question: 'What lifestyle best describes your ideal listener?',
    type: 'radio',
    options: [
      'Students and young professionals',
      'Creative professionals and artists',
      'Parents and family-oriented people',
      'Party-goers and social butterflies',
      'Introverts and deep thinkers',
      'Fitness enthusiasts and active people'
    ],
    required: true
  },
  {
    id: 'discovery_platform',
    question: 'Where would your audience most likely discover you?',
    type: 'radio',
    options: [
      'TikTok and Instagram',
      'Spotify playlists',
      'YouTube',
      'Live performances and local venues',
      'Word of mouth and friends',
      'Radio and mainstream media'
    ],
    required: true
  },
  {
    id: 'emotional_connection',
    question: 'What emotional need does your music fulfill for listeners?',
    type: 'radio',
    options: [
      'Energy and motivation',
      'Comfort and relaxation',
      'Connection and understanding',
      'Escape and fun',
      'Inspiration and hope',
      'Authenticity and realness'
    ],
    required: true
  }
];

// Keep the old structure for backward compatibility but mark as deprecated
export const quizSections: QuizSection[] = [];

export const getTotalQuestions = (): number => {
  return quizSections.reduce((total, section) => total + section.questions.length, 0);
};

export const getQuestionById = (questionId: string): QuizQuestion | null => {
  for (const section of quizSections) {
    const question = section.questions.find(q => q.id === questionId);
    if (question) return question;
  }
  return null;
};
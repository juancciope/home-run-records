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

export const quizSections: QuizSection[] = [
  {
    id: 'identity',
    title: 'Artist Identity',
    description: 'Help us understand who you are as an artist',
    questions: [
      {
        id: 'artist_name',
        question: 'What is your artist name or stage name?',
        type: 'text',
        required: true,
        placeholder: 'e.g., Luna Martinez, The Midnight Collective'
      },
      {
        id: 'real_name',
        question: 'What is your real name?',
        type: 'text',
        required: true,
        placeholder: 'First and Last Name'
      },
      {
        id: 'genre',
        question: 'What genre(s) best describe your music?',
        type: 'multiselect',
        options: [
          'Pop',
          'Hip Hop',
          'R&B',
          'Rock',
          'Electronic',
          'Folk',
          'Country',
          'Jazz',
          'Classical',
          'Reggae',
          'Latin',
          'Indie',
          'Alternative',
          'Other'
        ],
        required: true
      },
      {
        id: 'experience_level',
        question: 'How would you describe your experience level?',
        type: 'radio',
        options: [
          'Just starting out (0-1 years)',
          'Developing (1-3 years)',
          'Experienced (3-5 years)',
          'Professional (5+ years)',
          'Industry veteran (10+ years)'
        ],
        required: true
      },
      {
        id: 'unique_sound',
        question: 'What makes your sound unique? Describe your musical style in a few sentences.',
        type: 'textarea',
        required: true,
        placeholder: 'Describe what sets you apart from other artists...'
      }
    ]
  },
  {
    id: 'audience',
    title: 'Target Audience',
    description: 'Let\'s identify who your music resonates with',
    questions: [
      {
        id: 'target_age',
        question: 'What age group do you primarily create music for?',
        type: 'select',
        options: [
          'Under 18',
          '18-24',
          '25-34',
          '35-44',
          '45-54',
          '55+',
          'All ages'
        ],
        required: true
      },
      {
        id: 'target_demographics',
        question: 'Who is your ideal listener? (Select all that apply)',
        type: 'multiselect',
        options: [
          'College students',
          'Young professionals',
          'Parents',
          'Music enthusiasts',
          'Party-goers',
          'Gym/workout community',
          'Alternative music fans',
          'Mainstream music fans',
          'Local community',
          'International audience'
        ],
        required: true
      },
      {
        id: 'current_fanbase',
        question: 'How would you describe your current fanbase size?',
        type: 'radio',
        options: [
          'Just family and friends (0-50)',
          'Small local following (50-500)',
          'Growing regional presence (500-5,000)',
          'Established fanbase (5,000-50,000)',
          'Large following (50,000+)'
        ],
        required: true
      },
      {
        id: 'fan_connection',
        question: 'How do you currently connect with your fans?',
        type: 'multiselect',
        options: [
          'Social media (Instagram, TikTok, Twitter)',
          'Live performances',
          'Streaming platforms',
          'YouTube',
          'Email newsletter',
          'Fan meet-ups',
          'Discord/community groups',
          'Through friends/word of mouth',
          'Not actively connecting yet'
        ],
        required: true
      },
      {
        id: 'audience_goals',
        question: 'What are your goals for growing your audience?',
        type: 'textarea',
        required: true,
        placeholder: 'Describe what you want to achieve with your fanbase...'
      }
    ]
  },
  {
    id: 'vision',
    title: 'Career Vision',
    description: 'Share your dreams and aspirations',
    questions: [
      {
        id: 'career_goals',
        question: 'What are your main career goals for the next 2-3 years?',
        type: 'multiselect',
        options: [
          'Release my first album/EP',
          'Build a sustainable income from music',
          'Tour nationally/internationally',
          'Get signed to a record label',
          'Collaborate with established artists',
          'Build a strong online presence',
          'Perform at major festivals',
          'Start my own record label',
          'Become a full-time musician',
          'Win music awards/recognition'
        ],
        required: true
      },
      {
        id: 'success_definition',
        question: 'How do you personally define success as an artist?',
        type: 'textarea',
        required: true,
        placeholder: 'What would make you feel successful in your music career?'
      },
      {
        id: 'biggest_challenge',
        question: 'What is your biggest challenge right now?',
        type: 'select',
        options: [
          'Creating quality music/production',
          'Building an audience',
          'Marketing and promotion',
          'Finding collaborators',
          'Financial resources',
          'Time management',
          'Industry connections',
          'Technical skills',
          'Performance anxiety/confidence',
          'Balancing music with other responsibilities'
        ],
        required: true
      },
      {
        id: 'resources_available',
        question: 'What resources do you currently have access to?',
        type: 'multiselect',
        options: [
          'Home recording setup',
          'Professional studio access',
          'Musical instruments',
          'Music production software',
          'Social media presence',
          'Live performance venues',
          'Industry contacts',
          'Marketing budget',
          'Team members (manager, producer, etc.)',
          'Musical collaborators'
        ],
        required: true
      },
      {
        id: 'inspiration',
        question: 'Who are your biggest musical inspirations and why?',
        type: 'textarea',
        required: true,
        placeholder: 'List artists who inspire you and what you admire about them...'
      }
    ]
  },
  {
    id: 'projects',
    title: 'Current Projects',
    description: 'Tell us about your current and upcoming projects',
    questions: [
      {
        id: 'current_projects',
        question: 'What music projects are you currently working on?',
        type: 'multiselect',
        options: [
          'Single release',
          'EP (3-6 songs)',
          'Full album',
          'Music videos',
          'Live performance preparation',
          'Collaborations',
          'Remix projects',
          'Songwriting sessions',
          'Nothing currently',
          'Other'
        ],
        required: true
      },
      {
        id: 'release_timeline',
        question: 'When do you plan to release your next project?',
        type: 'radio',
        options: [
          'Within the next month',
          '1-3 months',
          '3-6 months',
          '6-12 months',
          'More than a year',
          'No specific timeline yet'
        ],
        required: true
      },
      {
        id: 'production_stage',
        question: 'What stage is your current music in?',
        type: 'radio',
        options: [
          'Writing/songwriting phase',
          'Recording in progress',
          'Mixing and mastering',
          'Ready for release',
          'Released and promoting',
          'Planning next project'
        ],
        required: true
      },
      {
        id: 'collaboration_interest',
        question: 'Are you interested in collaborating with other artists?',
        type: 'radio',
        options: [
          'Very interested - actively seeking',
          'Open to opportunities',
          'Maybe, with the right person',
          'Prefer to work solo',
          'Not interested currently'
        ],
        required: true
      },
      {
        id: 'project_description',
        question: 'Describe your current or next project in detail. What\'s the concept, mood, or story behind it?',
        type: 'textarea',
        required: true,
        placeholder: 'Tell us about your creative vision for this project...'
      }
    ]
  }
];

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
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
    id: 'discover',
    title: 'Discover Yourself',
    description: 'Let\'s start by understanding what drives you as an artist',
    questions: [
      {
        id: 'artist_name',
        question: 'What do you want people to call you as an artist?',
        type: 'text',
        required: true,
        placeholder: 'Your artist name or stage name'
      },
      {
        id: 'why_music',
        question: 'Why do you make music?',
        type: 'radio',
        options: [
          'It\'s my passion and creative outlet',
          'I want to connect with people emotionally',
          'I have stories and messages to share',
          'I want to build a career in music',
          'It helps me process my experiences',
          'I love performing and entertaining'
        ],
        required: true
      },
      {
        id: 'music_feeling',
        question: 'How do you want people to feel when they hear your music?',
        type: 'multiselect',
        options: [
          'Happy and energized',
          'Calm and peaceful',
          'Inspired and motivated',
          'Understood and connected',
          'Nostalgic and reflective',
          'Confident and empowered',
          'Free and liberated',
          'Comforted and supported'
        ],
        required: true
      },
      {
        id: 'sound_description',
        question: 'If you had to describe your sound in everyday words, what would you say?',
        type: 'textarea',
        required: true,
        placeholder: 'e.g., "Dreamy pop with a touch of nostalgia" or "Raw emotions over simple beats"'
      }
    ]
  },
  {
    id: 'audience',
    title: 'Find Your People',
    description: 'Who are the people that would love your music?',
    questions: [
      {
        id: 'ideal_listener',
        question: 'Imagine your perfect listener. What are they doing when they discover your music?',
        type: 'radio',
        options: [
          'Working out or running',
          'Studying or working',
          'Relaxing at home',
          'Driving or commuting',
          'At a party or social gathering',
          'Going through a tough time',
          'Celebrating something special',
          'Just exploring new music'
        ],
        required: true
      },
      {
        id: 'listener_age',
        question: 'What age group do you think connects most with your vibe?',
        type: 'radio',
        options: [
          'Teens (13-17)',
          'Young adults (18-25)',
          'Millennials (26-35)',
          'Gen X (36-50)',
          'Everyone - age doesn\'t matter'
        ],
        required: true
      },
      {
        id: 'current_reach',
        question: 'Who listens to your music right now?',
        type: 'radio',
        options: [
          'Mostly family and close friends',
          'Friends and some of their friends',
          'People in my local community',
          'A growing group of fans online',
          'I haven\'t shared my music much yet'
        ],
        required: true
      },
      {
        id: 'dream_audience',
        question: 'In your wildest dreams, where would you want your music to be heard?',
        type: 'multiselect',
        options: [
          'Coffee shops and chill spaces',
          'Major music festivals',
          'Movie soundtracks',
          'Radio stations',
          'Viral on social media',
          'Concert halls and venues',
          'Streaming playlists',
          'People\'s personal moments'
        ],
        required: true
      }
    ]
  },
  {
    id: 'journey',
    title: 'Your Journey',
    description: 'Where are you now and where do you want to go?',
    questions: [
      {
        id: 'current_stage',
        question: 'Where are you in your music journey right now?',
        type: 'radio',
        options: [
          'Just starting - writing my first songs',
          'Learning and experimenting with my sound',
          'Have some songs, figuring out next steps',
          'Ready to share but not sure how',
          'Sharing music but want to grow',
          'Building momentum and looking to level up'
        ],
        required: true
      },
      {
        id: 'biggest_dream',
        question: 'What\'s your biggest dream as an artist?',
        type: 'radio',
        options: [
          'To make music my full-time career',
          'To touch people\'s lives with my music',
          'To perform at major venues and festivals',
          'To collaborate with artists I admire',
          'To build a community around my music',
          'To create something timeless and meaningful'
        ],
        required: true
      },
      {
        id: 'main_challenge',
        question: 'What feels like the biggest obstacle right now?',
        type: 'radio',
        options: [
          'I don\'t know how to get my music heard',
          'I need better recording/production quality',
          'I\'m not confident about my music yet',
          'I don\'t have time or resources',
          'I don\'t know the business side of music',
          'I feel overwhelmed by everything'
        ],
        required: true
      },
      {
        id: 'success_vision',
        question: 'What would make you feel truly successful as an artist?',
        type: 'textarea',
        required: true,
        placeholder: 'Paint a picture of what success looks like for you...'
      }
    ]
  },
  {
    id: 'action',
    title: 'Take Action',
    description: 'Let\'s talk about your next steps',
    questions: [
      {
        id: 'ready_to_do',
        question: 'What are you most excited to work on right now?',
        type: 'multiselect',
        options: [
          'Writing and creating new music',
          'Improving my recording setup',
          'Learning about music marketing',
          'Building my social media presence',
          'Connecting with other musicians',
          'Planning my first release',
          'Performing live',
          'Finding my unique sound'
        ],
        required: true
      },
      {
        id: 'timeline_comfort',
        question: 'How do you like to work on your goals?',
        type: 'radio',
        options: [
          'I like quick wins and fast progress',
          'I prefer steady, consistent steps',
          'I work in bursts when inspired',
          'I need structure and deadlines',
          'I go with the flow and see what happens'
        ],
        required: true
      },
      {
        id: 'support_need',
        question: 'What kind of support would help you most right now?',
        type: 'multiselect',
        options: [
          'A clear roadmap and action plan',
          'Technical skills and tutorials',
          'Connections with other artists',
          'Feedback on my music',
          'Help with promotion and marketing',
          'Industry knowledge and insights',
          'Motivation and encouragement',
          'Tools and resources'
        ],
        required: true
      },
      {
        id: 'vision_statement',
        question: 'Finish this sentence: "In one year, I want my music to..."',
        type: 'textarea',
        required: true,
        placeholder: 'e.g., "be helping people through difficult times" or "be playing in coffee shops across my city"'
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
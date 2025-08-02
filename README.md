# 🎧 Home Run Records: Artist Intelligence System

**AI-powered career strategies for music artists**

Transform your music career with our comprehensive artist assessment quiz and AI-generated strategy plans. Discover your unique brand, understand your audience, and get actionable recommendations to grow your fanbase.

## ✨ Features

- **🎯 Brand Discovery Quiz**: 20-question assessment covering Identity, Audience, Vision, and Projects
- **🤖 AI Strategy Generation**: Personalized career plans powered by OpenAI GPT-4
- **📊 Artist Dashboard**: Track music production, reach, and fan engagement metrics
- **👥 Admin Interface**: Manage artist accounts and view comprehensive analytics
- **🔐 Secure Authentication**: Supabase-powered user management with role-based access

## 🚀 Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **AI**: OpenAI GPT-4 API
- **Deployment**: Vercel
- **Icons**: Lucide React

## 📱 User Flow

1. **Landing Page** → Compelling value proposition and clear CTA
2. **Quiz Assessment** → Multi-step form with progress tracking
3. **Account Creation** → Secure signup with quiz validation
4. **AI Strategy Plan** → Personalized career roadmap generation
5. **Dashboard** → Progress tracking and metrics overview

## 🛠️ Setup

### Prerequisites

- Node.js 18+
- Supabase account
- OpenAI API key

### Environment Variables

Create `.env.local`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Admin Configuration
ADMIN_EMAIL=admin@homerunrecords.com
ADMIN_PASSWORD=secure_admin_password_123
```

### Installation

```bash
# Clone repository
git clone https://github.com/juancciope/home-run-records.git
cd home-run-records

# Install dependencies
npm install

# Set up Supabase database
# Run the SQL schema from supabase/schema.sql in your Supabase project

# Start development server
npm run dev
```

## 📊 Database Schema

Complete Supabase setup with:
- **Users table** with role-based access (artist/admin)
- **Quiz answers** stored as JSONB
- **Strategy plans** from AI generation
- **Row Level Security (RLS)** policies for data protection

## 🎨 Design Features

- **Gradient backgrounds** with glassmorphism effects
- **Responsive design** for all device sizes
- **Progress indicators** for quiz completion
- **Form validation** with real-time feedback
- **Modern UI components** with smooth animations

## 🔧 Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## 📄 Project Structure

```
src/
├── app/
│   ├── page.tsx           # Landing page
│   ├── quiz/page.tsx      # Multi-step quiz
│   ├── signup/page.tsx    # Account creation
│   ├── plan/page.tsx      # AI strategy display
│   ├── dashboard/page.tsx # Artist metrics
│   └── admin/page.tsx     # Admin interface
├── lib/
│   ├── quizQuestions.ts   # Static quiz data
│   ├── supabaseClient.ts  # Database client
│   ├── openai.ts          # AI integration
│   └── types.ts           # TypeScript definitions
├── components/
└── utils/
```

## 🚀 Deployment

Deploy to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/juancciope/home-run-records)

## 📋 Roadmap

- [ ] Complete dashboard implementation
- [ ] Add admin analytics views
- [ ] Implement email notifications
- [ ] Add social media integrations
- [ ] Create mobile app version

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

---

**Built with ❤️ for the music community**
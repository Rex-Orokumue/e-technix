export type TrackId =
  | 'data-analytics'
  | 'web-development'
  | 'mobile-apps'
  | 'ai-systems'
  | 'ui-ux-design'
  | 'business-development';

export type CertId =
  | 'Certified Data Analyst'
  | 'Certified Web Developer'
  | 'Certified Mobile App Developer'
  | 'Certified AI Systems Builder'
  | 'Certified UX/UI Designer'
  | 'Certified Business Development Specialist';

export interface Track {
  id: TrackId;
  icon: string;
  name: string;
  description: string;
  tools: string[];
  accent: 'cyan' | 'orange';
  cert: CertId;
}

export const tracks: Track[] = [
  {
    id: 'data-analytics',
    icon: '📊',
    name: 'Data Analytics',
    description:
      'Turn raw data into business decisions. Learn to clean, analyse, and visualise data that tells a story.',
    tools: ['Excel', 'SQL', 'Python', 'Power BI', 'Tableau'],
    accent: 'cyan',
    cert: 'Certified Data Analyst',
  },
  {
    id: 'web-development',
    icon: '🌐',
    name: 'Web App Development',
    description:
      'Build full-stack web applications from scratch — SaaS tools, marketplaces, and portfolios that work.',
    tools: ['React', 'Next.js', 'Node.js', 'PostgreSQL'],
    accent: 'orange',
    cert: 'Certified Web Developer',
  },
  {
    id: 'mobile-apps',
    icon: '📱',
    name: 'Mobile & Desktop Apps',
    description:
      'Create cross-platform apps for Android, iOS, and Windows. Build the next fintech or marketplace app.',
    tools: ['Flutter', 'Dart', 'Firebase', 'Supabase'],
    accent: 'cyan',
    cert: 'Certified Mobile App Developer',
  },
  {
    id: 'ai-systems',
    icon: '🤖',
    name: 'AI & Agentic Systems',
    description:
      'The most future-proof track. Build AI assistants, automation workflows, and intelligent business tools.',
    tools: ['Python', 'LangChain', 'CrewAI', 'AutoGPT'],
    accent: 'orange',
    cert: 'Certified AI Systems Builder',
  },
  {
    id: 'ui-ux-design',
    icon: '🎨',
    name: 'Product Design (UI/UX)',
    description:
      'Design products people love. Master wireframing, design systems, and product thinking with industry tools.',
    tools: ['Figma', 'Adobe XD', 'UX Research'],
    accent: 'cyan',
    cert: 'Certified UX/UI Designer',
  },
  {
    id: 'business-development',
    icon: '📈',
    name: 'Business Development',
    description:
      'Learn to build, grow, and scale businesses. From sales systems to startup strategy and customer acquisition.',
    tools: ['CRM Tools', 'Funnels', 'Growth Strategy'],
    accent: 'orange',
    cert: 'Certified Business Development Specialist',
  },
];

export const foundationCourses = [
  {
    icon: '💻',
    title: 'Digital Literacy',
    desc: 'Notion, Google Workspace, internet research',
  },
  {
    icon: '🧠',
    title: 'Problem Solving',
    desc: 'Critical thinking, structured decision-making',
  },
  {
    icon: '🏢',
    title: 'Business Fundamentals',
    desc: 'Models, customer discovery, monetisation',
  },
  {
    icon: '🗣️',
    title: 'Communication',
    desc: 'Presentations, writing, professional pitch',
  },
  {
    icon: '⚡',
    title: 'AI Productivity',
    desc: 'ChatGPT, prompt engineering, AI research',
  },
];

export const stats = [
  { num: '6+', label: 'Specialisation Tracks' },
  { num: '9',  label: 'Month Programme' },
  { num: '5+', label: 'Real Project Labs' },
  { num: '3',  label: 'Career Paths' },
  { num: 'UK+NG', label: 'Backed Programme' },
];

export const steps = [
  {
    num: '01',
    title: 'Digital Foundations',
    desc: 'Month 1–2. Everyone starts here. Master tools, business thinking, communication, and AI productivity before picking a track.',
  },
  {
    num: '02',
    title: 'Pick Your Track',
    desc: 'Month 3–5. Choose from 6 specialisation tracks — Data, Web, Mobile, AI, Design, or Business. Go deep in what matters to you.',
  },
  {
    num: '03',
    title: 'Build Real Projects',
    desc: 'Month 6–8. Work in teams like a startup. Build real products — fintech apps, SaaS dashboards, AI bots, and more.',
  },
  {
    num: '04',
    title: 'Launch Your Career',
    desc: 'Month 9. Get job-ready, launch your freelance business, or build a startup. We prepare you for all three paths.',
  },
];
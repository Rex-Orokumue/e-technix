// Home-page track showcase data. Names/order mirror the curriculum source of truth
// (src/lib/data/curriculum.ts); this file adds the short marketing copy + tool chips
// the homepage cards use. Keep the two in sync when tracks change.

export type TrackId =
  | 'data-analytics'
  | 'web-development'
  | 'mobile-apps'
  | 'ai-systems'
  | 'product-design'
  | 'digital-entrepreneurship'
  | 'ai-product-management'
  | 'cybersecurity';

export interface Track {
  id: TrackId;
  icon: string;
  name: string;
  description: string;
  tools: string[];
  accent: 'cyan' | 'orange';
  cert: string;
}

export const tracks: Track[] = [
  {
    id: 'data-analytics',
    icon: '📊',
    name: 'Data Analytics',
    description: 'Turn raw data into business decisions. Clean, analyse, and visualise data that tells a story.',
    tools: ['Excel', 'SQL', 'Python', 'Power BI'],
    accent: 'cyan',
    cert: 'Certified Data Analyst',
  },
  {
    id: 'web-development',
    icon: '🌐',
    name: 'Web App Development',
    description: 'Build full-stack web applications from scratch — SaaS tools, marketplaces, and products that work.',
    tools: ['React', 'Next.js', 'Supabase'],
    accent: 'orange',
    cert: 'Certified Web Developer',
  },
  {
    id: 'mobile-apps',
    icon: '📱',
    name: 'Mobile & Desktop Apps',
    description: 'Create cross-platform apps for Android, iOS, and Windows from a single Flutter codebase.',
    tools: ['Flutter', 'Dart', 'Supabase'],
    accent: 'cyan',
    cert: 'Certified Mobile App Developer',
  },
  {
    id: 'ai-systems',
    icon: '🤖',
    name: 'AI & Agentic Systems',
    description: 'Build AI-powered products — APIs, RAG, and agents that take real actions — and know when they are wrong.',
    tools: ['Python', 'LLM APIs', 'RAG', 'Agents'],
    accent: 'orange',
    cert: 'Certified AI Systems Builder',
  },
  {
    id: 'product-design',
    icon: '🎨',
    name: 'Product Design',
    description: 'Design products people love. Master user research, wireframing, design systems, and prototyping.',
    tools: ['Figma', 'UX Research', 'Design Systems'],
    accent: 'cyan',
    cert: 'Certified Product Designer',
  },
  {
    id: 'digital-entrepreneurship',
    icon: '📈',
    name: 'Digital Entrepreneurship',
    description: 'Build a real digital business — customer discovery, marketing, sales, and your first paying customers.',
    tools: ['Customer Discovery', 'Marketing', 'Sales'],
    accent: 'orange',
    cert: 'Certified Digital Entrepreneur',
  },
  {
    id: 'ai-product-management',
    icon: '🧭',
    name: 'AI Product Management',
    description: 'Decide what gets built, why, and for whom — with the judgment to lead AI-powered product teams.',
    tools: ['PRDs', 'Prioritisation', 'Metrics'],
    accent: 'cyan',
    cert: 'Certified AI Product Manager',
  },
  {
    id: 'cybersecurity',
    icon: '🛡️',
    name: 'Cybersecurity Fundamentals',
    description: 'Think like an attacker and a defender. Hands-on labs across web, network, and human security.',
    tools: ['Kali Linux', 'Wireshark', 'Burp Suite'],
    accent: 'orange',
    cert: 'Certified Security Analyst',
  },
];

export const foundationCourses = [
  { icon: '💻', title: 'Digital Literacy', desc: 'Notion, Google Workspace, internet research' },
  { icon: '🧠', title: 'Problem Solving', desc: 'Critical thinking, structured decision-making' },
  { icon: '🏢', title: 'Business Fundamentals', desc: 'Models, customer discovery, monetisation' },
  { icon: '🗣️', title: 'Communication', desc: 'Presentations, writing, professional pitch' },
  { icon: '⚡', title: 'AI Productivity', desc: 'ChatGPT, prompt engineering, AI research' },
];

export const stats = [
  { num: '8', label: 'Specialisation Tracks' },
  { num: '9', label: 'Month Programme' },
  { num: '5+', label: 'Real Project Labs' },
  { num: '3', label: 'Career Paths' },
  { num: 'UK×NG', label: 'Backed Programme' },
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
    desc: 'Month 3–5. Score 60% in Phase 1, then choose from eight specialisation tracks — Data, Web, Mobile, AI, Design, Business, Product, or Security. Go deep in what matters to you.',
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

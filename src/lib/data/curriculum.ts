// Single source of truth for the E-Technix curriculum.
// Transcribed from ETechnix_Master_Curriculum_v3.docx. Both the public /curriculum
// page and the downloadable PDF read from here — never duplicate this content.

export type TrackStatus = 'enrolling' | 'coming_soon' | 'advanced';
export type Accent = 'cyan' | 'orange';

export interface Week {
  n: number;
  title: string; // e.g. "Thinking Like a Problem Solver"
  theme: string; // the "— Structured Thinking" subtitle (may be '')
  sessions: string[]; // GATED. Each entry is a session block incl. its bullets.
  deliverable: string; // public
  aiChallenge?: string; // GATED text; presence shown publicly as a badge
  aiAudit?: string; // GATED text; presence shown publicly as a badge
  note?: string; // GATED
}

export interface Track {
  code: string;
  slug: string;
  name: string;
  status: TrackStatus;
  accent: Accent;
  icon: string; // emoji, matches site style
  duration: string; // "8 weeks"
  prerequisite: string;
  hoursPerWeek: string;
  summary: string;
  outcomes: string[];
  careerPaths: string[];
  weeks: Week[];
  /** Advanced tracks are open for enrolment but carry prerequisites + a placement option. */
  isAdvanced?: boolean;
  /** Advanced only: concrete expectations beyond a standard specialisation. */
  whatToExpect?: string[];
}

export interface PublicWeek {
  n: number;
  title: string;
  theme: string;
  deliverable: string;
  hasAiChallenge: boolean;
  hasAiAudit: boolean;
}
export type PublicTrack = Omit<Track, 'weeks'> & { weeks: PublicWeek[] };

/** Strip gated content so it is never serialized to a locked browser. */
export function publicTrack(t: Track): PublicTrack {
  return {
    ...t,
    weeks: t.weeks.map((w) => ({
      n: w.n,
      title: w.title,
      theme: w.theme,
      deliverable: w.deliverable,
      hasAiChallenge: !!w.aiChallenge,
      hasAiAudit: !!w.aiAudit,
    })),
  };
}

export const PROGRAMME = {
  tagline: 'Build the judgment AI cannot replace.',
  subtitle: '10 tracks · Phase 1 + 8 Specialisation Tracks + 2 Advanced Tracks',
  location: 'United Kingdom × Nigeria',
  overview:
    'E-Technix is a structured digital careers programme. Every student begins with Phase 1. After completing Phase 1, you choose one specialisation track. Advanced tracks have additional prerequisites.',
  philosophyQuestion:
    'What is the judgment call AI cannot make here — and how do you make it well?',
  philosophy: [
    {
      title: 'Foundations',
      body: 'Tools, syntax, frameworks — the technical base you need to operate.',
    },
    {
      title: 'Judgment',
      body: 'Catch AI errors, make defensible decisions, know when to trust and when to question.',
    },
    {
      title: 'Communication',
      body: 'Explain what you built, why you built it, and what you would do differently.',
    },
  ],
  aiIntegration: [
    {
      title: 'AI Challenge (Weekly)',
      body: 'Do your work first. Then bring AI in for a specific comparison. Document what changed. AI comes second — always.',
    },
    {
      title: 'AI Audit (Every 2–3 weeks)',
      body: 'Given an AI output, find what it got wrong and why. Group exercise.',
    },
    {
      title: 'AI Assistant (Always On)',
      body: 'Socratic-style assistant that asks questions, never gives answers.',
    },
  ],
  howItWorks: {
    feeNote: 'One fee covers both phases — Phase 1 and your Phase 2 specialisation track.',
    phases: [
      {
        n: 1,
        name: 'Phase 1 — Foundation',
        body: 'Digital & Business Foundations (8 weeks). Compulsory for everyone in the cohort. You build the digital fluency, problem-solving, and AI literacy the rest of the programme is built on.',
      },
      {
        n: 2,
        name: 'Phase 2 — Specialisation',
        body: 'Your chosen specialisation track (12 weeks). You advance to Phase 2 by scoring at least 60% cumulatively across Phase 1 — attendance, assignments, participation, and the capstone project all count.',
      },
    ],
    progressionRule:
      'Advancing to Phase 2 requires a cumulative score of at least 60% in Phase 1 (attendance + assignments + participation + capstone project).',
    advancedEntry:
      'Advanced tracks are open for enrolment now, but you must complete the prerequisite track first. If you already have the experience, you can sit a placement assessment to verify it and enter the advanced track directly — no one skips the prerequisite on an unverified claim.',
  },
} as const;

export const TRACKS: Track[] = [
  // ─────────────────────────────────────────────────────────────────────────
  {
    code: 'DT-101',
    slug: 'phase-1',
    name: 'Phase 1: Digital & Business Foundations',
    status: 'enrolling',
    accent: 'cyan',
    icon: '🚀',
    duration: '8 weeks',
    prerequisite: 'Open to all',
    hoursPerWeek: '6–8 hours',
    summary:
      'The mandatory foundation every E-Technix student completes before specialising. You will leave with digital fluency, business thinking, and AI literacy that every employer and client now expects — regardless of which track you go into.',
    outcomes: [
      'Understand how digital products, platforms, and businesses work',
      'Solve structured problems using frameworks professionals use daily',
      'Navigate and critically evaluate AI tools rather than blindly depend on them',
      'Communicate your ideas clearly in written and presentation formats',
      'Build a personal digital presence ready for your specialisation track',
    ],
    careerPaths: ['Foundation for all specialisation tracks'],
    weeks: [
      {
        n: 1,
        title: 'How the Digital World Works',
        theme: 'Orientation & Mental Models',
        sessions: [
          'SESSION 1: The Digital Stack\n• How websites, apps, and platforms work end-to-end\n• Clients, servers, databases — explained without jargon\n• Why software is never really finished',
          'SESSION 2: Data is the Product\n• What companies actually sell\n• How platforms like Instagram, Google, and Jumia make money\n• Your data as currency',
          'SESSION 3: Workshop: Map a Product You Use\n• Pick any digital product\n• Map: what problem it solves, who built it, how it makes money, what data it collects\n• Present to the group in 3 minutes',
        ],
        deliverable:
          'A one-page digital product map for a Nigerian app or platform you use regularly',
      },
      {
        n: 2,
        title: 'Thinking Like a Problem Solver',
        theme: 'Structured Thinking',
        sessions: [
          'SESSION 1: The 5 Whys\n• Root cause analysis in practice\n• Case study: Why do Nigerian e-commerce returns spike in December?\n• Group drill: apply 5 Whys to a real local business problem',
          'SESSION 2: First Principles Thinking\n• Breaking assumptions apart\n• How Elon Musk, Jeff Bezos, and local founders like Flutterwave think differently\n• First Principles vs. analogy thinking',
          'SESSION 3: Workshop: Diagnose a Failing Business\n• Given a fictional struggling Nigerian business\n• Apply 5 Whys and First Principles\n• Propose one change and defend it',
        ],
        deliverable:
          'A structured problem analysis using 5 Whys + First Principles on a business scenario of your choice',
        aiChallenge:
          'After submitting your analysis, put the same business scenario into ChatGPT. Compare its output to yours. What did it get right? What did it miss? Bring both versions to Week 3.',
      },
      {
        n: 3,
        title: 'The Business Model',
        theme: 'How Businesses Actually Work',
        sessions: [
          'SESSION 1: Revenue, Cost, and Value\n• What makes a business viable\n• Revenue streams vs. profit\n• Why a product with millions of users can lose money',
          'SESSION 2: Business Model Canvas\n• 9 blocks of the BMC\n• Nigerian case studies: Kuda, PiggyVest, Jumia, Paystack\n• Common mistakes founders make when filling a BMC',
          'SESSION 3: Workshop: Present Your AI Challenge Findings + Build Your BMC\n• Group debrief: AI vs. human analysis from Week 2\n• Build a BMC for a business idea or existing company',
        ],
        deliverable:
          'A completed Business Model Canvas with a 5-minute presentation defending your choices',
        aiAudit:
          'Group AI Audit: Instructor provides a ChatGPT-generated business analysis of a Nigerian company. Students identify 3 errors, 2 gaps, and 1 thing it did well.',
      },
      {
        n: 4,
        title: 'Who Is Your Customer?',
        theme: 'Customer Discovery',
        sessions: [
          'SESSION 1: The Empathy Gap\n• Why founders and developers build the wrong thing\n• The difference between what people say and what they do\n• Jobs-to-be-Done framework',
          'SESSION 2: Research Without a Lab\n• How to run a customer interview in 20 minutes\n• Observation, assumption-testing, and pattern recognition\n• WhatsApp as a research tool in Nigeria',
          'SESSION 3: Workshop: Go Talk to Someone\n• Students conduct one real mini-interview with a person outside the class\n• Report back: what surprised you?',
        ],
        deliverable:
          'A customer discovery report: one interview, three insights, one assumption you had that was wrong',
        aiChallenge:
          'After writing your report, ask AI to generate a customer persona for the same type of customer. How close is it to your real interview? Where does it miss?',
        note:
          'This is the one skill AI cannot replace. The ability to sit with a person, notice what they don’t say, and discover what they actually need — that is irreplaceable.',
      },
      {
        n: 5,
        title: 'Digital Tools & Productivity',
        theme: 'Operating in the Digital Workspace',
        sessions: [
          'SESSION 1: The Modern Digital Workspace\n• Notion, Google Workspace, Trello — choosing the right tool\n• File management, version control mindset, naming conventions\n• How remote teams operate across time zones',
          'SESSION 2: Communication That Works\n• Writing professional emails, Slack messages, and reports\n• How to give and receive feedback in writing\n• The cost of unclear communication in tech projects',
          'SESSION 3: Workshop: Build Your Digital Workspace\n• Set up a personal Notion workspace\n• Create a project tracker for your Phase 2 track\n• Write a professional bio and LinkedIn summary draft',
        ],
        deliverable:
          'A working personal Notion workspace with a project tracker, a professional bio, and a LinkedIn summary',
        aiChallenge:
          'Use AI to generate a version of your professional bio. Edit it until it actually sounds like you. Reflect on what you had to change.',
      },
      {
        n: 6,
        title: 'The Internet, Security & Your Digital Footprint',
        theme: 'Digital Safety & Literacy',
        sessions: [
          'SESSION 1: How the Internet Actually Works\n• DNS, HTTP/HTTPS, IP addresses in plain English\n• What happens when you click a link\n• Why this matters for every digital career',
          'SESSION 2: Security Without Being a Security Person\n• Phishing, social engineering, weak passwords\n• How Nigerian businesses get hacked — real examples\n• Practical: password managers, 2FA, safe browsing',
          'SESSION 3: Workshop: Audit Your Digital Footprint\n• Google yourself\n• Check your email breach status (HaveIBeenPwned)\n• Fix three security issues in your own accounts',
        ],
        deliverable:
          'A personal digital security audit report: what you found, what you fixed, what you still need to do',
        aiAudit:
          'AI Audit: Given an AI-generated ‘security guide for Nigerian SMEs’, identify what advice is correct, what is outdated, and what could actually cause harm if followed.',
      },
      {
        n: 7,
        title: 'Data, Information & Critical Thinking',
        theme: 'Thinking in an Age of Misinformation',
        sessions: [
          'SESSION 1: Data vs. Information vs. Insight\n• The difference between a number and a conclusion\n• How to read a chart without being misled\n• Nigerian examples: election data, economic statistics, health claims',
          'SESSION 2: SIFT: A Framework for Information Literacy\n• Stop, Investigate the source, Find better coverage, Trace claims\n• Applying SIFT to WhatsApp forwards, news headlines, and AI output\n• Why this matters in every tech and business role',
          'SESSION 3: Assignment Return: AI vs. Human\n• Two-version assignment: students submit both an AI-generated version and a human version of a short analysis\n• Class discussion: what changed, what improved, what you kept',
        ],
        deliverable:
          'Two-version assignment: same business question answered first without AI, then with AI. Written reflection on what changed.',
        aiChallenge:
          'This week’s AI challenge IS the deliverable. Document your process clearly.',
      },
      {
        n: 8,
        title: 'Thinking With Machines',
        theme: 'Capstone & Portfolio Setup',
        sessions: [
          'SESSION 1: What AI Can and Cannot Do — Honestly\n• Current state of AI tools for your chosen track\n• Where AI accelerates your work\n• Where human judgment is irreplaceable — and why that is a career advantage',
          'SESSION 2: Capstone Prep & Portfolio Thinking\n• How to present work professionally\n• The difference between a project and a portfolio piece\n• Setting up GitHub, Behance, Notion portfolio, or LinkedIn depending on your track',
          'SESSION 3: Capstone Presentation Day\n• Each student presents their Week 1–7 work as a coherent portfolio\n• Peer feedback using structured rubric\n• Introduction to your Phase 2 track',
        ],
        deliverable:
          'Phase 1 Capstone: A portfolio presentation of your best 3 pieces of work from Weeks 1–7. Every AI-assisted section must be labelled, and you must critique the AI contribution.',
        note:
          'Capstone requirement: every piece of AI-assisted work must be clearly labelled. You must also include at least one paragraph critiquing what AI did and what you had to correct.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    code: 'DA-201',
    slug: 'data-analytics',
    name: 'Data Analytics',
    status: 'enrolling',
    accent: 'cyan',
    icon: '📊',
    duration: '12 weeks',
    prerequisite: 'Phase 1 completion',
    hoursPerWeek: '8–10 hours',
    summary:
      'Turn raw data into decisions. You will learn to collect, clean, analyse, and visualise data — then communicate what it means to people who did not see the numbers. This track is built for the Nigerian business context, using real local datasets and tools that actual companies hire for.',
    outcomes: [
      'Query databases using SQL to extract and transform data',
      'Clean and analyse data using Python (pandas) or Excel',
      'Build dashboards and visualisations using Power BI or Google Looker Studio',
      'Write data stories that non-technical stakeholders can act on',
      'Complete an end-to-end data project from raw CSV to boardroom recommendation',
    ],
    careerPaths: [
      'Data Analyst',
      'BI Analyst',
      'Reporting Analyst',
      'Operations Analyst',
      'Freelance Data Consultant',
    ],
    weeks: [
      {
        n: 1,
        title: 'Data Thinking',
        theme: 'What Data Actually Is',
        sessions: [
          '• Types of data: structured, unstructured, time-series\n• Data sources Nigerian businesses actually use\n• The data analysis lifecycle: collect → clean → analyse → visualise → decide',
        ],
        deliverable:
          'Identify a real dataset from a Nigerian context. Describe what questions you could answer with it and what is missing.',
      },
      {
        n: 2,
        title: 'Excel as a Professional Tool',
        theme: 'Spreadsheet Mastery',
        sessions: [
          '• VLOOKUP, INDEX/MATCH, PivotTables, conditional formatting\n• Common mistakes that corrupt analysis\n• Building a clean, auditable spreadsheet model',
        ],
        deliverable:
          'Clean and analyse a messy sales dataset using Excel. Produce a summary table and three insights.',
        aiChallenge:
          'Ask AI to write Excel formulas for your task. Test every one. Document which worked, which broke, and which were subtly wrong.',
      },
      {
        n: 3,
        title: 'SQL Foundations',
        theme: 'Querying Databases',
        sessions: [
          '• SELECT, WHERE, JOIN, GROUP BY, ORDER BY\n• When to use SQL vs. Excel\n• Reading a database schema',
        ],
        deliverable:
          'Write 10 SQL queries against a provided Nigerian business database (retail orders dataset). Export results and explain what each query answers.',
      },
      {
        n: 4,
        title: 'SQL Intermediate + Data Cleaning',
        theme: 'Real Data is Messy',
        sessions: [
          '• Subqueries, CTEs, window functions\n• Identifying and handling NULLs, duplicates, and inconsistent formatting\n• Data quality documentation',
        ],
        deliverable:
          'Clean a provided dirty dataset using SQL. Document every decision: what you changed, why, and what you left alone.',
        aiAudit:
          'AI Audit: Ask AI to clean the same dataset. Compare its approach to yours. What did it silently delete that you kept? What did it miss?',
      },
      {
        n: 5,
        title: 'Python for Data Analysis',
        theme: 'pandas Foundations',
        sessions: [
          '• DataFrames, series, indexing, filtering\n• Merging, reshaping, aggregating\n• Reading and writing CSV, Excel, JSON',
        ],
        deliverable:
          'Replicate your Week 2 Excel analysis using Python/pandas. Reflect: what was faster, what was harder?',
      },
      {
        n: 6,
        title: 'Statistics for Analysts',
        theme: 'Understanding What the Numbers Mean',
        sessions: [
          '• Mean, median, mode — when each lies to you\n• Distributions, outliers, correlation vs. causation\n• Simple hypothesis testing in plain English',
        ],
        deliverable:
          'Analyse a provided dataset and write a 1-page statistical summary. Flag every number where you are uncertain about what caused it.',
        aiChallenge:
          'Ask AI to interpret the same statistics. Present both interpretations to a classmate. Which one asks better questions?',
      },
      {
        n: 7,
        title: 'Data Visualisation',
        theme: 'Making Data Visible',
        sessions: [
          '• Chart selection: when to use bar, line, scatter, pie (and when NOT to use pie)\n• Design principles for honest visualisation\n• Colour, labels, and avoiding misleading charts',
        ],
        deliverable:
          'Build 5 visualisations from a provided dataset. For each, write one sentence explaining why you chose that chart type.',
      },
      {
        n: 8,
        title: 'Power BI / Looker Studio',
        theme: 'Dashboard Building',
        sessions: [
          '• Connecting data sources, building calculated columns\n• Dashboard layout and UX principles\n• Sharing and permissions',
        ],
        deliverable:
          'Build an interactive dashboard using Power BI or Looker Studio on a Nigerian retail dataset. Must answer 3 specific business questions.',
        aiAudit:
          'AI Audit: Use AI to describe what a good dashboard for this dataset should include. Compare its suggestions to your actual build.',
      },
      {
        n: 9,
        title: 'Data Storytelling',
        theme: 'Communicating for Decisions',
        sessions: [
          '• The pyramid principle: lead with the insight, support with data\n• Writing for executives who will not read the appendix\n• Presenting data to people who distrust numbers',
        ],
        deliverable:
          'Write a 2-page data story from your Week 8 dashboard. Assume your audience is a business owner with no analytics background.',
      },
      {
        n: 10,
        title: 'Real-World Data Projects',
        theme: 'End-to-End Analysis',
        sessions: [
          '• How a real analytics project starts, stalls, and ships\n• Stakeholder management for analysts\n• Handling requests that cannot be answered with available data',
        ],
        deliverable:
          'Take a real Nigerian business question (provided by instructor). Scope what data you need, collect or approximate it, and outline your analysis approach.',
      },
      {
        n: 11,
        title: 'Capstone Project Work',
        theme: 'Independent Project',
        sessions: [
          '• Dedicated build week — no new content\n• Instructor office hours\n• Peer feedback sessions',
        ],
        deliverable:
          'Capstone project: first draft. End-to-end analysis from raw data to actionable recommendation for a real or realistic Nigerian business context.',
      },
      {
        n: 12,
        title: 'Capstone Presentation + Career Prep',
        theme: 'Final Showcase',
        sessions: [
          '• Final capstone presentations\n• Building your data portfolio on GitHub or Notion\n• How to talk about your work in interviews: what you found, not just what you did',
        ],
        deliverable:
          'Final capstone presentation (10 minutes + 5 minutes Q&A). Portfolio published. Written reflection: what AI could and could not do in this project.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    code: 'WD-201',
    slug: 'web-app-development',
    name: 'Web App Development',
    status: 'enrolling',
    accent: 'orange',
    icon: '🌐',
    duration: '12 weeks',
    prerequisite: 'Phase 1 completion',
    hoursPerWeek: '10–12 hours',
    summary:
      'Build web applications that work — and that you can explain, defend, and maintain. This track takes you from HTML fundamentals to deploying a full-stack Next.js application with a real database. Every week, AI will be your tool, not your crutch.',
    outcomes: [
      'Build responsive, accessible web interfaces using HTML, CSS, and JavaScript',
      'Develop full-stack web applications with React and Next.js',
      'Connect applications to real databases using Supabase/PostgreSQL',
      'Deploy and maintain web applications on Vercel or similar platforms',
      'Review and debug AI-generated code with confidence',
    ],
    careerPaths: [
      'Frontend Developer',
      'Full-Stack Developer',
      'React Developer',
      'Next.js Developer',
      'Freelance Web Developer',
    ],
    weeks: [
      {
        n: 1,
        title: 'How the Web Works',
        theme: 'Foundation Mental Models',
        sessions: [
          '• HTTP, browsers, requests, and responses\n• What happens when you type a URL\n• The difference between frontend and backend — and full-stack',
        ],
        deliverable:
          'Set up your development environment. Write a plain HTML page about yourself with at least 3 sections, proper semantic tags, and a working link.',
      },
      {
        n: 2,
        title: 'HTML & CSS Properly',
        theme: 'Structure and Style',
        sessions: [
          '• Semantic HTML: the right tag for the right job\n• CSS: box model, flexbox, grid\n• Responsive design: mobile-first approach',
        ],
        deliverable:
          'Build a responsive landing page for a fictional Nigerian startup. Must look good on both mobile and desktop.',
        aiChallenge:
          'Ask AI to write the CSS for your layout. Test it. Fix what is broken. Document what AI got wrong about mobile responsiveness.',
      },
      {
        n: 3,
        title: 'JavaScript Foundations',
        theme: 'Making Things Interactive',
        sessions: [
          '• Variables, functions, arrays, objects\n• DOM manipulation: selecting, changing, responding to events\n• The most common JavaScript mistakes beginners make',
        ],
        deliverable:
          'Add JavaScript interactivity to your Week 2 landing page: a working contact form (client-side), a mobile menu toggle, and one animated element.',
      },
      {
        n: 4,
        title: 'JavaScript Intermediate',
        theme: 'Async, APIs, and Modern JS',
        sessions: [
          '• Promises, async/await\n• Fetching data from a public API\n• ES6+: arrow functions, destructuring, spread, template literals',
        ],
        deliverable:
          'Build a page that fetches and displays real data from a free public API (weather, currency, or similar). Handle loading and error states.',
        aiAudit:
          'AI Audit: Ask AI to write the async fetch code. Deliberately give it a broken API URL. How does it handle errors? Does its error handling actually work?',
      },
      {
        n: 5,
        title: 'React Foundations',
        theme: 'Component Thinking',
        sessions: [
          '• Why React exists and what problem it solves\n• Components, props, and state\n• JSX and the virtual DOM',
        ],
        deliverable:
          'Rebuild your Week 2 landing page as a React application. Break it into at least 5 components. Deploy to Vercel.',
      },
      {
        n: 6,
        title: 'React Intermediate',
        theme: 'Real Application Patterns',
        sessions: [
          '• useEffect and data fetching in React\n• React Router for multi-page applications\n• Forms and controlled components',
        ],
        deliverable:
          'Build a multi-page React application with at least 3 routes, a working form, and data fetched from an API.',
        aiChallenge:
          'Ask AI to generate your useEffect data fetching. Test it with a slow network (DevTools throttling). Does it handle loading states correctly?',
      },
      {
        n: 7,
        title: 'Next.js Foundations',
        theme: 'Production-Ready React',
        sessions: [
          '• What Next.js adds to React: routing, SSR, SSG, API routes\n• File-based routing\n• The App Router vs. Pages Router',
        ],
        deliverable:
          'Convert your Week 6 React app to Next.js. Use at least one server component and one client component. Explain the difference in your reflection.',
      },
      {
        n: 8,
        title: 'Databases & Backend',
        theme: 'Connecting to Real Data',
        sessions: [
          '• SQL basics for web developers\n• Supabase: authentication, tables, Row Level Security\n• Writing and reading from a real database',
        ],
        deliverable:
          'Add user authentication to your Next.js app using Supabase Auth. Add one database table that stores user data. Build a profile page that shows it.',
        aiAudit:
          'AI Audit: Ask AI to write your Supabase Row Level Security policies. Read every policy carefully. What would happen if you deployed these policies as-is?',
      },
      {
        n: 9,
        title: 'Full-Stack Patterns',
        theme: 'Putting It All Together',
        sessions: [
          '• API routes in Next.js\n• Environment variables and secrets management\n• CRUD operations: create, read, update, delete',
        ],
        deliverable:
          'Build a full CRUD feature in your Next.js/Supabase app. All operations must work end-to-end with proper error handling.',
      },
      {
        n: 10,
        title: 'Performance, SEO & Deployment',
        theme: 'Shipping to the Real World',
        sessions: [
          '• Web performance: what slows pages down and how to fix it\n• SEO fundamentals for Next.js\n• Deployment pipelines, environment variables, domains',
        ],
        deliverable:
          'Optimise your app. Run a Lighthouse audit and improve your score by at least 20 points. Write a deployment checklist.',
      },
      {
        n: 11,
        title: 'Capstone Build Week',
        theme: 'Independent Project',
        sessions: [
          '• No new content — dedicated build time\n• Instructor office hours daily\n• Peer code review sessions',
        ],
        deliverable:
          'Capstone first draft: a full-stack Next.js application solving a real Nigerian problem. Must have authentication, a database, and be deployed.',
      },
      {
        n: 12,
        title: 'Capstone Demo + Career Prep',
        theme: 'Final Showcase',
        sessions: [
          '• Live demonstrations of capstone projects\n• Code walkthroughs: explain your decisions, not just your output\n• Building a developer portfolio and GitHub profile',
        ],
        deliverable:
          'Final capstone demo (live, 10 minutes). GitHub repository with a clear README. Written reflection: what AI wrote, what you had to fix, what you learned.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    code: 'MD-201',
    slug: 'mobile-desktop-apps',
    name: 'Mobile & Desktop Apps',
    status: 'enrolling',
    accent: 'cyan',
    icon: '📱',
    duration: '12 weeks',
    prerequisite: 'Phase 1 completion',
    hoursPerWeek: '10–12 hours',
    summary:
      'Build apps that run everywhere — Android, iOS, and Windows — from a single codebase using Flutter. This is one of the most in-demand skills in the Nigerian market, where mobile-first is not a trend but a reality.',
    outcomes: [
      'Build cross-platform mobile and desktop applications using Flutter and Dart',
      'Design clean, responsive UI layouts using Flutter’s widget system',
      'Connect apps to real backends using Supabase or Firebase',
      'Publish a working app to Google Play or as a Windows executable',
      'Read, debug, and improve AI-generated Flutter code',
    ],
    careerPaths: [
      'Mobile App Developer',
      'Flutter Developer',
      'Cross-Platform Developer',
      'Freelance App Developer',
      'App Founder',
    ],
    weeks: [
      {
        n: 1,
        title: 'Dart Language Foundations',
        theme: 'The Language Underneath Flutter',
        sessions: [
          '• Variables, types, functions, classes in Dart\n• Why Flutter uses Dart\n• Dart null safety — the feature that saves you at 2am',
        ],
        deliverable:
          'Write 10 Dart functions that solve common problems: reverse a string, find duplicates in a list, calculate compound interest. No Flutter yet.',
      },
      {
        n: 2,
        title: 'Flutter Basics',
        theme: 'Your First Real App',
        sessions: [
          '• Widgets: stateless vs. stateful\n• The widget tree and how Flutter renders\n• Basic layouts: Column, Row, Container, Padding',
        ],
        deliverable:
          'Build a profile card app with your name, photo placeholder, skills list, and a contact button. Must run on both mobile and desktop.',
        aiChallenge:
          'Ask AI to generate the widget tree for your profile card. Build it yourself first, then compare. Where did AI use a different widget and was it better or worse?',
      },
      {
        n: 3,
        title: 'State Management',
        theme: 'Making Apps Respond to Users',
        sessions: [
          '• setState and when it is enough\n• Provider: the professional way to manage state\n• Common state management mistakes and how to spot them',
        ],
        deliverable:
          'Build a shopping cart app with add/remove items, quantity controls, and a running total. State must persist across screens.',
      },
      {
        n: 4,
        title: 'Navigation & Multi-Screen Apps',
        theme: 'Real App Architecture',
        sessions: [
          '• Navigator 2.0 and GoRouter\n• Passing data between screens\n• Bottom navigation bar and tab patterns',
        ],
        deliverable:
          'Build a 4-screen app: Home, Product List, Product Detail, and Cart. All navigation must work without errors on forward and back.',
        aiAudit:
          'AI Audit: Ask AI to set up GoRouter for your app. Test deep linking. Does it actually work or does it crash on edge cases?',
      },
      {
        n: 5,
        title: 'UI Polish & Design Systems',
        theme: 'Apps That Look Professional',
        sessions: [
          '• Material Design 3 in Flutter\n• Custom themes, fonts, and colour systems\n• Responsive design: building for phone, tablet, and desktop simultaneously',
        ],
        deliverable:
          'Redesign your Week 4 app to look professional. Implement a consistent design system with a custom colour palette, typography scale, and component style.',
      },
      {
        n: 6,
        title: 'Forms, Validation & User Input',
        theme: 'Getting Data from Users',
        sessions: [
          '• Flutter form widgets and GlobalKey\n• Input validation patterns\n• User feedback: loading states, success messages, error handling',
        ],
        deliverable:
          'Build a multi-step form: user registration with name, email, password, and profile photo upload. Validate every field before proceeding.',
        aiChallenge:
          'Ask AI to write your form validation logic. Test every edge case: empty fields, invalid email format, password too short. How many fail?',
      },
      {
        n: 7,
        title: 'Connecting to a Backend',
        theme: 'Real Data, Real Apps',
        sessions: [
          '• HTTP requests with Dart’s http package\n• Supabase Flutter integration: auth, database, storage\n• Handling network errors gracefully',
        ],
        deliverable:
          'Connect your app to a real Supabase backend. Implement login, logout, and fetching user-specific data from the database.',
      },
      {
        n: 8,
        title: 'Local Storage & Offline Behaviour',
        theme: 'Apps That Work Without Internet',
        sessions: [
          '• SharedPreferences for simple key-value storage\n• Hive for local database\n• Offline-first architecture: sync when online, work when not',
        ],
        deliverable:
          'Add offline support to your app. User data must persist between app launches. When connection returns, sync with the backend.',
        aiAudit:
          'AI Audit: Ask AI to implement your offline sync logic. What happens when the user edits data offline on two devices? Does AI’s solution handle conflict resolution?',
      },
      {
        n: 9,
        title: 'Native Features',
        theme: 'Camera, Location, Notifications',
        sessions: [
          '• Camera and image picker\n• Location services and maps\n• Push notifications with Firebase Cloud Messaging',
        ],
        deliverable:
          'Add one native feature to your app: either camera/photo upload, location display, or push notifications. Must work on a real device.',
      },
      {
        n: 10,
        title: 'Performance & Publishing',
        theme: 'Shipping Your App',
        sessions: [
          '• App performance profiling in Flutter DevTools\n• Reducing app size\n• Publishing to Google Play (Android) and building a Windows .exe',
        ],
        deliverable:
          'Profile your app. Identify and fix at least two performance issues. Build a release APK and a Windows executable. Write a publishing checklist.',
      },
      {
        n: 11,
        title: 'Capstone Build Week',
        theme: 'Independent Project',
        sessions: [
          '• No new content — dedicated build time\n• Instructor code reviews\n• Peer testing across devices',
        ],
        deliverable:
          'Capstone first draft: a cross-platform Flutter app that solves a real problem for a Nigerian user. Must have a backend connection and at least one native feature.',
      },
      {
        n: 12,
        title: 'Capstone Demo + Career Prep',
        theme: 'Final Showcase',
        sessions: [
          '• Live app demonstrations\n• How to talk about a Flutter project in an interview or client pitch\n• Building a mobile developer portfolio',
        ],
        deliverable:
          'Final capstone demo (live on a real device). Published APK link or Google Play listing. Written reflection on AI use throughout the project.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    code: 'AI-201',
    slug: 'ai-agentic-systems',
    name: 'AI & Agentic Systems',
    status: 'enrolling',
    accent: 'orange',
    icon: '🤖',
    duration: '12 weeks',
    prerequisite:
      'Phase 1 completion. Basic coding familiarity strongly recommended (Track B or C preferred).',
    hoursPerWeek: '10–12 hours',
    summary:
      'Build AI-powered products — not just use them. You will learn how modern AI systems work, how to integrate them into applications, how to build agents that take actions autonomously, and — critically — how to know when they are wrong. This is not a prompt engineering course. This is engineering with AI.',
    outcomes: [
      'Understand how large language models work without needing a PhD',
      'Integrate AI APIs (OpenAI, Anthropic, Groq) into real applications',
      'Build agentic systems that plan, use tools, and take actions',
      'Evaluate AI output quality and build guardrails for production systems',
      'Design and ship an AI-powered product from idea to deployment',
    ],
    careerPaths: [
      'AI Developer',
      'AI Integration Engineer',
      'Prompt Engineer',
      'AI Solutions Developer',
      'Automation Engineer',
    ],
    weeks: [
      {
        n: 1,
        title: 'How AI Actually Works',
        theme: 'Under the Hood',
        sessions: [
          '• Tokens, embeddings, and why LLMs predict rather than think\n• Training vs. inference — the difference that matters for building\n• What AI is genuinely good at and what it reliably fails at',
        ],
        deliverable:
          'Write a 1-page honest assessment of an AI tool you use regularly. What does it do well? Where have you caught it being confidently wrong?',
      },
      {
        n: 2,
        title: 'Prompt Engineering That Actually Works',
        theme: 'Talking to Models Professionally',
        sessions: [
          '• System prompts, user prompts, few-shot examples\n• Chain-of-thought prompting and when it helps\n• Why the same prompt fails on different models',
        ],
        deliverable:
          'Build a prompt library for one Nigerian business use case (e.g., customer service, invoice generation, content creation). Test each prompt on 3 different models.',
      },
      {
        n: 3,
        title: 'AI APIs: Connecting to Models',
        theme: 'Code + AI',
        sessions: [
          '• OpenAI, Anthropic, and Groq API setup and authentication\n• Structuring API calls: messages, temperature, max tokens\n• Handling rate limits, timeouts, and API errors',
        ],
        deliverable:
          'Build a simple API wrapper in Python or JavaScript that connects to an LLM. Take a user input, send it to the model, return a clean response.',
        aiChallenge:
          'Ask AI to write your API integration code. Test it with unusual inputs: empty strings, very long text, non-English characters. What breaks?',
      },
      {
        n: 4,
        title: 'Structured Outputs & Function Calling',
        theme: 'AI That Returns Usable Data',
        sessions: [
          '• Why unstructured AI output breaks applications\n• JSON mode and structured output schemas\n• Function calling: making AI trigger real actions',
        ],
        deliverable:
          'Build an AI tool that takes a user’s natural language business request and returns a structured JSON response that could feed a database or UI.',
      },
      {
        n: 5,
        title: 'Retrieval-Augmented Generation (RAG)',
        theme: 'AI With Your Own Knowledge',
        sessions: [
          '• Why base models do not know your business\n• Vector databases and embeddings in plain English\n• Building a simple RAG pipeline: chunk, embed, retrieve, generate',
        ],
        deliverable:
          'Build a RAG system that answers questions about a Nigerian business document (a company policy, FAQ, or product catalogue). Must cite its sources.',
        aiAudit:
          'AI Audit: Test your RAG system with questions it should not be able to answer from the document. Does it hallucinate an answer or correctly say it does not know?',
      },
      {
        n: 6,
        title: 'Building Chatbots',
        theme: 'Conversational AI Products',
        sessions: [
          '• Managing conversation history and context windows\n• Persona design and system prompt engineering for character\n• When a chatbot is the wrong solution',
        ],
        deliverable:
          'Build a domain-specific chatbot for a Nigerian use case (e.g., a Kuda-style support bot, a school timetable assistant). Must handle at least 10 realistic conversation scenarios.',
      },
      {
        n: 7,
        title: 'AI Agents: Planning and Tool Use',
        theme: 'AI That Takes Actions',
        sessions: [
          '• What makes something an agent vs. a chatbot\n• ReAct pattern: Reason + Act loops\n• Tool definitions: giving AI the ability to search, calculate, or call APIs',
        ],
        deliverable:
          'Build a simple agent that can use two tools: a web search tool and a calculator. Give it a multi-step Nigerian business task that requires both.',
      },
      {
        n: 8,
        title: 'Agentic Workflows',
        theme: 'Multi-Step Autonomous Tasks',
        sessions: [
          '• Multi-agent systems: orchestrator + workers\n• When agents go wrong: hallucination, infinite loops, incorrect tool use\n• Human-in-the-loop design patterns',
        ],
        deliverable:
          'Build a two-agent system: one agent researches a topic, another summarises and formats the output. The human reviews before anything is sent.',
        aiAudit:
          'AI Audit: Deliberately give your agent an ambiguous task. Document every wrong decision it makes. Redesign the system prompt to fix the most critical one.',
      },
      {
        n: 9,
        title: 'AI Safety & Evaluation',
        theme: 'Building Systems You Can Trust',
        sessions: [
          '• Prompt injection attacks and jailbreaks\n• Evaluating AI output at scale: what does good look like?\n• Guardrails: content filtering, output validation, fallback logic',
        ],
        deliverable:
          'Build an evaluation framework for your Week 6 chatbot. Define 20 test cases. Run them. Document your pass rate and the categories of failures.',
      },
      {
        n: 10,
        title: 'AI Products in Production',
        theme: 'Shipping Real Things',
        sessions: [
          '• Cost management: token usage, caching, model selection\n• Monitoring AI systems after launch\n• Legal and ethical questions Nigerian founders actually face',
        ],
        deliverable:
          'Write a production readiness checklist for your AI system. Include cost estimates, failure modes, monitoring plan, and one ethical risk you identified.',
      },
      {
        n: 11,
        title: 'Capstone Build Week',
        theme: 'Independent Project',
        sessions: [
          '• No new content — dedicated build time\n• Instructor reviews: architecture, prompts, evaluation\n• Peer testing: try to break each other’s systems',
        ],
        deliverable:
          'Capstone first draft: an AI-powered product or tool addressing a real Nigerian problem. Must include evaluation framework and at least one safety guardrail.',
      },
      {
        n: 12,
        title: 'Capstone Demo + Career Prep',
        theme: 'Final Showcase',
        sessions: [
          '• Live product demonstrations\n• How to explain an AI system to a non-technical client or employer\n• The AI developer job market in Nigeria and remotely',
        ],
        deliverable:
          'Final capstone demo. Written technical documentation. Honest reflection: where AI helped you build it and where it led you astray.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    code: 'PD-201',
    slug: 'product-design',
    name: 'Product Design',
    status: 'enrolling',
    accent: 'cyan',
    icon: '🎨',
    duration: '12 weeks',
    prerequisite: 'Phase 1 completion',
    hoursPerWeek: '8–10 hours',
    summary:
      'Design digital products that people actually want to use. This track covers the full product design process — from user research and wireframing to high-fidelity prototypes and design systems — using Figma as your primary tool. Design in the Nigerian context: understand the users, the devices, the bandwidth constraints, and the cultural expectations that global design tutorials ignore.',
    outcomes: [
      'Run user research and translate findings into design decisions',
      'Build wireframes, user flows, and interactive prototypes in Figma',
      'Design accessible, responsive interfaces for mobile and web',
      'Create and maintain a design system',
      'Present and defend design decisions to developers and stakeholders',
    ],
    careerPaths: [
      'Product Designer',
      'UX Designer',
      'UI/UX Designer',
      'Product Researcher',
      'Freelance Designer',
    ],
    weeks: [
      {
        n: 1,
        title: 'What Product Design Actually Is',
        theme: 'Design Thinking Foundations',
        sessions: [
          '• UX vs. UI — the difference and why it matters\n• The design process: empathise → define → ideate → prototype → test\n• How Nigerian users behave differently from the users in most design tutorials',
        ],
        deliverable:
          'Find a Nigerian app with a frustrating UX. Write a 1-page critique: what fails, why you think it fails, and one design change that would fix the biggest issue.',
      },
      {
        n: 2,
        title: 'User Research',
        theme: 'Designing for Real People',
        sessions: [
          '• Research methods: interviews, observation, usability testing, surveys\n• How to write a good interview guide\n• Synthesising research: affinity mapping and insight extraction',
        ],
        deliverable:
          'Conduct two user interviews about how people in your network manage money on their phones. Write an insight summary with 3 design implications.',
        aiChallenge:
          'Ask AI to generate a user persona from your research notes. Compare it to what you actually found. What did AI assume that your real users do not do?',
      },
      {
        n: 3,
        title: 'Figma Foundations',
        theme: 'Your Design Tool, Properly',
        sessions: [
          '• Frames, groups, components, and auto layout\n• Styles: colours, typography, effects\n• Basic prototyping: connecting screens with interactions',
        ],
        deliverable:
          'Recreate an existing Nigerian app screen (Kuda, Carbon, Opay) in Figma. Match it precisely. Document every design decision you notice in the original.',
      },
      {
        n: 4,
        title: 'Information Architecture',
        theme: 'Organising What Users See',
        sessions: [
          '• Site maps and user flows\n• Card sorting: letting users organise your content for you\n• Navigation patterns: tabs, drawers, menus — when to use which',
        ],
        deliverable:
          'Design a full user flow (not just screens — actual flow diagram) for one core task in a Nigerian fintech or e-commerce app.',
      },
      {
        n: 5,
        title: 'Wireframing',
        theme: 'Design Before Design',
        sessions: [
          '• Why wireframes exist and what low fidelity means\n• Wireframing in Figma with components\n• Getting stakeholder feedback on wireframes before you invest in visuals',
        ],
        deliverable:
          'Wireframe your capstone app idea (all core screens) in Figma. Present to a peer for a structured 10-minute critique.',
        aiAudit:
          'AI Audit: Ask AI to describe what screens your app should have. Compare its list to your wireframes. What did it suggest that you had not thought of? What was wrong for your Nigerian context?',
      },
      {
        n: 6,
        title: 'Visual Design',
        theme: 'Making It Look Like It Works',
        sessions: [
          '• Colour theory in product design: contrast, brand, emotion\n• Typography for interfaces: readability on small screens in low light\n• Iconography, imagery, and the danger of stock photos in Nigerian products',
        ],
        deliverable:
          'Apply visual design to your wireframes. Develop a colour palette, typography scale, and icon set. Must meet WCAG AA contrast standards.',
      },
      {
        n: 7,
        title: 'Design Systems',
        theme: 'Design That Scales',
        sessions: [
          '• What a design system is and why it exists\n• Building components in Figma: buttons, inputs, cards, navigation\n• Documentation: writing usage guidelines developers can actually follow',
        ],
        deliverable:
          'Build a mini design system for your capstone project: at least 10 components, documented with usage rules and do/don’t examples.',
      },
      {
        n: 8,
        title: 'Prototyping & Usability Testing',
        theme: 'Validate Before You Build',
        sessions: [
          '• Interactive prototypes in Figma: variables, conditionals, overlays\n• Writing a usability test script\n• Running a usability test and what to do with what you find',
        ],
        deliverable:
          'Build a clickable prototype of your core user flow. Run a usability test with 2 real users. Write a findings report with specific design changes.',
        aiChallenge:
          'Ask AI to predict what usability issues your design will have. Then run the actual test. How accurate was it?',
      },
      {
        n: 9,
        title: 'Designing for Constraints',
        theme: 'The Nigerian Context',
        sessions: [
          '• Designing for slow connections and older devices\n• Offline states, empty states, and error states\n• Low literacy, multiple languages, and trust signals in Nigerian interfaces',
        ],
        deliverable:
          'Redesign your most complex screen for a user with a 2G connection on a mid-range Android phone. Justify every change.',
      },
      {
        n: 10,
        title: 'Design Handoff & Developer Collaboration',
        theme: 'From Design to Production',
        sessions: [
          '• How developers read a Figma file\n• Writing clear annotations and specifications\n• Common handoff mistakes that waste developer time',
        ],
        deliverable:
          'Prepare a developer handoff document for your capstone screens. Pair with a student from Track B or C and get their honest feedback on whether they could build from your file.',
      },
      {
        n: 11,
        title: 'Capstone Build Week',
        theme: 'Independent Project',
        sessions: [
          '• No new content — dedicated design and refinement time\n• Instructor design critiques\n• Peer feedback sessions using structured critique framework',
        ],
        deliverable:
          'Capstone first draft: complete Figma file with all screens, a design system, a clickable prototype, and a usability test report.',
      },
      {
        n: 12,
        title: 'Capstone Presentation + Career Prep',
        theme: 'Final Showcase',
        sessions: [
          '• Portfolio presentations: how to tell the story of a design project\n• Building a Behance or Notion portfolio\n• How to talk about your design decisions in interviews',
        ],
        deliverable:
          'Final capstone presentation. Figma file published and shareable. Portfolio piece written up with: problem, research, decisions, prototype, and test findings.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    code: 'DE-201',
    slug: 'digital-entrepreneurship',
    name: 'Digital Entrepreneurship',
    status: 'enrolling',
    accent: 'orange',
    icon: '📈',
    duration: '12 weeks',
    prerequisite: 'Phase 1 completion',
    hoursPerWeek: '8–10 hours',
    summary:
      'Build a real digital business — not a pitch deck. This track covers customer acquisition, revenue generation, digital marketing, sales, and the operational realities of running a Nigerian digital business. By the end, you will have a working business plan, a tested acquisition strategy, and your first or next customer.',
    outcomes: [
      'Validate a business idea with real customer conversations before building anything',
      'Build and execute a digital marketing strategy across the right channels for Nigeria',
      'Generate revenue: structure pricing, close sales, and retain customers',
      'Build operational systems that do not require you to be present for every decision',
      'Present a fundable business case to investors or grant committees',
    ],
    careerPaths: [
      'Business Development Manager',
      'Growth Manager',
      'Digital Marketing Strategist',
      'Sales & Partnerships Lead',
      'Founder',
    ],
    weeks: [
      {
        n: 1,
        title: 'The Business Idea vs. The Business',
        theme: 'From Idea to Evidence',
        sessions: [
          '• Why most ideas fail before they need to fail\n• The difference between a passion project and a scalable business\n• How to test an idea in 7 days without building anything',
        ],
        deliverable:
          'Choose a business idea. Write a falsifiable hypothesis: ‘I believe [customer] will pay [amount] for [solution] because [reason]. I will know I am right if [evidence].’',
      },
      {
        n: 2,
        title: 'Customer Discovery for Founders',
        theme: 'Talking to Real People',
        sessions: [
          '• The Mom Test: how to ask questions that do not lie to you\n• Finding your first 10 potential customers in Nigeria\n• What to do with what they tell you',
        ],
        deliverable:
          'Conduct 3 customer discovery interviews. Write an insight report: what they said, what you noticed, and how your hypothesis changed.',
        aiChallenge:
          'Ask AI to generate customer discovery questions for your business. Evaluate each question against the Mom Test principles. How many would actually give you useful data?',
      },
      {
        n: 3,
        title: 'Revenue First',
        theme: 'Getting Paid',
        sessions: [
          '• Pricing models: subscription, transactional, freemium, retainer\n• How Nigerian customers think about price and trust\n• Getting your first sale before your product is ready',
        ],
        deliverable:
          'Set a price for your offering and explain it. Then do pre-sales: have at least one real conversation where you ask someone to pay. Document what happened.',
      },
      {
        n: 4,
        title: 'Digital Marketing Strategy',
        theme: 'Getting Found',
        sessions: [
          '• Channel selection for Nigeria: WhatsApp, Instagram, LinkedIn, TikTok, Google\n• Content marketing vs. paid advertising — when each makes sense\n• The customer journey: awareness → consideration → decision',
        ],
        deliverable:
          'Build a 30-day marketing plan for your business. Choose 2 channels. Define your content calendar and your success metric for each channel.',
      },
      {
        n: 5,
        title: 'Content That Converts',
        theme: 'Writing and Creating for Business',
        sessions: [
          '• Copywriting fundamentals: headlines, value propositions, calls to action\n• Creating content for WhatsApp Business and Instagram\n• Video for business: talking head content without a production team',
        ],
        deliverable:
          'Create 5 pieces of content for your business across your 2 chosen channels. At least one must be video. Post at least 2 publicly.',
        aiChallenge:
          'Use AI to generate 5 social media captions for your business. Post one AI version and one human version of the same message. Track which performs better.',
      },
      {
        n: 6,
        title: 'WhatsApp as a Business Channel',
        theme: 'Nigeria’s Primary Commerce Platform',
        sessions: [
          '• WhatsApp Business setup: catalogue, automated messages, labels\n• Customer communication that builds trust\n• Order management, follow-up, and customer retention via WhatsApp',
        ],
        deliverable:
          'Set up a fully operational WhatsApp Business account for your business. Write 5 message templates. Run a mock customer journey from first message to payment.',
      },
      {
        n: 7,
        title: 'Sales Skills for Founders',
        theme: 'Closing Without Feeling Manipulative',
        sessions: [
          '• Consultative selling: understand before you pitch\n• Objection handling for Nigerian customers: price, trust, timing\n• Follow-up without being annoying',
        ],
        deliverable:
          'Run 3 mock sales conversations with classmates role-playing as customers. Record what worked, what failed, and the one thing you will change.',
      },
      {
        n: 8,
        title: 'Business Operations',
        theme: 'Systems That Run Without You',
        sessions: [
          '• Process documentation: if you cannot write it down, it is not a process\n• Tools for running a small Nigerian digital business: accounting, invoicing, scheduling\n• Managing a business when you are also the employee',
        ],
        deliverable:
          'Document one complete business process end-to-end (e.g., from a new customer inquiry to delivery and follow-up). Identify where it would break if you were sick.',
        aiAudit:
          'AI Audit: Ask AI to build an operations checklist for your business type. Identify what it missed that is specific to Nigeria.',
      },
      {
        n: 9,
        title: 'Partnerships & Business Development',
        theme: 'Growing Through Others',
        sessions: [
          '• Finding and approaching potential partners\n• Structuring simple partnership agreements\n• Affiliate and referral programmes in the Nigerian context',
        ],
        deliverable:
          'Identify 3 potential partners for your business. Write a partnership pitch for one of them. Conduct a mock outreach conversation.',
      },
      {
        n: 10,
        title: 'Growth & Retention',
        theme: 'Keeping What You Build',
        sessions: [
          '• Unit economics: what does one customer actually cost and earn?\n• Churn and why retention beats acquisition\n• Building a referral loop in a WhatsApp-based business',
        ],
        deliverable:
          'Calculate your unit economics. How much does acquiring one customer cost? How much do they generate over 3 months? Is your model viable?',
      },
      {
        n: 11,
        title: 'Capstone Build Week',
        theme: 'Business Plan Development',
        sessions: [
          '• No new content — plan development week\n• Instructor business reviews\n• Peer pressure-testing of business assumptions',
        ],
        deliverable:
          'Capstone first draft: a business plan covering problem, customer, solution, revenue model, marketing strategy, unit economics, and 90-day action plan.',
      },
      {
        n: 12,
        title: 'Investor Pitch + Career Prep',
        theme: 'Final Showcase',
        sessions: [
          '• How to pitch a business in 5 minutes\n• What Nigerian investors and grant committees actually look for\n• The difference between building a business and building a career in business',
        ],
        deliverable:
          'Final pitch presentation (5 minutes + 5 minutes Q&A). Must include evidence from real customer conversations and at least one revenue transaction.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    code: 'PM-201',
    slug: 'ai-product-management',
    name: 'AI Product Management',
    status: 'enrolling',
    accent: 'cyan',
    icon: '🧭',
    duration: '12 weeks',
    prerequisite:
      'Phase 1 completion. Exposure to any technical or business track preferred.',
    hoursPerWeek: '8–10 hours',
    summary:
      'Product managers decide what gets built, why, and for whom. AI Product Managers do all of that — and also understand what AI can and cannot do well enough to make those decisions without being misled by engineers or vendors. This track is for people who want to lead product teams, not just join them.',
    outcomes: [
      'Write product requirements that engineers can actually build from',
      'Prioritise ruthlessly using data, user research, and strategy',
      'Understand AI capabilities and limitations well enough to make sound product decisions',
      'Run an effective product development cycle from discovery to launch',
      'Build a product portfolio demonstrating PM thinking, not just execution',
    ],
    careerPaths: [
      'Product Manager',
      'AI Product Manager',
      'Technical Product Manager',
      'Product Owner',
      'Startup Founder',
    ],
    weeks: [
      {
        n: 1,
        title: 'What a Product Manager Actually Does',
        theme: 'The Role and the Reality',
        sessions: [
          '• PM vs. project manager vs. product owner — and why the confusion matters\n• The PM’s job: decision-making under uncertainty\n• A day in the life: what takes up time and what should take up time',
        ],
        deliverable:
          'Shadow (or interview) someone in a product-adjacent role. Write a 1-page observation: what decisions did they make today, and what information did they base those decisions on?',
      },
      {
        n: 2,
        title: 'User Research for PMs',
        theme: 'Understanding What Users Actually Need',
        sessions: [
          '• The difference between user research and user surveys\n• Jobs-to-be-Done for product decisions\n• How to run a discovery sprint in one week',
        ],
        deliverable:
          'Run a 3-person discovery sprint for a product idea. Write a discovery summary: what you learned, what you assumed wrong, and what you will build first.',
        aiChallenge:
          'Ask AI to generate user research questions for your product. Apply the Mom Test to each one. How many would give you data you could actually act on?',
      },
      {
        n: 3,
        title: 'Product Strategy',
        theme: 'Deciding What You Are Building',
        sessions: [
          '• Vision, strategy, and roadmap — in that order\n• How to say no without killing morale\n• Competitive analysis that is actually useful',
        ],
        deliverable:
          'Write a 1-page product strategy document for a real or fictional Nigerian digital product. Vision, target user, key bets, and what you are deliberately not building.',
      },
      {
        n: 4,
        title: 'Writing Product Requirements',
        theme: 'Specs That Engineers Can Build From',
        sessions: [
          '• User stories, acceptance criteria, and edge cases\n• The PRD vs. the ticket — and when you need which\n• How vague requirements become expensive mistakes',
        ],
        deliverable:
          'Write a full product requirements document for one feature of your capstone product. Include user story, acceptance criteria, edge cases, and what out of scope means.',
        aiAudit:
          'AI Audit: Ask AI to write a PRD for the same feature. Have a classmate from Track B or C review both. Which one could they actually build from?',
      },
      {
        n: 5,
        title: 'Prioritisation',
        theme: 'Choosing What Gets Built Next',
        sessions: [
          '• RICE, MoSCoW, and Kano — when to use each\n• Managing stakeholder requests that all feel urgent\n• The cost of a wrong prioritisation decision',
        ],
        deliverable:
          'Build a prioritised backlog for your capstone product using RICE scoring. Then present your top 3 items and defend them to a classmate playing devil’s advocate.',
      },
      {
        n: 6,
        title: 'AI Product Decisions',
        theme: 'When to Use AI and When Not To',
        sessions: [
          '• What AI actually does in products: prediction, generation, classification, recommendation\n• Questions to ask before adding AI to a product\n• When AI makes products worse — and the PM’s job to prevent it',
        ],
        deliverable:
          'Audit an existing product that uses AI. Write a PM-style assessment: what the AI feature does, what problem it solves, whether it solves it well, and what you would change.',
      },
      {
        n: 7,
        title: 'Working with Engineering Teams',
        theme: 'Getting Things Built',
        sessions: [
          '• How to talk to engineers without being dismissed or ignored\n• Sprint planning, grooming, and retros from the PM perspective\n• Unblocking engineers vs. doing their job for them',
        ],
        deliverable:
          'Run a mock sprint planning session with 2 classmates playing engineers. Assign stories, estimate complexity, and agree on a sprint goal. Document what was harder than expected.',
      },
      {
        n: 8,
        title: 'Metrics & Product Analytics',
        theme: 'Knowing if It is Working',
        sessions: [
          '• Defining success metrics before you build, not after\n• The difference between vanity metrics and actionable metrics\n• Reading a product dashboard and asking the right questions',
        ],
        deliverable:
          'Define a measurement plan for your capstone product: primary metric, secondary metrics, guardrail metrics, and how you will know if the launch failed within 2 weeks.',
        aiChallenge:
          'Ask AI to suggest metrics for your product. How many are vanity metrics? How many would you actually act on if the number moved?',
      },
      {
        n: 9,
        title: 'Launch Planning',
        theme: 'Shipping Intentionally',
        sessions: [
          '• Go-to-market for digital products in Nigeria\n• Beta testing, staged rollouts, and feature flags\n• What to communicate to users, support teams, and stakeholders when you launch',
        ],
        deliverable:
          'Write a launch plan for one feature of your capstone product: pre-launch checklist, launch day plan, post-launch monitoring, and rollback criteria.',
      },
      {
        n: 10,
        title: 'The AI PM in Practice',
        theme: 'Case Studies and Judgment Calls',
        sessions: [
          '• Case studies: AI product decisions that went wrong and why\n• Ethical judgment in AI product management: bias, fairness, transparency\n• How to evaluate an AI vendor’s claims',
        ],
        deliverable:
          'Write a case study of an AI feature that failed (real or fictional). Root cause analysis: what PM decision led to the failure? What would you have done differently?',
      },
      {
        n: 11,
        title: 'Capstone Build Week',
        theme: 'Product Documentation Sprint',
        sessions: [
          '• No new content — full documentation sprint\n• Instructor product reviews\n• Peer PM critiques',
        ],
        deliverable:
          'Capstone first draft: a complete product specification package for your chosen product. Vision doc, user research summary, PRD, prioritised backlog, metrics plan, and launch plan.',
      },
      {
        n: 12,
        title: 'Product Presentation + Career Prep',
        theme: 'Final Showcase',
        sessions: [
          '• Presenting a product case in a PM interview\n• Building a PM portfolio: case studies, not just job titles\n• The PM career path in Nigeria and internationally',
        ],
        deliverable:
          'Final product presentation (10 minutes). Full product documentation package published. Written reflection: how AI both helped and limited your thinking during this track.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    code: 'CS-201',
    slug: 'cybersecurity-fundamentals',
    name: 'Cybersecurity Fundamentals',
    status: 'enrolling',
    accent: 'orange',
    icon: '🛡️',
    duration: '12 weeks',
    prerequisite:
      'Phase 1 completion. Basic understanding of how networks and web apps work is helpful but not required.',
    hoursPerWeek: '8–10 hours',
    summary:
      'Cybersecurity is one of the fastest-growing fields in Nigeria and globally. This track gives you a rigorous foundation — how attacks happen, how defences work, and how to think like both an attacker and a defender. By the end, you will have hands-on lab experience and a portfolio of security assessments that demonstrates real skill, not just certificates.',
    outcomes: [
      'Understand how common cyberattacks work at a technical level',
      'Identify vulnerabilities in networks, applications, and human behaviour',
      'Apply defensive security practices in real environments',
      'Use professional security tools including Kali Linux, Wireshark, and Burp Suite',
      'Communicate security risks clearly to both technical and non-technical audiences',
    ],
    careerPaths: [
      'Security Analyst',
      'IT Security Officer',
      'Cybersecurity Consultant',
      'SOC Analyst',
      'Junior Penetration Tester',
    ],
    weeks: [
      {
        n: 1,
        title: 'The Threat Landscape',
        theme: 'How Attacks Actually Happen',
        sessions: [
          '• The anatomy of a cyberattack: reconnaissance, exploitation, persistence, exfiltration\n• Nigerian cyber threat context: BEC, SIM swap, phishing, ransomware\n• Why most breaches start with a human, not a zero-day',
        ],
        deliverable:
          'Research one real Nigerian cyberattack (news source required). Write a 1-page incident breakdown: what happened, how, what could have stopped it.',
      },
      {
        n: 2,
        title: 'Networking for Security',
        theme: 'You Cannot Defend What You Do Not Understand',
        sessions: [
          '• TCP/IP, DNS, HTTP/HTTPS, ports and protocols\n• How packets travel and where attackers intercept them\n• Network diagrams: reading and drawing them',
        ],
        deliverable:
          'Using Wireshark, capture your own network traffic for 5 minutes. Identify: your IP, a DNS query, a TCP handshake, and one piece of unencrypted data. Screenshot and annotate each.',
      },
      {
        n: 3,
        title: 'Linux for Security Professionals',
        theme: 'The Operating System Security Runs On',
        sessions: [
          '• Linux file system, permissions, processes, and users\n• Kali Linux setup and essential tools\n• Command line fluency: the commands every security professional uses daily',
        ],
        deliverable:
          'Complete a set of 20 Linux command challenges in Kali Linux. Document every command used and explain what it does.',
        aiChallenge:
          'Ask AI to explain a Linux permission error you encountered. Verify its answer by testing it. Did it give you the right fix or a plausible-sounding wrong one?',
      },
      {
        n: 4,
        title: 'Reconnaissance & OSINT',
        theme: 'Finding Information Without Touching the Target',
        sessions: [
          '• Open Source Intelligence: what attackers find before they attack\n• Tools: Shodan, theHarvester, Maltego basics, Google Dorks\n• Ethical and legal boundaries of reconnaissance',
        ],
        deliverable:
          'Conduct an OSINT exercise on a fictional company profile provided by the instructor. Document what you found, where you found it, and what an attacker could do with it.',
      },
      {
        n: 5,
        title: 'Web Application Security',
        theme: 'How Web Apps Get Hacked',
        sessions: [
          '• OWASP Top 10: the most common web vulnerabilities\n• SQL injection, XSS, broken authentication — how they work in practice\n• Using Burp Suite to inspect and test web traffic',
        ],
        deliverable:
          'Complete 3 OWASP WebGoat or DVWA challenges. For each, write: what the vulnerability is, how you exploited it, and how a developer should have prevented it.',
        aiAudit:
          'AI Audit: Ask AI to explain how to fix an XSS vulnerability. Then check its fix in a real (lab) environment. Does it actually close the vulnerability or leave gaps?',
      },
      {
        n: 6,
        title: 'Social Engineering',
        theme: 'The Human Vulnerability',
        sessions: [
          '• Phishing, vishing, smishing — how they work in Nigeria specifically\n• Pretexting and impersonation tactics\n• Building a security awareness programme that changes behaviour',
        ],
        deliverable:
          'Design a phishing simulation campaign for a fictional Nigerian company (on paper only — no real execution). Include the email template, the pretext, and the training response for employees who click.',
      },
      {
        n: 7,
        title: 'Network Security',
        theme: 'Defending the Perimeter and Inside It',
        sessions: [
          '• Firewalls, IDS/IPS, VPNs — what they do and what they do not\n• Network segmentation and why flat networks are dangerous\n• Monitoring network traffic for anomalies',
        ],
        deliverable:
          'Configure a basic firewall ruleset for a fictional Nigerian SME. Justify every rule: what it allows, what it blocks, and why.',
      },
      {
        n: 8,
        title: 'Vulnerability Assessment',
        theme: 'Finding Weaknesses Before Attackers Do',
        sessions: [
          '• Vulnerability scanning with Nmap and Nessus/OpenVAS\n• Understanding CVSS scores and risk prioritisation\n• Writing a vulnerability assessment report',
        ],
        deliverable:
          'Run a vulnerability scan on the instructor-provided lab environment. Write a professional assessment report: findings, severity ratings, and remediation recommendations in priority order.',
        aiChallenge:
          'Ask AI to interpret a CVSS score for you. Verify against the official CVSS documentation. Did AI correctly explain all the base metrics?',
      },
      {
        n: 9,
        title: 'Incident Response',
        theme: 'When It Goes Wrong',
        sessions: [
          '• Incident response lifecycle: prepare, detect, contain, eradicate, recover, learn\n• Forensics basics: preserving evidence without destroying it\n• Writing an incident report that holds up to scrutiny',
        ],
        deliverable:
          'Respond to a simulated incident scenario provided by the instructor. Write a full incident report following the IR lifecycle. Identify what the attacker did and how to prevent it next time.',
      },
      {
        n: 10,
        title: 'Compliance, Policy & Risk',
        theme: 'Security in Business Context',
        sessions: [
          '• NDPC (Nigeria Data Protection) and what it means for businesses\n• Writing security policies that people actually follow\n• Risk assessment: communicating security to executives who do not care about security',
        ],
        deliverable:
          'Write a basic information security policy for a small Nigerian business. Include password policy, data handling, acceptable use, and incident reporting procedure.',
        aiAudit:
          'AI Audit: Ask AI to write an NDPC compliance checklist. Verify against the actual NDPC regulations. What did AI get right? What was missing or wrong?',
      },
      {
        n: 11,
        title: 'Capstone Build Week',
        theme: 'Independent Project',
        sessions: [
          '• No new content — lab and report development week\n• Instructor technical reviews\n• Peer penetration testing exercises in controlled lab environments',
        ],
        deliverable:
          'Capstone first draft: a complete security assessment of the instructor-provided lab environment. Includes scope, methodology, findings, risk ratings, and remediation plan.',
      },
      {
        n: 12,
        title: 'Capstone Presentation + Career Prep',
        theme: 'Final Showcase',
        sessions: [
          '• Security report presentations\n• The cybersecurity job market in Nigeria: where the real jobs are\n• Certifications worth pursuing: CompTIA Security+, CEH, OSCP — an honest assessment',
        ],
        deliverable:
          'Final security assessment report (written) and a 10-minute technical presentation of findings. Portfolio published. Written reflection on how AI tools both help and create risks in cybersecurity work.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    code: 'DE-301',
    slug: 'data-engineering',
    name: 'Data Engineering',
    status: 'enrolling',
    isAdvanced: true,
    accent: 'cyan',
    icon: '🛠️',
    duration: '12 weeks',
    prerequisite:
      'Track A (Data Analytics) completion OR existing data analysts with 1+ year experience (portfolio review + 20-minute conversation with instructor required).',
    whatToExpect: [
      'A faster pace and a heavier workload than a standard specialisation (12–15 hours/week).',
      'Strong SQL and Python assumed from day one — you build pipelines, not spreadsheets.',
      'Entry is by application: either complete Data Analytics, or pass a placement assessment that proves equivalent experience.',
    ],
    hoursPerWeek: '12–15 hours',
    summary:
      'Data analysts answer questions. Data engineers build the systems that make answering questions possible at scale. This advanced track covers data pipeline architecture, warehousing, transformation, and infrastructure — the foundational layer that every data team depends on.',
    outcomes: [
      'Design and build reliable data pipelines using Python and SQL',
      'Architect a data warehouse using modern tools (dbt, BigQuery, or Supabase)',
      'Implement data quality monitoring and testing',
      'Orchestrate workflows using Apache Airflow or Prefect',
      'Understand data infrastructure cost, reliability, and governance trade-offs',
    ],
    careerPaths: [
      'Data Engineer',
      'ETL Developer',
      'Analytics Engineer',
      'Data Infrastructure Engineer',
      'Database Administrator',
    ],
    weeks: [
      {
        n: 1,
        title: 'Data Engineering Foundations',
        theme: '',
        sessions: [
          '• The modern data stack\n• ETL vs. ELT and why it matters\n• Data pipeline architecture patterns',
        ],
        deliverable:
          'Map a data pipeline for a realistic Nigerian business scenario: identify sources, transformations, and destination. Explain ETL vs. ELT choices.',
      },
      {
        n: 2,
        title: 'Python for Data Engineering',
        theme: '',
        sessions: [
          '• Advanced Python: generators, decorators, context managers\n• Working with APIs and file systems at scale\n• Error handling in long-running processes',
        ],
        deliverable:
          'Build a Python script that ingests data from an API and writes it to storage, with robust error handling for long-running processes.',
      },
      {
        n: 3,
        title: 'SQL at Scale',
        theme: '',
        sessions: [
          '• Performance optimisation: indexes, query plans, partitioning\n• Window functions and advanced analytics SQL\n• Database design for analytical workloads',
        ],
        deliverable:
          'Optimise a set of slow analytical queries. Document the before/after query plans and the performance gains.',
      },
      {
        n: 4,
        title: 'Data Ingestion',
        theme: '',
        sessions: [
          '• Batch ingestion vs. streaming\n• Building connectors to external data sources\n• Handling schema changes and late-arriving data',
        ],
        deliverable:
          'Build an ingestion connector to an external data source. Handle a deliberate schema change without breaking the pipeline.',
      },
      {
        n: 5,
        title: 'Data Transformation with dbt',
        theme: '',
        sessions: [
          '• dbt models, tests, and documentation\n• Staging, intermediate, and mart layers\n• Version controlling your data transformations',
        ],
        deliverable:
          'Build a dbt project with staging, intermediate, and mart layers, including tests and documentation, under version control.',
      },
      {
        n: 6,
        title: 'Data Warehousing',
        theme: '',
        sessions: [
          '• Dimensional modelling: facts, dimensions, slowly changing dimensions\n• BigQuery / Supabase for analytical workloads\n• Partitioning and clustering for performance',
        ],
        deliverable:
          'Design and build a dimensional model (facts + dimensions) for a Nigerian business scenario, with partitioning/clustering for performance.',
      },
      {
        n: 7,
        title: 'Data Quality & Testing',
        theme: '',
        sessions: [
          '• What data quality actually means in practice\n• Writing data tests with dbt and Great Expectations\n• Monitoring data freshness and completeness',
        ],
        deliverable:
          'Add a data quality test suite to your pipeline that monitors freshness and completeness, and alerts on failures.',
      },
      {
        n: 8,
        title: 'Workflow Orchestration',
        theme: '',
        sessions: [
          '• Apache Airflow: DAGs, operators, scheduling\n• Dependency management between pipeline stages\n• Handling failures, retries, and alerts',
        ],
        deliverable:
          'Orchestrate your pipeline with Airflow: build a DAG with dependencies, scheduling, retries, and failure alerts.',
      },
      {
        n: 9,
        title: 'Real-Time & Streaming Data',
        theme: '',
        sessions: [
          '• When you actually need streaming vs. batch\n• Apache Kafka basics\n• Stream processing with Python',
        ],
        deliverable:
          'Build a simple stream processing pipeline. Justify why streaming (not batch) is appropriate for your chosen use case.',
      },
      {
        n: 10,
        title: 'Infrastructure & Cost Management',
        theme: '',
        sessions: [
          '• Cloud data infrastructure: costs, scaling, and trade-offs\n• Data governance and access control at scale\n• Documentation that outlasts the engineer who wrote it',
        ],
        deliverable:
          'Write an infrastructure plan for your pipeline: cost estimate, scaling strategy, governance/access controls, and documentation.',
      },
      {
        n: 11,
        title: 'Capstone Build Week',
        theme: '',
        sessions: [
          '• Independent pipeline build\n• Instructor architecture reviews\n• Peer system reviews',
        ],
        deliverable:
          'Capstone first draft: an end-to-end data pipeline from ingestion to a queryable warehouse, with tests and orchestration.',
      },
      {
        n: 12,
        title: 'Capstone Presentation + Career Prep',
        theme: '',
        sessions: [
          '• End-to-end pipeline demonstrations\n• Data engineering portfolio\n• Career path: from analytics to engineering',
        ],
        deliverable:
          'Final pipeline demonstration. Data engineering portfolio published. Written reflection on architecture decisions and AI’s role in building the system.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    code: 'ML-301',
    slug: 'machine-learning',
    name: 'Machine Learning',
    status: 'enrolling',
    isAdvanced: true,
    accent: 'orange',
    icon: '🧠',
    duration: '12 weeks',
    prerequisite:
      'Data Engineering track completion OR equivalent demonstrated experience. Strong Python and statistics foundation required.',
    whatToExpect: [
      'The most demanding track we run (12–15 hours/week) — production ML, not notebook demos.',
      'A strong Python and statistics foundation is assumed and will be tested.',
      'Entry is by application: either complete Data Engineering, or pass a placement assessment that proves equivalent experience.',
    ],
    hoursPerWeek: '12–15 hours',
    summary:
      'Build machine learning systems that work in production — not just in notebooks. This track covers the full ML lifecycle from problem framing to deployment, with an emphasis on rigorous evaluation and knowing when machine learning is not the right answer.',
    outcomes: [
      'Frame business problems as machine learning problems — and know when not to',
      'Build, train, and evaluate supervised and unsupervised models',
      'Implement the full ML lifecycle: data → model → evaluation → deployment',
      'Monitor models in production and detect when they degrade',
      'Communicate model behaviour and limitations to non-technical stakeholders',
    ],
    careerPaths: [
      'ML Engineer',
      'AI Engineer',
      'Data Scientist',
      'Research Engineer',
      'MLOps Engineer',
    ],
    weeks: [
      {
        n: 1,
        title: 'ML Problem Framing',
        theme: '',
        sessions: [
          '• When ML is the right tool and when it is not\n• Translating business problems into ML problems\n• The cost of a wrong ML decision at scale',
        ],
        deliverable:
          'Take a Nigerian business problem and frame it as an ML problem — or argue why ML is the wrong tool. Justify your decision.',
      },
      {
        n: 2,
        title: 'Data Preparation for ML',
        theme: '',
        sessions: [
          '• Feature engineering and selection\n• Handling imbalanced datasets\n• Train/validation/test splits and why they matter',
        ],
        deliverable:
          'Prepare a dataset for modelling: engineer features, handle imbalance, and create proper train/validation/test splits. Document every choice.',
      },
      {
        n: 3,
        title: 'Supervised Learning: Regression',
        theme: '',
        sessions: [
          '• Linear regression from first principles\n• Regularisation: Ridge and Lasso\n• Evaluation: MAE, RMSE, R²',
        ],
        deliverable:
          'Build and evaluate a regression model. Report MAE, RMSE, and R², and explain what each tells you about the model.',
      },
      {
        n: 4,
        title: 'Supervised Learning: Classification',
        theme: '',
        sessions: [
          '• Logistic regression, decision trees, random forests\n• Evaluation: accuracy, precision, recall, F1, AUC-ROC\n• When each metric matters more',
        ],
        deliverable:
          'Build a classification model. Choose and justify the right evaluation metric for the business context, not just accuracy.',
      },
      {
        n: 5,
        title: 'Model Selection & Evaluation',
        theme: '',
        sessions: [
          '• Cross-validation properly\n• Hyperparameter tuning\n• The bias-variance trade-off in practice',
        ],
        deliverable:
          'Run proper cross-validation and hyperparameter tuning on a model. Document how you avoided overfitting to the validation set.',
      },
      {
        n: 6,
        title: 'Unsupervised Learning',
        theme: '',
        sessions: [
          '• Clustering: K-means, hierarchical, DBSCAN\n• Dimensionality reduction: PCA, t-SNE\n• Finding patterns without labels',
        ],
        deliverable:
          'Apply clustering and dimensionality reduction to an unlabelled dataset. Interpret the patterns you find for a business audience.',
      },
      {
        n: 7,
        title: 'Neural Networks & Deep Learning',
        theme: '',
        sessions: [
          '• How neural networks work — without glossing over the maths\n• PyTorch fundamentals\n• When deep learning beats classical ML and when it does not',
        ],
        deliverable:
          'Build and train a neural network in PyTorch. Compare its performance to a classical ML baseline and explain the difference.',
      },
      {
        n: 8,
        title: 'Natural Language Processing',
        theme: '',
        sessions: [
          '• Text preprocessing and representation\n• Transformers and fine-tuning pre-trained models\n• NLP for Nigerian languages: the state of the field',
        ],
        deliverable:
          'Fine-tune a pre-trained model for a text task. Reflect on the challenges of applying NLP to Nigerian languages.',
      },
      {
        n: 9,
        title: 'ML in Production',
        theme: '',
        sessions: [
          '• Serving models: REST APIs with FastAPI\n• Feature stores and inference pipelines\n• Versioning models and data together',
        ],
        deliverable:
          'Serve one of your models behind a FastAPI endpoint. Version the model and the data it was trained on together.',
      },
      {
        n: 10,
        title: 'MLOps & Model Monitoring',
        theme: '',
        sessions: [
          '• CI/CD for ML systems\n• Detecting data drift and model degradation\n• Retraining strategies and when to retrain',
        ],
        deliverable:
          'Add monitoring to your deployed model that detects data drift, and define a retraining strategy with clear triggers.',
      },
      {
        n: 11,
        title: 'Capstone Build Week',
        theme: '',
        sessions: [
          '• End-to-end ML project: data to deployed model\n• Instructor model reviews\n• Peer evaluation challenges',
        ],
        deliverable:
          'Capstone first draft: an end-to-end ML project from data to a deployed, monitored model solving a real problem.',
      },
      {
        n: 12,
        title: 'Capstone Presentation + Career Prep',
        theme: '',
        sessions: [
          '• ML portfolio presentations\n• Communicating model uncertainty to stakeholders\n• ML careers in Nigeria and globally',
        ],
        deliverable:
          'Final ML project presentation. Portfolio published. Written reflection on model limitations and how you communicated uncertainty to stakeholders.',
      },
    ],
  },
];

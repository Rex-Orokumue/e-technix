export interface UpcomingSession {
  title: string;
  date: string;
  time: string;
  meetLink: string;
  description: string;
}

export interface PastSession {
  id: number;
  title: string;
  date: string;
  duration: string;
  youtubeUrl: string;
  topics: string[];
}

export type ResourceType = 'document' | 'video' | 'link' | 'notion';

export interface Resource {
  title: string;
  description: string;
  url: string;
  type: ResourceType;
}

export interface ResourceCategory {
  name: string;
  icon: string;
  items: Resource[];
}

export interface Assignment {
  id: string;
  title: string;
  dueDate: string;
  description: string;
  status: 'active' | 'closed';
  guidelines?: string[];
}

// ── Update these as the programme progresses ─────────────────────────────────

export const upcomingSession: UpcomingSession | null = {
  title: 'Session 2 — Digital Tools & Google Workspace',
  date: 'Saturday, 7 June 2025',
  time: '10:00 AM WAT',
  meetLink: 'https://meet.google.com/your-meeting-link',
  description: 'We will dive into Google Workspace — Docs, Sheets, Drive organisation, and collaborative working. Come with your Google account ready.',
};

export const pastSessions: PastSession[] = [
  {
    id: 1,
    title: 'Session 1 — Programme Introduction & Setup',
    date: '31 May 2025',
    duration: '~2h',
    youtubeUrl: 'https://youtube.com/watch?v=your-session-1-link',
    topics: [
      'Welcome & programme overview',
      'How the 9-month curriculum is structured',
      'Tool setup — Notion, Google Drive, WhatsApp group',
      'What to expect in the Digital Foundations phase',
    ],
  },
];

export const resourceCategories: ResourceCategory[] = [
  {
    name: 'Session Documents',
    icon: '📄',
    items: [
      {
        title: 'Session 1 — Slide Deck',
        description: 'The slides used in the first session covering programme overview and setup.',
        url: 'https://drive.google.com/your-slide-deck-link',
        type: 'document',
      },
      {
        title: 'Programme Handbook',
        description: 'Full curriculum breakdown, rules, expectations, and track descriptions.',
        url: 'https://drive.google.com/your-handbook-link',
        type: 'document',
      },
    ],
  },
  {
    name: 'Video Resources',
    icon: '🎥',
    items: [
      {
        title: 'Notion Setup Walkthrough',
        description: 'Step-by-step guide to setting up your Notion workspace for the programme.',
        url: 'https://youtube.com/your-notion-walkthrough',
        type: 'video',
      },
    ],
  },
  {
    name: 'External Tutorials',
    icon: '🔗',
    items: [
      {
        title: 'Google Workspace Beginner Guide',
        description: 'Official Google guide to Docs, Sheets, Drive, and Gmail.',
        url: 'https://support.google.com/a/users/answer/9282958',
        type: 'link',
      },
    ],
  },
  {
    name: 'Notion Pages',
    icon: '📝',
    items: [
      {
        title: 'Programme Notion Workspace',
        description: 'Central Notion page with curriculum, notes, and student resources.',
        url: 'https://notion.so/your-workspace-link',
        type: 'notion',
      },
    ],
  },
];

export const assignments: Assignment[] = [
  {
    id: 'A01',
    title: 'Assignment 1 — Introduce Yourself',
    dueDate: '6 June 2025',
    status: 'active',
    description: 'Create a short Google Doc introducing yourself — your background, why you joined the programme, and what you hope to achieve in the next 9 months.',
    guidelines: [
      'Minimum 300 words',
      'Save in your Google Drive and share the link',
      'Include a photo or profile picture in the document',
      'Set sharing to "Anyone with the link can view"',
    ],
  },
];

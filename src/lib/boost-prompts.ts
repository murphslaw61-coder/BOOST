export const BOOST_SYSTEM_PROMPT = `You are BOOST — Booster Outreach & Organization Support Tool, a professional AI assistant built to support youth sports teams, booster clubs, coaches, and parent organizations.

Your mission is to help teams raise funds, communicate clearly, promote events, and build excitement through organized, ready-to-use materials.

You specialize in youth and school sports including football, baseball, softball, basketball, wrestling, soccer, hockey, cheer, lacrosse, and multi-sport programs.

You always deliver polished, copy-and-paste-ready outputs. Format your responses with clear headings, bullet points, and sections that are easy to read and use immediately.

SAFETY RULES:
- Do NOT encourage gambling or illegal raffles
- Do NOT provide legal, medical, or financial advice
- Do NOT use inappropriate language
- Do NOT guarantee fundraising results
- If a request is inappropriate, politely redirect to a safe alternative

Your personality: Positive, encouraging, community-focused, school-spirited, and age-appropriate. Sound like an experienced booster club leader who understands youth sports culture.`;

export const TOOL_PROMPTS: Record<string, string> = {
  fundraiser: `You are helping create a FUNDRAISER CAMPAIGN. Build a complete, step-by-step fundraiser plan that includes:
• Goal amount suggestions
• Timeline with key dates
• Materials needed
• Promotion plan
• Execution steps
• Volunteer roles

Types you can build: restaurant nights, sponsorship drives, merchandise fundraisers, tournament-based fundraisers, car washes, spirit wear sales, and more.

Always deliver a complete, actionable plan the user can start immediately.`,

  sponsor: `You are helping create SPONSOR MATERIALS. Build professional sponsor packets and outreach materials including:
• Sponsor tier structure (Bronze / Silver / Gold / Platinum with pricing suggestions)
• Sponsor benefit descriptions for each tier
• Formal sponsor outreach letter
• Casual sponsor email
• Social media sponsor shoutout copy
• Thank-you message templates

All materials must be written for easy pasting into Canva or Google Docs.`,

  social: `You are helping create SOCIAL MEDIA CONTENT for youth sports. Create polished, ready-to-post content for:
• Facebook, Instagram, X (Twitter), and team websites

Always include:
• Full caption text
• Optional relevant emojis
• 5-10 hashtag suggestions
• Platform-specific formatting notes

Content types: tournament hype posts, game-day announcements, player spotlights, fundraiser promotions, end-of-season recaps, win celebrations.`,

  communication: `You are helping create PARENT & TEAM COMMUNICATIONS. Write clear, professional messages including:
• Email announcements
• Group text / band app messages
• Volunteer sign-up messages
• Schedule updates
• Policy reminders
• Travel and tournament info sheets

Always match the requested tone: Professional, Friendly, Urgent, or Celebratory.
Include subject lines for emails. Keep group texts under 160 characters when possible.`,

  hype: `You are helping create HYPE CONTENT & VISUAL PROMPTS including:
• 15–30 second hype video scripts (with timing cues)
• Countdown posts for upcoming events
• Graphic text for posters and flyers (bold, punchy lines)
• Detailed image prompts compatible with Canva and AI image generators

For image prompts include: subject description, style/mood, colors, layout notes, and Canva template suggestions.

Make everything energetic, motivating, and school-spirited.`,
};

export type ToolType = "fundraiser" | "sponsor" | "social" | "communication" | "hype";

export interface Tool {
  id: ToolType;
  name: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  placeholder: string;
  examples: string[];
}

export const TOOLS: Tool[] = [
  {
    id: "fundraiser",
    name: "Fundraiser Builder",
    description: "Step-by-step fundraiser campaigns with goals, timelines, and execution plans",
    icon: "💰",
    color: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    placeholder: "Describe your fundraiser goal, sport, and team details...",
    examples: [
      "Build a restaurant night fundraiser for our 8U baseball team, goal $500",
      "Create a sponsorship drive plan for a high school football team, goal $5,000",
      "Design a merchandise fundraiser for youth soccer, selling spirit wear",
      "Plan a tournament fundraiser for our middle school basketball team",
    ],
  },
  {
    id: "sponsor",
    name: "Sponsor Packet Creator",
    description: "Professional sponsor tiers, outreach letters, and thank-you templates",
    icon: "🤝",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    placeholder: "Tell us about your team and what sponsor materials you need...",
    examples: [
      "Create a full sponsor packet for our high school wrestling program",
      "Write a sponsor outreach email for a youth football booster club",
      "Build Bronze/Silver/Gold/Platinum tiers for a softball league",
      "Write social media sponsor shoutout templates for Instagram",
    ],
  },
  {
    id: "social",
    name: "Social Media Content",
    description: "Game-day posts, tournament hype, player spotlights, and fundraiser promos",
    icon: "📱",
    color: "text-purple-700",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    placeholder: "Describe the post you need — sport, event, platform, and tone...",
    examples: [
      "Create a tournament hype post for Instagram for our lacrosse team",
      "Write a player spotlight post for our senior quarterback on Facebook",
      "Make a fundraiser announcement post for X/Twitter and Instagram",
      "Create a game-day hype series (3 posts) for a basketball playoff run",
    ],
  },
  {
    id: "communication",
    name: "Parent & Team Comms",
    description: "Emails, group texts, volunteer messages, schedules, and travel info",
    icon: "📣",
    color: "text-orange-700",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    placeholder: "Describe the communication you need to send and to whom...",
    examples: [
      "Write a professional email to parents about upcoming tournament travel",
      "Create a volunteer sign-up message for our fall concession stand",
      "Write a friendly reminder about fundraiser deadline for group text",
      "Draft an urgent weather cancellation notice for tonight's game",
    ],
  },
  {
    id: "hype",
    name: "Hype Content & Visuals",
    description: "Video scripts, countdown posts, poster text, and AI image prompts",
    icon: "🎬",
    color: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    placeholder: "Describe the hype content you need — video, poster, countdown...",
    examples: [
      "Write a 30-second hype video script for our football team's playoff game",
      "Create image prompts for a tournament poster for youth baseball",
      "Make a 5-day countdown post series for our season opener",
      "Write bold poster text for a wrestling senior night event",
    ],
  },
];

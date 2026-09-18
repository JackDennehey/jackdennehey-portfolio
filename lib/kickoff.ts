export const KICKOFF_URL = 'https://kickoff.jackdennehey.com'
export const KICKOFF_ASSET_BASE = '/images/Kickoff'

export const KICKOFF_COPY = {
  title: 'Kickoff',
  subtitle: 'Football Intelligence Platform',
  status: 'Live product',
  role: 'Designer and developer',
  version: 'Kickoff v1.0 Public Beta',
  modelVersion: 'Model v0.2',
  shortDescription:
    'A full-stack football intelligence platform combining predictive modeling, historical NFL data, walk-forward evaluation, and AI-powered research.',
  intro:
    'Kickoff is a football intelligence platform I designed and developed to explore the intersection of predictive modeling, historical sports data, and AI-powered research.',
  overview:
    'It combines an independently evaluated prediction model with structured football data and an AI research interface, packaged as a production web application.',
  liveProduct:
    'The public product includes a 2026 schedule with Model v0.2 probabilities, matchup pages, a model dashboard, walk-forward history, team pages with latest-available roster snapshots, and Ask Kickoff for structured research.',
  model:
    'Kickoff uses a leakage-safe logistic-regression model evaluated with walk-forward historical testing. Features are built from information available before each game, then scored on later seasons rather than on the same sample used to fit the model.',
  modelHonesty:
    'A simple entering-record baseline achieved approximately 63.8% straight-up accuracy on the same sample. Kickoff does not currently beat that baseline on straight-up accuracy. It does perform better on proper probabilistic scoring metrics such as Brier score and log loss. That comparison is part of the project, not a footnote.',
  ask:
    'Ask Kickoff uses AI to interpret natural-language football questions, but the language model is not treated as the source of football facts. Structured tools retrieve historical games, player statistics, roster snapshots, postseason information, and Kickoff model artifacts before the final response is generated.',
  askUnsupported:
    'Unsupported questions are rejected rather than answered from model memory. Ask is intentionally limited to supported structured research.',
  engineering:
    'Kickoff is a Next.js TypeScript application with server-side OpenAI integration, deterministic tool calling, historical data normalization, and versioned model artifacts. The work was turning an experimental prediction system into a usable public product.',
  data:
    'Historical games, player statistics, and roster information come from nflverse and are used under CC-BY 4.0. Kickoff normalizes that data into deterministic application tools. Kickoff does not own nflverse data.',
  production:
    'The public site is deployed on Vercel at a custom subdomain. API secrets stay server-only. Ask includes rate limiting, concurrency protection, daily safety limits, a kill switch, bounded tool calls, bounded question length, and request timeouts. Production debug routes are disabled, and an automated test suite covers the core behavior.',
  lifecycleNote:
    'Kickoff was not only a model notebook. The project moved from concept and data work through evaluation, product design, research tooling, testing, and public deployment.',
  independence:
    'Kickoff is an independent project and is not affiliated with or endorsed by the NFL or its clubs.',
  metrics: [
    { label: 'Historical games evaluated', value: '1,865' },
    { label: 'Official evaluation range', value: '2019–2025' },
    { label: 'Walk-forward straight-up accuracy', value: '63.0%' },
    { label: 'Brier score', value: '0.2274' },
    { label: 'Automated tests', value: '133+' },
    { label: 'Production prediction model', value: 'Model v0.2' },
  ],
  evaluation: {
    sample: '2019–2025, 1,865 decided regular-season games',
    accuracy: '63.0%',
    brier: '0.2274',
    logLoss: '0.6470',
    ece: '0.0321',
    baseline: 'approximately 63.8% straight-up accuracy',
  },
  askFlow: [
    'User question',
    'AI interpretation',
    'Deterministic tools',
    'Structured football / model data',
    'Evidence',
    'Answer',
  ],
  askCapabilities: [
    'Historical football research',
    'Player and game statistics',
    'Postseason research',
    'Latest available roster snapshots',
    'Kickoff model questions',
    'Conversational follow-ups',
  ],
  engineeringGroups: [
    {
      title: 'Application',
      items: [
        'Next.js application architecture',
        'TypeScript throughout the product',
        'Mobile-responsive interface',
        'Dark mode',
        'Accessibility-minded UI',
      ],
    },
    {
      title: 'Model and data',
      items: [
        'Historical data normalization',
        'nflverse integration',
        'Leakage-safe feature construction',
        'Model artifact loading',
        'Walk-forward evaluation',
        'Roster snapshot pipeline',
      ],
    },
    {
      title: 'Ask and operations',
      items: [
        'Server-side OpenAI integration',
        'Deterministic AI tool calling',
        'Production rate limiting',
        'API security',
        'Automated testing',
        'Vercel and custom-domain deployment',
      ],
    },
  ],
  productionControls: [
    'Production Vercel deployment',
    'Custom subdomain',
    'Server-only API secrets',
    'Ask rate limiting',
    'Concurrency protection',
    'Daily safety limits',
    'Ask kill switch',
    'Bounded tool calls',
    'Bounded question length',
    'Request timeouts',
    'Production debug routes disabled',
    'Automated test suite',
  ],
  lifecycle: [
    'Concept',
    'Data pipeline',
    'Model',
    'Backtesting',
    'Product',
    'AI research',
    'Testing',
    'Deployment',
  ],
  technologies: [
    'Next.js',
    'TypeScript',
    'Machine Learning',
    'OpenAI',
    'Data Engineering',
    'AI',
    'Vercel',
  ],
  limitations: [
    'Model v0.2 does not beat the entering-record baseline on straight-up accuracy.',
    '2026 predictions are preseason snapshots.',
    'Latest roster data represents an available preseason snapshot, not a guaranteed final Week 1 roster.',
    'No live odds.',
    'No injury modeling.',
    'No live scores.',
    'Ask is intentionally limited to supported structured research.',
  ],
  screenshots: [
    {
      id: 'games',
      title: 'Week 1 games board',
      src: `${KICKOFF_ASSET_BASE}/kickoff2.png`,
      alt: 'Kickoff Games page for 2026 Week 1, with week summary metrics, a featured Browns–Jaguars matchup, Model v0.2 sidebar, and upcoming games with win probabilities.',
    },
    {
      id: 'matchup',
      title: 'Matchup prediction detail',
      src: `${KICKOFF_ASSET_BASE}/kickoff1.png`,
      alt: 'Kickoff matchup page for Cowboys vs Giants showing 59–41 win probability, projected score, Model v0.2 tag, and the largest model inputs.',
    },
    {
      id: 'model',
      title: 'Model evaluation dashboard',
      src: `${KICKOFF_ASSET_BASE}/kickoff3.png`,
      alt: 'Kickoff Model dashboard for v0.2 with 63.0% backtest accuracy, Brier score, log loss, version comparison, and a baseline chart that includes the entering-record rule.',
    },
    {
      id: 'team',
      title: 'Team outlook and roster',
      src: `${KICKOFF_ASSET_BASE}/kickoff4.png`,
      alt: 'Philadelphia Eagles team page with Week 1–6 win probabilities, Jalen Hurts quarterback context, and an expandable roster snapshot.',
    },
  ],
  links: [
    {
      label: 'Launch Kickoff',
      href: KICKOFF_URL,
      kind: 'website' as const,
    },
  ],
} as const

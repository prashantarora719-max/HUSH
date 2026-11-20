// Fictional sample accounts so the team can review the experience before an
// API key is added. None of these companies or events are real.

const S = (category, title, detail, date, strength, navigator_angle) => ({
  category, title, detail, date, strength, navigator_angle, source_name: 'Sample data', source_url: '',
});
const R = (title, team, location, needs_seat = true) => ({ title, team, location, url: '', needs_seat });

export const DEMO_ACCOUNTS = [
  {
    name: 'Northwind Logistics (sample)', website: 'northwind.example', seats: 40,
    brief: {
      company_summary: 'Mid-market freight and supply chain software provider with roughly 1,800 employees across North America and Europe.',
      open_gtm_roles: [
        R('Enterprise Account Executive', 'Sales', 'Chicago'), R('Enterprise Account Executive', 'Sales', 'London'),
        R('Mid-Market Account Executive', 'Sales', 'Remote US'), R('Mid-Market Account Executive', 'Sales', 'Remote US'),
        R('Sales Development Representative', 'Sales Development', 'Austin'), R('Sales Development Representative', 'Sales Development', 'Austin'),
        R('Sales Development Representative', 'Sales Development', 'Dublin'), R('SDR Team Lead', 'Sales Development', 'Austin'),
        R('Strategic Account Manager', 'Account Management', 'New York'), R('Partner Manager, EMEA', 'Partnerships', 'Amsterdam'),
        R('Regional Sales Director, DACH', 'Sales', 'Munich'), R('Revenue Operations Analyst', 'RevOps', 'Chicago', false),
      ],
      gtm_roles_total_estimate: 14,
      signals: [
        S('gtm_hiring', '12 open GTM roles, 11 of them seat-eligible', 'Careers page lists AE, SDR, account management and partner roles across five cities, including a new SDR pod in Austin.', '2026-11', 3, 'Each new prospecting hire needs a seat from day one; the Austin SDR pod alone is four seats.'),
        S('acquisition', 'Acquired CargoPath, a 220-person visibility platform', 'Deal closed in September; CargoPath brings its own 30-person sales team that is being merged into the Northwind org.', '2026-09', 3, 'The acquired sales team is likely on different tooling: a consolidation and add-on conversation in one.'),
        S('leadership', 'New Chief Revenue Officer appointed', 'A new CRO joined from a larger logistics software company with a mandate to build an enterprise segment.', '2026-10', 3, 'New revenue leaders review the sales stack in their first quarter. Get on their calendar early.'),
        S('expansion', 'Opening a DACH regional office in Munich', 'Press release announces a Munich hub and a first regional sales director hire.', '2026-10', 2, 'A new territory with no existing relationships is the textbook Sales Navigator use case.'),
      ],
      talk_track: [
        'You are adding about a dozen sellers this quarter. Seats provisioned at start date shorten ramp instead of trailing it.',
        'The CargoPath team is joining your org. Putting both sales teams on one prospecting workflow avoids account overlap.',
        'Munich is a greenfield market: your new director will need to map buying committees from scratch.',
        'A new CRO usually wants pipeline visibility quickly. Shared account lists and usage reporting give that.',
      ],
      email: {
        subject: 'Seats for the new hires and the CargoPath team',
        body: 'Hi [Name],\n\nCongratulations on closing the CargoPath acquisition and on the Munich launch. A lot is changing on the revenue side at once.\n\nI noticed you have around a dozen sales and SDR roles open, on top of the CargoPath sellers joining. I wanted to get ahead of it so that new starters have Sales Navigator on day one rather than waiting on a mid-quarter request, and so both teams work from the same account lists.\n\nCould we take 20 minutes next week to map expected headcount against your current 40 seats? I can come with a simple plan you can share with your new CRO.\n\nBest,\n[Your name]',
      },
      confidence: 'high', caveats: 'Sample data for demonstration only.',
    },
  },
  {
    name: 'Halcyon Health Systems (sample)', website: 'halcyonhealth.example', seats: 25,
    brief: {
      company_summary: 'Healthcare workflow software vendor selling to hospital groups, around 900 employees.',
      open_gtm_roles: [
        R('Account Executive, Provider', 'Sales', 'Boston'), R('Account Executive, Payer', 'Sales', 'Remote US'),
        R('Business Development Representative', 'Sales Development', 'Nashville'), R('Business Development Representative', 'Sales Development', 'Nashville'),
        R('Customer Success Manager', 'Customer Success', 'Remote US'), R('VP Sales, Payer Segment', 'Sales', 'Remote US'),
        R('Sales Enablement Manager', 'Enablement', 'Boston', false),
      ],
      gtm_roles_total_estimate: 7,
      signals: [
        S('funding_growth', 'Raised a $90M Series D', 'Funding announced with proceeds earmarked for commercial expansion into the payer market.', '2026-08', 3, 'Fresh budget explicitly tied to sales expansion. Timing favours an expansion conversation.'),
        S('gtm_hiring', '7 open GTM roles including a new segment VP', 'Hiring a VP Sales for a brand-new payer segment plus AEs and BDRs.', '2026-11', 2, 'A new segment team starts with zero pipeline and needs seats to build one.'),
        S('expansion', 'Launching a payer-facing product line', 'Product announcement describes a move from providers into insurers.', '2026-09', 2, 'New buyer personas the current team has no relationships with.'),
      ],
      talk_track: [
        'The Series D is aimed at commercial expansion, and the payer team is being built from scratch.',
        'Payer buyers are a new audience for your sellers: mapping those committees is where Sales Navigator earns its keep.',
        'Six seat-eligible hires are open today against 25 seats. Planning now avoids a gap when they start.',
      ],
      email: {
        subject: 'Setting up the payer team for a fast start',
        body: 'Hi [Name],\n\nCongratulations on the Series D and the payer launch.\n\nSince you are building a new segment team, I wanted to make sure seats are not the thing that slows them down. A new team prospecting into insurers will lean heavily on account mapping in the first 90 days.\n\nWould it be useful to look at your hiring plan together and size what the payer team needs alongside your current 25 seats?\n\nBest,\n[Your name]',
      },
      confidence: 'high', caveats: 'Sample data for demonstration only.',
    },
  },
  {
    name: 'Brightforge Manufacturing (sample)', website: 'brightforge.example', seats: 60,
    brief: {
      company_summary: 'Industrial components manufacturer with a direct and distributor sales model, about 4,500 employees.',
      open_gtm_roles: [
        R('Regional Sales Manager', 'Sales', 'Ohio'), R('Key Account Manager', 'Sales', 'Texas'),
        R('Inside Sales Representative', 'Inside Sales', 'Ohio'), R('Channel Partner Manager', 'Channel', 'Remote US'),
      ],
      gtm_roles_total_estimate: 4,
      signals: [
        S('subsidiary', 'Formed Brightforge Energy Solutions', 'New wholly owned subsidiary created to sell into the renewables sector with its own commercial team.', '2026-07', 3, 'A subsidiary with its own sales team is a separate seat pool, and often a separate budget holder.'),
        S('acquisition', 'Acquired a regional distributor', 'Purchase of a 60-person distributor in the Southwest announced in the spring.', '2026-04', 2, 'Field reps from the distributor now sell under the Brightforge name and may have no seats.'),
        S('gtm_hiring', '4 open sales roles', 'Steady backfill-level hiring across field and inside sales.', '2026-11', 1, 'Modest, but adds to the subsidiary and distributor seat question.'),
      ],
      talk_track: [
        'Brightforge Energy Solutions is building its own commercial team for a sector where you have few existing contacts.',
        'The distributor acquisition added field sellers who are probably outside your current 60 seats.',
        'Worth asking who owns tooling decisions for the new subsidiary before it buys separately.',
      ],
      email: {
        subject: 'Sales Navigator for the Energy Solutions team',
        body: 'Hi [Name],\n\nI saw that Brightforge Energy Solutions is now up and running. Congratulations.\n\nNew business units often end up sourcing their own tools, which can leave you with separate contracts and no shared view of accounts. Before that happens, could we talk through whether the Energy team and the sellers who joined through the distributor acquisition should sit under your existing agreement?\n\nHappy to work around your calendar.\n\nBest,\n[Your name]',
      },
      confidence: 'medium', caveats: 'Sample data for demonstration only.',
    },
  },
  {
    name: 'Quillstone Software (sample)', website: 'quillstone.example', seats: 15,
    brief: {
      company_summary: 'Document automation SaaS for legal teams, around 300 employees.',
      open_gtm_roles: [R('Account Executive', 'Sales', 'Remote UK'), R('Sales Development Representative', 'Sales Development', 'London')],
      gtm_roles_total_estimate: 2,
      signals: [
        S('leadership', 'New VP of Sales joined', 'Announced on the company blog; previously led a 40-person sales team.', '2026-10', 2, 'A leader used to a larger team may plan to scale; worth an introduction.'),
        S('gtm_hiring', '2 open sales roles', 'One AE and one SDR role listed.', '2026-11', 1, 'Small but real: two seats.'),
      ],
      talk_track: [
        'A new VP of Sales is a natural moment to review how the team prospects.',
        'Two roles are open; an introduction now positions seats ahead of any larger hiring plan.',
      ],
      email: {
        subject: 'Introduction and a quick review',
        body: 'Hi [Name],\n\nWelcome to Quillstone. I look after the team\'s Sales Navigator account and wanted to introduce myself.\n\nI would be glad to walk you through how the team is using it today and hear what you are planning for the next two quarters, so we can make sure it supports where you want to take the team.\n\nBest,\n[Your name]',
      },
      confidence: 'medium', caveats: 'Sample data for demonstration only.',
    },
  },
  {
    name: 'Verdant Retail Group (sample)', website: 'verdantretail.example', seats: 30,
    brief: {
      company_summary: 'Retail technology and payments provider, about 2,200 employees.',
      open_gtm_roles: [R('Account Manager', 'Account Management', 'Toronto')],
      gtm_roles_total_estimate: 1,
      signals: [
        S('risk', 'Announced an 8% workforce reduction', 'Restructuring announced with reductions concentrated in commercial and marketing functions.', '2026-10', 3, 'An add-on pitch now would land badly. Focus on protecting the renewal and showing value per seat.'),
        S('risk', 'Hiring freeze outside engineering', 'Reported alongside the restructuring.', '2026-10', 2, 'Seat demand is more likely to shrink than grow in the near term.'),
        S('funding_growth', 'Payments revenue grew year on year', 'Latest results show the payments unit growing while core retail software declined.', '2026-08', 1, 'If any team expands later, it will be payments.'),
      ],
      talk_track: [
        'Lead with adoption and value, not expansion: confirm which seats are active after the restructuring.',
        'Offer to reassign unused seats to the payments team, where the growth is.',
        'Revisit an add-on conversation only once the freeze lifts.',
      ],
      email: {
        subject: 'Making sure your seats are working for you',
        body: 'Hi [Name],\n\nI know it has been a demanding few weeks. I wanted to offer something practical: a quick review of seat usage so that every licence is with someone actively using it, and to reassign any that have gone unused.\n\nNo agenda beyond making sure you are getting full value. Let me know if that would help.\n\nBest,\n[Your name]',
      },
      confidence: 'high', caveats: 'Sample data for demonstration only.',
    },
  },
  { name: 'Ironbark Analytics (sample)', website: 'ironbark.example', seats: 20, brief: null },
];

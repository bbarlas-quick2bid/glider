// AI prompt templates

export function buildActionExtractionPrompt(email: {
  from: string;
  subject: string;
  date: string;
  body: string;
}): string {
  return `You are an expert executive assistant analyzing emails to extract actionable tasks.

Your task: Analyze the email below and extract concrete action items that the recipient needs to complete.

Guidelines:
- Only extract explicit action items (requests, tasks, deadlines)
- Ignore general information or FYI content
- Each action item should be specific and actionable
- Estimate priority (high/medium/low) based on urgency cues (deadlines, "ASAP", "urgent", sender importance)
- Estimate time to complete (e.g., "5 minutes", "1 hour", "2 days")
- Categorize each action: response_needed, meeting_request, task, decision_required, follow_up
- Extract deadlines if mentioned (format: YYYY-MM-DD)

Email Details:
<email>
From: ${email.from}
Subject: ${email.subject}
Date: ${email.date}
Body: ${email.body}
</email>

Respond ONLY with valid JSON matching this exact schema:
{
  "actionItems": [
    {
      "description": "string",
      "priority": "high" | "medium" | "low",
      "estimatedTime": "string",
      "category": "response_needed" | "meeting_request" | "task" | "decision_required" | "follow_up",
      "deadline": "YYYY-MM-DD" | null
    }
  ],
  "hasActionItems": boolean
}`;
}

export function buildRecommendationPrompt(email: {
  from: string;
  subject: string;
  body: string;
  actionItems: any[];
}): string {
  const actionItemsStr = JSON.stringify(email.actionItems, null, 2);

  return `You are an expert executive assistant helping users decide the best next action for each email.

Your task: Analyze the email and its extracted action items, then recommend the single best next step.

Recommendation Types:
1. "reply" - Draft a response (provide key points to address)
2. "schedule_meeting" - Set up a meeting (suggest participants and purpose)
3. "delegate" - Forward to someone else (suggest who and why)
4. "archive" - No action needed (explain why it's informational)
5. "follow_up" - Remind to check later (suggest when)
6. "prioritize" - Urgent attention required (explain urgency)

Email Context:
<email>
From: ${email.from}
Subject: ${email.subject}
Body: ${email.body}
Action Items: ${actionItemsStr}
</email>

Respond ONLY with valid JSON matching this exact schema:
{
  "recommendedAction": "reply" | "schedule_meeting" | "delegate" | "archive" | "follow_up" | "prioritize",
  "reason": "string (1-2 sentences explaining why this action is recommended)",
  "confidence": "high" | "medium" | "low",
  "suggestedDetails": {
    "keyPoints": ["string"] (if reply),
    "suggestedAttendees": ["string"] (if schedule_meeting),
    "purpose": "string" (if schedule_meeting),
    "suggestedDate": "YYYY-MM-DD" (if follow_up)
  },
  "sentiment": "positive" | "neutral" | "urgent" | "negative",
  "summary": "string (one-line summary of the email, max 100 chars)"
}`;
}

export function buildBatchAnalysisPrompt(emails: Array<{
  id: string;
  from: string;
  subject: string;
  date: string;
  body: string;
}>): string {
  const emailsXml = emails.map((email, idx) => `
<email id="${email.id}" index="${idx}">
From: ${email.from}
Subject: ${email.subject}
Date: ${email.date}
Body: ${email.body.substring(0, 1500)}
</email>`).join('\n');

  return `You are an expert executive assistant analyzing multiple emails at once.

Your task: For each email below, extract action items AND provide a recommendation for the best next step.

Guidelines for action items:
- Only extract explicit action items (requests, tasks, deadlines)
- Estimate priority (high/medium/low) based on urgency
- Categorize: response_needed, meeting_request, task, decision_required, follow_up

Guidelines for recommendations:
- Choose one: reply, schedule_meeting, delegate, archive, follow_up, prioritize
- Provide brief reason (1-2 sentences)
- Assess sentiment: positive, neutral, urgent, negative
- Write one-line summary (max 100 chars)

Emails:
<emails>
${emailsXml}
</emails>

Respond ONLY with valid JSON - an array with one analysis per email:
[
  {
    "emailId": "string",
    "actionItems": [
      {
        "description": "string",
        "priority": "high" | "medium" | "low",
        "estimatedTime": "string",
        "category": "response_needed" | "meeting_request" | "task" | "decision_required" | "follow_up",
        "deadline": "YYYY-MM-DD" | null
      }
    ],
    "hasActionItems": boolean,
    "recommendedAction": "reply" | "schedule_meeting" | "delegate" | "archive" | "follow_up" | "prioritize",
    "reason": "string",
    "confidence": "high" | "medium" | "low",
    "suggestedDetails": {},
    "sentiment": "positive" | "neutral" | "urgent" | "negative",
    "summary": "string"
  }
]`;
}

import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { action, tasks, calendarId, baileyEmail } = req.body;

    if (!action || !tasks || !Array.isArray(tasks)) {
      return res.status(400).json({
        success: false,
        message: "Missing or invalid required fields: action, tasks (array)",
      });
    }

    if (action === "sync") {
      const calendarEvents = tasks.map(task => ({
        summary: `[${task.org}] ${task.title}${task.assignee !== "Self" ? ` (→ ${task.assignee})` : ""}`,
        description: `${task.description}\n\nEstimated Hours: ${task.hours}`,
        startTime: new Date().toISOString(),
      }));

      const response = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        messages: [
          {
            role: "user",
            content: `Create Google Calendar events for these tasks:\n${JSON.stringify(calendarEvents, null, 2)}`,
          },
        ],
        mcp_servers: [
          {
            type: "url",
            url: "https://calendarmcp.googleapis.com/mcp/v1",
            name: "google-calendar",
          },
        ],
      });

      return res.status(200).json({
        success: true,
        action: "sync",
        eventsCreated: tasks.length,
        message: `Created ${tasks.length} calendar events`,
      });
    } else if (action === "notify") {
      const baileyTasks = tasks.filter(t => t.assignee === "Bailey Monaghan");

      if (baileyTasks.length > 0) {
        const response = await client.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1024,
          messages: [
            {
              role: "user",
              content: `Send email notifications to ${baileyEmail} for these tasks:\n${JSON.stringify(baileyTasks, null, 2)}`,
            },
          ],
          mcp_servers: [
            {
              type: "url",
              url: "https://gmailmcp.googleapis.com/mcp/v1",
              name: "gmail",
            },
          ],
        });
      }

      return res.status(200).json({
        success: true,
        action: "notify",
        emailsSent: baileyTasks.length,
        message: `Sent ${baileyTasks.length} task notifications`,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid action",
      });
    }
  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

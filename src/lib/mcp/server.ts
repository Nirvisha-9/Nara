import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { children, dailyLogs, crisisEvents, milestones } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

export function buildMcpServer(userId: string): McpServer {
  const server = new McpServer({ name: "nara-mcp", version: "1.0.0" });

  // Tool: list child profiles
  server.tool(
    "list_children",
    "List all child profiles for this parent",
    {},
    async () => {
      const kids = await db.select().from(children).where(eq(children.parentUserId, userId));
      return { content: [{ type: "text", text: JSON.stringify(kids) }] };
    }
  );

  // Tool: get daily logs
  server.tool(
    "get_daily_logs",
    "Get recent daily logs for a child",
    { childId: z.string().describe("The child's ID") },
    async ({ childId }) => {
      const logs = await db.select().from(dailyLogs)
        .where(and(eq(dailyLogs.childId, childId), eq(dailyLogs.parentUserId, userId)))
        .orderBy(desc(dailyLogs.createdAt))
        .limit(10);
      return { content: [{ type: "text", text: JSON.stringify(logs) }] };
    }
  );

  // Tool: get crisis events
  server.tool(
    "get_crisis_events",
    "Get recent crisis events for a child",
    { childId: z.string().describe("The child's ID") },
    async ({ childId }) => {
      const events = await db.select().from(crisisEvents)
        .where(and(eq(crisisEvents.childId, childId), eq(crisisEvents.parentUserId, userId)))
        .orderBy(desc(crisisEvents.createdAt))
        .limit(10);
      return { content: [{ type: "text", text: JSON.stringify(events) }] };
    }
  );

  // Tool: log a daily entry
  server.tool(
    "log_daily_entry",
    "Log a daily entry for a child",
    {
      childId: z.string(),
      emotion: z.string().optional(),
      win: z.string().optional(),
      hardMoment: z.string().optional(),
      energyLevel: z.number().min(1).max(5).optional(),
    },
    async ({ childId, emotion, win, hardMoment, energyLevel }) => {
      const today = new Date().toLocaleDateString("en-US");
      const [log] = await db.insert(dailyLogs).values({
        childId, parentUserId: userId, date: today, emotion, win, hardMoment, energyLevel,
        naraResponse: "Logged via AI assistant.",
      }).returning();
      return { content: [{ type: "text", text: JSON.stringify(log) }] };
    }
  );

  // Tool: add milestone
  server.tool(
    "add_milestone",
    "Celebrate a milestone for a child",
    {
      childId: z.string(),
      title: z.string().describe("The milestone to celebrate"),
      description: z.string().optional(),
    },
    async ({ childId, title, description }) => {
      const [milestone] = await db.insert(milestones)
        .values({ childId, parentUserId: userId, title, description })
        .returning();
      return { content: [{ type: "text", text: JSON.stringify(milestone) }] };
    }
  );

  return server;
}

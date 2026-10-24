#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { READONLY } from "./core.js";
import { register as read } from "./tools/read.js";
import { register as people } from "./tools/people.js";
import { register as classes } from "./tools/classes.js";
import { register as exams } from "./tools/exams.js";
import { register as money } from "./tools/money.js";
import { register as content } from "./tools/content.js";

const server = new McpServer(
  { name: "aspire-academy", version: "1.0.0" },
  {
    instructions:
      "You run Aspire Science Academy, a coaching institute. Use these tools for students, teachers, batches, timetable, attendance, exams and marks, fees, accounts (income, expenses, teacher pay, profit/loss), announcements, homework, study material and doubts. " +
      "Students and teachers can be named by name or mobile number. Money is in rupees. Dates are YYYY-MM-DD, months YYYY-MM. " +
      "Before any delete, tell the user what will be deleted and wait for their yes, then call again with confirm=true. " +
      "Messages to parents are only drafted (text + WhatsApp link), never sent. " +
      (READONLY ? "This server is in READ-ONLY mode: you can look at data but not change it." : ""),
  }
);

for (const r of [read, people, classes, exams, money, content]) r(server);

await server.connect(new StdioServerTransport());
console.error(`aspire-academy MCP ready${READONLY ? " (read-only)" : ""}`);

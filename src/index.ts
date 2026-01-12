import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";
import { z } from "zod";

// Define our MCP agent with tools
export class MyMCP extends McpAgent {
	server = new McpServer({
		name: "pickleball-mcp",
		version: "1.0.0",
	}, {
		instructions: "You are a pickleball player. You are given a game and you need to help the player win the game.".trim(),
	});

	async init() {
		this.server.registerTool(
			'get-pickleball-tip',
			{
				title: 'Pickleball Tip Generator',
				description: 'Get helpful pickleball tips for different aspects of the game',
				inputSchema: {
					category: z.enum(["serving", "dinking", "strategy", "positioning"]).describe("The category of tip to get")
				},
				outputSchema: { tip: z.string() }
			},
			async ({ category }) => {
				const tips = {
					serving: "Keep your serve deep to push opponents back!",
					dinking: "Stay patient in the kitchen - don't rush your dinks!",
					strategy: "When in doubt, hit it to the middle!",
					positioning: "Stay parallel with your partner on the court!"
				};
				
				const output = { tip: tips[category] };
				return {
					content: [{ type: 'text', text: JSON.stringify(output) }],
					structuredContent: output
				};
			}
		);
	}
}

export default {
	fetch(request: Request, env: Env, ctx: ExecutionContext) {
		const url = new URL(request.url);

		if (url.pathname === "/sse" || url.pathname === "/sse/message") {
			return MyMCP.serveSSE("/sse").fetch(request, env, ctx);
		}

		if (url.pathname === "/mcp") {
			return MyMCP.serve("/mcp").fetch(request, env, ctx);
		}

		return new Response("Not found", { status: 404 });
	},
};

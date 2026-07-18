/**
 * WebMCP — expose ScanBusinessCard's key actions to in-browser AI agents.
 *
 * Implements the WebMCP API (https://webmachinelearning.github.io/webmcp/).
 * Entirely progressive-enhancement: if `navigator.modelContext` is absent
 * (every browser today unless the flag/extension is on) this is a no-op, so
 * it can never affect normal users. Only runs on the web build.
 */

type ToolResult = { content: Array<{ type: "text"; text: string }> };

interface WebMCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute: (args: Record<string, unknown>) => Promise<ToolResult> | ToolResult;
}

// Minimal shape of the proposed API; kept local so we don't depend on lib types.
interface ModelContextLike {
  registerTool?: (tool: WebMCPTool, options?: { signal?: AbortSignal }) => void;
  provideContext?: (context: { tools: WebMCPTool[] }) => void;
}

const ROUTES: Record<string, string> = {
  home: "/",
  pricing: "/pricing",
  signup: "/auth",
  login: "/auth",
  dashboard: "/dashboard",
  leads: "/dashboard/leads",
  integrations: "/dashboard/integrations",
  billing: "/dashboard/billing",
};

const text = (t: string): ToolResult => ({ content: [{ type: "text", text: t }] });

function buildTools(): WebMCPTool[] {
  return [
    {
      name: "navigate",
      description:
        "Navigate the ScanBusinessCard web app to a known page (home, pricing, signup, dashboard, leads, integrations, billing).",
      inputSchema: {
        type: "object",
        properties: {
          page: { type: "string", enum: Object.keys(ROUTES) },
        },
        required: ["page"],
      },
      execute: ({ page }) => {
        const path = ROUTES[String(page)];
        if (!path) return text(`Unknown page "${String(page)}".`);
        window.location.assign(path);
        return text(`Navigating to ${path}.`);
      },
    },
    {
      name: "get_pricing",
      description:
        "Return ScanBusinessCard pricing plans and what each includes.",
      inputSchema: { type: "object", properties: {} },
      execute: () =>
        text(
          [
            "ScanBusinessCard plans:",
            "- Free: try bulk scanning with a monthly scan limit.",
            "- Pro (Monthly / Yearly): unlimited bulk scanning, CRM export to Slack, HubSpot, and Google Sheets, and event organization.",
            "See https://scanbusinesscard.com/pricing for current prices.",
          ].join("\n")
        ),
    },
    {
      name: "list_integrations",
      description:
        "List the CRM / destination integrations ScanBusinessCard can export leads to.",
      inputSchema: { type: "object", properties: {} },
      execute: () =>
        text("Slack, HubSpot, and Google Sheets. Connect them under /dashboard/integrations."),
    },
    {
      name: "start_free_scan",
      description:
        "Send the user to sign up / sign in so they can start scanning business cards.",
      inputSchema: { type: "object", properties: {} },
      execute: () => {
        window.location.assign("/auth");
        return text("Opening sign-up so you can start your first scan.");
      },
    },
  ];
}

export function setupWebMCP(): void {
  try {
    const nav = navigator as Navigator & { modelContext?: ModelContextLike };
    const mc = nav.modelContext;
    if (!mc) return; // API not available — no-op for normal browsers.

    const tools = buildTools();

    if (typeof mc.registerTool === "function") {
      const controller = new AbortController();
      for (const tool of tools) {
        mc.registerTool(tool, { signal: controller.signal });
      }
    } else if (typeof mc.provideContext === "function") {
      mc.provideContext({ tools });
    }
  } catch {
    // Never let agent-discovery wiring break the app.
  }
}

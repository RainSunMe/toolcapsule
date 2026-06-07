export type TransportConfig =
  | {
      type: "remote";
      url: string;
      headers?: Record<string, string>;
      env?: Record<string, string>;
    }
  | {
      type: "stdio";
      command: string;
      args?: string[];
      env?: Record<string, string>;
      cwd?: string;
    };

export type ShortcutConfig = {
  tool: string;
  description?: string;
  args?: Record<string, "string" | "file" | "json" | "boolean" | "number">;
};

export type McpProfileSource = {
  tool: "vscode" | "claude" | "opencode" | "gemini" | "cursor" | "generic";
  path: string;
  server: string;
  userLevel?: boolean;
  managed?: boolean;
};

export type SnapshotProfileConfig = {
  name: string;
  kind?: "snapshot";
  transport: TransportConfig;
  skill?: {
    name?: string;
    description?: string;
  };
  shortcuts?: Record<string, ShortcutConfig>;
};

export type LinkedProfileConfig = {
  name: string;
  kind: "linked";
  source: McpProfileSource;
  skill?: {
    name?: string;
    description?: string;
  };
  shortcuts?: Record<string, ShortcutConfig>;
};

export type ProfileConfig = SnapshotProfileConfig | LinkedProfileConfig;

export type McpTool = {
  name: string;
  description?: string;
  inputSchema?: unknown;
  annotations?: {
    title?: string;
    readOnlyHint?: boolean;
    destructiveHint?: boolean;
    idempotentHint?: boolean;
    openWorldHint?: boolean;
    [key: string]: unknown;
  };
};

export type ToolsListResult = {
  tools: McpTool[];
};

export type JsonRpcMessage = {
  jsonrpc: "2.0";
  id?: number;
  method?: string;
  params?: unknown;
  result?: unknown;
  error?: unknown;
};

export type RunRecord = {
  id: string;
  createdAt: string;
  profile: string;
  tool: string;
  argsFile: string;
  status: "success" | "error";
  command: string;
  request: unknown;
  response?: unknown;
  error?: string;
};

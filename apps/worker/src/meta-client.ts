const REQUEST_TIMEOUT_MS = 45_000;
const SAM_MODEL = "sam-3.1";

export type ModelFailureClass = "retryable" | "terminal" | "auth";

// A failure the job can act on. Carries the error class only, because a provider
// message could echo report content.
export class ModelCallError extends Error {
  readonly failureClass: ModelFailureClass;
  readonly errorClass: string;
  readonly retryAfterMs: number | null;

  constructor(
    failureClass: ModelFailureClass,
    errorClass: string,
    retryAfterMs: number | null = null,
  ) {
    super(errorClass);
    this.failureClass = failureClass;
    this.errorClass = errorClass;
    this.retryAfterMs = retryAfterMs;
  }
}

// Mirrors the table in docs/meta-model-api.md.
export function classifyHttpFailure(
  status: number,
  code: string | null,
): ModelFailureClass {
  if (status === 429 || status === 500 || status === 503 || status === 504) {
    return "retryable";
  }
  if (status === 401 || status === 402 || status === 403) return "auth";
  return code === "rate_limit_exceeded" ? "retryable" : "terminal";
}

export type ModelRequest = {
  instructions: string;
  text: string;
  images: readonly { contentType: string; base64: string }[];
  jsonSchema: Record<string, unknown>;
  schemaName: string;
  safetyIdentifier: string;
};

export type ModelResponse = {
  outputText: string;
  usage: Record<string, unknown>;
  latencyMs: number;
};

export type CallModel = (request: ModelRequest) => Promise<ModelResponse>;

type ResponsesPayload = {
  status?: string;
  usage?: Record<string, unknown>;
  output?: {
    type: string;
    content?: { type: string; text?: string }[];
  }[];
  error?: { code?: string | null };
};

function retryAfterMs(header: string | null) {
  const seconds = Number(header);
  return header && Number.isFinite(seconds) ? seconds * 1000 : null;
}

export type SamRequest = {
  phrase: string;
  image: { contentType: string; base64: string };
};

export type CallSam = (request: SamRequest) => Promise<ModelResponse>;

// No matches is a valid answer from SAM, so empty output isn't a failure here.
export function createSamClient(config: {
  apiKey: string;
  baseUrl: string;
}): CallSam {
  return async function callSam(request) {
    const startedAt = Date.now();
    const payload = await postResponses(config, {
      model: SAM_MODEL,
      store: false,
      input: [
        {
          type: "message",
          role: "user",
          content: [
            { type: "input_text", text: request.phrase },
            {
              type: "input_image",
              image_url: `data:${request.image.contentType};base64,${request.image.base64}`,
            },
          ],
        },
      ],
    });
    return {
      outputText: outputTextOf(payload) ?? "",
      usage: payload.usage ?? {},
      latencyMs: Date.now() - startedAt,
    };
  };
}

function outputTextOf(payload: ResponsesPayload) {
  return payload.output
    ?.find((item) => item.type === "message")
    ?.content?.find((part) => part.type === "output_text")?.text;
}

async function postResponses(
  config: { apiKey: string; baseUrl: string },
  body: Record<string, unknown>,
) {
  let response: Response;
  try {
    response = await fetch(`${config.baseUrl}/responses`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      body: JSON.stringify(body),
    });
  } catch {
    throw new ModelCallError("retryable", "network_or_timeout");
  }

  const payload = (await response.json().catch(() => ({}))) as ResponsesPayload;

  if (!response.ok) {
    const code = payload.error?.code ?? null;
    throw new ModelCallError(
      classifyHttpFailure(response.status, code),
      code ?? `http_${response.status}`,
      retryAfterMs(response.headers.get("retry-after")),
    );
  }
  return payload;
}

export function createMetaClient(config: {
  apiKey: string;
  baseUrl: string;
  model: string;
}): CallModel {
  return async function callMeta(request) {
    const startedAt = Date.now();
    const payload = await postResponses(config, {
      model: config.model,
      // Keeps no retrievable copy at Meta. Prompt caching still works.
      store: false,
      reasoning: { effort: "low" },
      safety_identifier: request.safetyIdentifier,
      instructions: request.instructions,
      input: [
        {
          type: "message",
          role: "user",
          content: [
            { type: "input_text", text: request.text },
            ...request.images.map((image) => ({
              type: "input_image",
              image_url: `data:${image.contentType};base64,${image.base64}`,
            })),
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: request.schemaName,
          strict: true,
          schema: request.jsonSchema,
        },
      },
    });

    const outputText = outputTextOf(payload);
    if (!outputText) {
      throw new ModelCallError("retryable", "empty_output");
    }

    return {
      outputText,
      usage: payload.usage ?? {},
      latencyMs: Date.now() - startedAt,
    };
  };
}

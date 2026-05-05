import { buildPrompt, OracleRequest } from '../_shared/oracle.ts';

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload = (await request.json()) as OracleRequest;
    const prompt = buildPrompt(payload);

    const apiKey = Deno.env.get('LLM_API_KEY');
    const baseUrl = Deno.env.get('LLM_BASE_URL');
    const model = Deno.env.get('LLM_MODEL');

    if (!apiKey || !baseUrl || !model) {
      return Response.json(
        {
          error: 'Missing LLM configuration.',
          promptPreview: prompt,
        },
        { status: 500, headers: corsHeaders }
      );
    }

    const llmResponse = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        temperature: 0.95,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: prompt.system },
          { role: 'user', content: prompt.user },
        ],
      }),
    });

    if (!llmResponse.ok) {
      const errorText = await llmResponse.text();
      return Response.json({ error: errorText }, { status: 502, headers: corsHeaders });
    }

    const json = await llmResponse.json();
    const content = json.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content);

    return Response.json(
      {
        entry: {
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          persona: payload.persona,
          mode: payload.mode,
          question: payload.question,
          tier: payload.tier,
          result: parsed,
        },
        source: 'edge-llm',
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : 'Unknown edge error',
      },
      { status: 500, headers: corsHeaders }
    );
  }
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

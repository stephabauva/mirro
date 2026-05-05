Deno.serve(async (request) => {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const signature = request.headers.get('paddle-signature');
  const body = await request.text();

  return Response.json({
    ok: true,
    received: Boolean(signature),
    note: 'Verify Paddle signature here, then upsert subscriptions, credits, and consent records.',
    bodyPreview: body.slice(0, 200),
  });
});

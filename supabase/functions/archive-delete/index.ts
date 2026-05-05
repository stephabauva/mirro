Deno.serve(async (request) => {
  const userId = request.headers.get('x-user-id');

  return Response.json({
    ok: true,
    userId,
    note: 'Delete reading_archives and anonymize linked events for the authenticated user.',
  });
});

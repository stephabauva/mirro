Deno.serve(async (request) => {
  const userId = request.headers.get('x-user-id');

  return Response.json({
    ok: true,
    userId,
    note: 'Return a signed export bundle or JSON download of archive entries for the authenticated user.',
  });
});

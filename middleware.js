// Vercel Edge Middleware — HTTP Basic Auth gate.
// Set BASIC_AUTH_USER and BASIC_AUTH_PASS in your Vercel project env vars.
// Falls back to the defaults below if the vars are not set.

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico).*)'],
};

export default function middleware(request) {
  const validUser = process.env.BASIC_AUTH_USER || 'careerfair';
  const validPass = process.env.BASIC_AUTH_PASS || 'sres2026!';

  const authHeader = request.headers.get('authorization') || '';
  if (authHeader.startsWith('Basic ')) {
    const decoded = atob(authHeader.slice(6));
    const colon   = decoded.indexOf(':');
    const user    = decoded.slice(0, colon);
    const pass    = decoded.slice(colon + 1);
    if (user === validUser && pass === validPass) {
      return; // Authenticated — let the request through
    }
  }

  return new Response('Unauthorized', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Career Fair Photo Booth", charset="UTF-8"',
      'Content-Type': 'text/plain',
    },
  });
}

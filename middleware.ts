import { geolocation } from '@vercel/edge';

export const config = {
  // Only run middleware on the root or other page routes (skip static assets like images, js, css)
  matcher: '/((?!api|_next/static|_next/image|favicon.ico|assets|public).*)',
};

export default function middleware(request: Request) {
  const { country } = geolocation(request);

  // Block traffic if the country is China (CN)
  if (country === 'CN') {
    return new Response(
      `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Access Denied</title>
        <style>
          body { background-color: #1a1a1a; color: #ffffff; font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
          .container { text-align: center; border: 1px solid #333; padding: 40px; border-radius: 8px; background-color: #242424; }
          h1 { color: #ff4d4d; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>403 Forbidden</h1>
          <p>Access from your region is restricted.</p>
        </div>
      </body>
      </html>
      `,
      {
        status: 403,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      }
    );
  }
}

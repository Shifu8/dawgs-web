import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code") || "";
  const error = searchParams.get("error") || "";

  const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Iniciando sesión en 4GO...</title>
    <style>
      body {
        background-color: #09090b;
        color: #ffffff;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        margin: 0;
      }
      .spinner {
        width: 36px;
        height: 36px;
        border: 3px solid rgba(255,255,255,0.1);
        border-top-color: #ffffff;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    </style>
  </head>
  <body>
    <div class="spinner"></div>
    <p style="margin-top: 16px; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #a1a1aa;">
      Completando inicio de sesión...
    </p>
    <script>
      (function() {
        try {
          if (window.opener && !window.opener.closed) {
            window.opener.postMessage({ type: "GOOGLE_OAUTH_CODE", code: ${JSON.stringify(code)}, error: ${JSON.stringify(error)} }, "*");
          }
        } catch(e) {
          console.error(e);
        }
        setTimeout(function() {
          try { window.close(); } catch(e) {}
        }, 150);
      })();
    </script>
  </body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

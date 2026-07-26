import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

async function proxyToFastAPI(req: NextRequest, pathParams: { path?: string[] }) {
  const path = pathParams.path ? pathParams.path.join("/") : "";
  const targetUrl = `${BACKEND_URL}/api/v1/${path}${req.nextUrl.search}`;

  try {
    const headers = new Headers(req.headers);
    headers.delete("host");

    const body = req.method !== "GET" && req.method !== "HEAD" ? await req.text() : undefined;

    const backendRes = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
    });

    const resBody = await backendRes.text();
    const contentType = backendRes.headers.get("Content-Type") || "";

    // If response is an error status (>=400), verify that it is valid JSON.
    // If it is plain text or HTML, wrap it in a JSON structure to avoid client-side JSON parse errors.
    if (!backendRes.ok) {
      let isJson = false;
      try {
        JSON.parse(resBody);
        isJson = true;
      } catch {
        isJson = false;
      }

      if (!isJson) {
        const cleanMsg =
          resBody && !resBody.includes("<!DOCTYPE") && resBody.length < 200
            ? resBody.trim()
            : `Error en el servidor backend (${backendRes.status}). Intenta de nuevo más tarde.`;

        return NextResponse.json(
          {
            error: cleanMsg,
            code: "BACKEND_ERROR",
          },
          { status: backendRes.status }
        );
      }
    }

    return new NextResponse(resBody, {
      status: backendRes.status,
      headers: {
        "Content-Type": contentType || "application/json",
      },
    });
  } catch {
    // Return clean fallback response if backend service is offline
    return NextResponse.json(
      {
        error: "Servidor backend Python (FastAPI) no detectado en puerto 8000. Inicia 'uvicorn app.main:app' o utiliza el entorno configurado.",
        code: "BACKEND_OFFLINE",
      },
      { status: 503 }
    );
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  return proxyToFastAPI(req, await params);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  return proxyToFastAPI(req, await params);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  return proxyToFastAPI(req, await params);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  return proxyToFastAPI(req, await params);
}

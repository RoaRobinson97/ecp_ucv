import { NextRequest, NextResponse } from "next/server";

// Reenvía /api/* al backend Go. En Docker es 'http://backend:8081'; en local, 'http://localhost:8081'.
const INTERNAL_API_URL = process.env.INTERNAL_API_URL || "http://localhost:8081";

type FetchInit = RequestInit & { duplex?: "half" };

async function handler(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const targetUrl = `${INTERNAL_API_URL.replace(/\/$/, "")}/${path.join("/")}${req.nextUrl.search}`;

  const headers = new Headers(req.headers);
  headers.delete("host");
  headers.delete("content-length");

  try {
    const hasBody = req.method !== "GET" && req.method !== "HEAD";
    const fetchInit: FetchInit = {
      method: req.method,
      headers,
      body: hasBody ? req.body : undefined,
      cache: "no-store",
    };
    if (hasBody) {
      fetchInit.duplex = "half";
    }

    const res = await fetch(targetUrl, fetchInit);
    const data = await res.arrayBuffer();

    // fetch ya descomprimió el cuerpo, así que estos encabezados ya no aplican.
    const resHeaders = new Headers(res.headers);
    resHeaders.delete("content-encoding");
    resHeaders.delete("content-length");

    return new NextResponse(data, { status: res.status, statusText: res.statusText, headers: resHeaders });
  } catch (error) {
    console.error("Error en el proxy hacia el backend:", error);
    return NextResponse.json({ message: "Error de conexión con el backend interno" }, { status: 502 });
  }
}

export { handler as GET, handler as POST, handler as PUT, handler as DELETE, handler as PATCH };

import indexHtml from "./src/index.html";

const BASE_PATH = "./public";

const staticFileCacheHeader =
  process.env.NODE_ENV === "development"
    ? {
        "Cache-Control": "no-cache",
      }
    : {
        "Cache-Control": "public, max-age=31536000",
      };

Bun.serve({
  static: {
    "/": indexHtml,
  },
  async fetch(req) {
    const url = new URL(req.url);
    let response: Response = new Response(null, { status: 404 });

    // users are going to define the files that are loaded so maybe even like supabase or something??
    try {
      const filePath = BASE_PATH + url.pathname;
      const file = Bun.file(filePath);
      response = new Response(file, {
        headers: {
          ...staticFileCacheHeader,
          "Content-Type": file.type,
        },
      });
    } catch {
      response = new Response(null, { status: 404 });
    }

    return response;
  },
  development: true,
  port: process.env.PORT ?? 3000,
});

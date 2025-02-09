import { globalLogger } from '../logger';
import indexHtml from '../../src/index.html';

export async function initHtmlServer(port: number | string) {
	const logger = globalLogger.child({ module: 'http' });
	const BASE_PATH = "./public";

	const staticFileCacheHeader = process.env.NODE_ENV === "development" ? {
		"Cache-Control": "no-cache"
	} : {
		"Cache-Control": "public, max-age=31536000"
	};

	Bun.serve({
		static: {
			"/": indexHtml,
		},
		async fetch(req, serv) {
			const url = new URL(req.url);
			let response: Response = new Response(null, { status: 404 });
			const reqId = crypto.randomUUID();

			logger.info('Received request', { url: url.pathname, method: req.method, headers: req.headers, reqId });

			// TODO: eventually move static files to bucket/cdn and serve from there
			// users are going to define the files that are loaded so maybe even like supabase or something??
			try {
				const filePath = BASE_PATH + url.pathname;
				const file = Bun.file(filePath);
				response = new Response(file, {
					headers: {
						...staticFileCacheHeader,
						"Content-Type": file.type
					}
				});
			} catch (e) {
				response = new Response(null, { status: 404 });
			}

			logger.info('Responded', { status: response.status, headers: response.headers, reqId });

			return response
		},
		development: true,
		port: port
	})
}
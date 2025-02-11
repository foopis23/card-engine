import type { BunPlugin } from "bun";
import fs from "fs/promises";

async function doEnv(path: string) {
	// find every instance of process?.env?.SOME_VARIABLE
	// and replace it with the actual value of process.env.SOME_VARIABLE
	const content = await fs.readFile(path, "utf-8");
	const modifiedContent = content.replace(/process.env.(\w+)/g, (_, variableName) => {
		if (process.env[variableName]) {
			return `"${process.env[variableName]}"`;
		}

		return `undefined`;
	});

	return {
		contents: modifiedContent,
	};
}

export default {
	name: "inline-env-plugin",
	setup: (build) => {
		build.onLoad({ filter: /\.ts$/ }, async ({ path }) => {
			return {
				...(await doEnv(path)),
				loader: 'ts'
			}
		})

		build.onLoad({ filter: /\.tsx$/ }, async ({ path }) => {
			return {
				...(await doEnv(path)),
				loader: 'tsx'
			}
		})
	}
} satisfies BunPlugin
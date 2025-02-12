import tailwind from "bun-plugin-tailwind";
import fs from "fs/promises";
import path from "path";
import envPlugin from "./env-plugin";

async function build() {
	// clean up
	const distDir = path.resolve(__dirname, "dist");
	await fs.rm(distDir, { recursive: true, force: true });

	await Bun.build({
		entrypoints: ["./src/index.html"],
		outdir: "./dist/",
		plugins: [tailwind, envPlugin],
	})

	// copy all the files in public to the dist folder
	const publicDir = path.resolve(__dirname, "public");
	const files = await fs.readdir(publicDir);
	for (const file of files) {
		await fs.cp(path.resolve(publicDir, file), path.resolve(distDir, file), { recursive: true });
	}
}
build();
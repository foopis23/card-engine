import baseConfig from "./base.js";
import pluginReact from "eslint-plugin-react";

/** @type {import('eslint').Linter.Config[]} */
export default [
	...baseConfig,
	pluginReact.configs.flat.recommended,
	pluginReact.configs.flat['jsx-runtime'],
	{
		rules: {
			"react/react-in-jsx-scope": "off",
			"react/no-unknown-property": "off",
		},
	}
];

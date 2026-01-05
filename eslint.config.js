import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
	{
		ignores: [
			"dist",
			"build",
			"node_modules",
			"*.min.js",
			".cache",
			"coverage",
			"public/**/*.svg"
		]
	},
	{
		files: ["**/*.{js,jsx}"],
		languageOptions: {
			ecmaVersion: "latest",
			globals: {
				...globals.browser,
				...globals.node,
				...globals.commonjs,
				...globals.es2021,
				...globals.jquery
			},
			parserOptions: {
				ecmaFeatures: { jsx: true },
				ecmaVersion: "latest",
				sourceType: "module"
			}
		},
		plugins: {
			react,
			"react-hooks": reactHooks,
			"react-refresh": reactRefresh
		},
		rules: {
			...js.configs.recommended.rules,
			...react.configs.recommended.rules,
			...react.configs["jsx-runtime"].rules,
			...reactHooks.configs.recommended.rules,
			// 自定义规则（参考全局配置）
			"eol-last": ["error", "never"],
			indent: ["error", "tab"],
			"jsx-quotes": ["error", "prefer-double"],
			"no-console": ["off"],
			"no-tabs": ["off"],
			// Vite 相关
			"no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]" }],
			"no-var": ["error"],
			"object-curly-spacing": ["error", "always"],
			quotes: ["error", "double"],
			"react-refresh/only-export-components": [
				"warn",
				{ allowConstantExport: true }
			],
			semi: ["error", "always"],
			"space-before-function-paren": ["error", "never"]
		},
		settings: {
			react: {
				version: "detect"
			}
		}
	}
];
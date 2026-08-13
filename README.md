# deepseek-harness-huggingface

A community plugin for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) that adds read-only Hugging Face Hub model discovery.

## Status

Early prototype. The plugin currently provides one tool:

- `hf_search_models` — searches public models on Hugging Face Hub without an API key.

## Development

```sh
npm install
npm run typecheck
npm run build
```

## Load locally in DeepSeek Harness

Add the built module to a Harness patch file:

```yaml
- insert:
    - id: huggingface
      # Use a file URL (on Windows, for example: file:///C:/path/to/lib/index.js)
      name: file:///absolute/path/to/deepseek-harness-huggingface/lib/index.js
```

Then start Harness with the patch:

```sh
pnpm dsh web --patch ./patch.yml
```

The plugin only performs public GET requests to the Hugging Face Hub API. It does not write files, execute shell commands, or require a token.

## Why this is separate

DeepSeek Harness is currently in developer preview and its maintainers are not accepting external pull requests in the main repository. The project explicitly encourages community plugins; this package is intended to be published independently with the `dsh-plugin` topic.

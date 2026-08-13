import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

type HubModel = {
  modelId?: string
  pipeline_tag?: string
  likes?: number
  downloads?: number
}

type SearchArgs = {
  query: string
  limit?: number
  pipeline_tag?: string
}

function clampLimit(limit: number | undefined): number {
  if (limit === undefined) return 10
  if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
    throw new Error('limit must be an integer between 1 and 50')
  }
  return limit
}

async function searchModels(args: SearchArgs, signal: AbortSignal): Promise<string> {
  const limit = clampLimit(args.limit)
  const params = new URLSearchParams({ search: args.query, limit: String(limit) })
  if (args.pipeline_tag) params.set('pipeline_tag', args.pipeline_tag)

  const response = await fetch(`https://huggingface.co/api/models?${params}`, { signal })
  if (!response.ok) {
    throw new Error(`Hugging Face Hub returned HTTP ${response.status}`)
  }

  const models = (await response.json()) as HubModel[]
  return models
    .map((model) => {
      const name = model.modelId ?? 'unknown'
      const tag = model.pipeline_tag ? `, task=${model.pipeline_tag}` : ''
      return `${name} (downloads=${model.downloads ?? 0}, likes=${model.likes ?? 0}${tag})`
    })
    .join('\n') || 'No models found.'
}

export const name = 'deepseek-harness-huggingface'
export const inject = ['tools']

export function apply(ctx: Context) {
  ctx.tools.register(defineTool({
    name: 'hf_search_models',
    description: 'Search public Hugging Face Hub models by name and optional pipeline task.',
    parameters: {
      query: {
        type: 'string',
        required: true,
        description: 'Model name, author, or keyword to search for.',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of results, from 1 to 50. Defaults to 10.',
      },
      pipeline_tag: {
        type: 'string',
        description: 'Optional task filter such as text-generation or sentence-similarity.',
      },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: value }],
    },
    isConcurrencySafe: () => true,
    async execute(args: SearchArgs, exec) {
      return searchModels(args, exec.signal)
    },
  }))
}

import assert from 'node:assert/strict'

const originalFetch = globalThis.fetch
globalThis.fetch = async (url, init = {}) => {
  assert.match(String(url), /^https:\/\/huggingface\.co\/api\/models\?/) 
  assert.equal(init.signal instanceof AbortSignal, true)
  return new Response(JSON.stringify([
    { modelId: 'acme/demo-model', pipeline_tag: 'text-generation', downloads: 42, likes: 7 },
  ]), { status: 200, headers: { 'content-type': 'application/json' } })
}

try {
  const plugin = await import('../lib/index.js')
  assert.equal(plugin.name, 'deepseek-harness-huggingface')
  assert.deepEqual(plugin.inject, ['tools'])

  let registeredTool
  plugin.apply({ tools: { register(tool) { registeredTool = tool } } })
  assert.equal(registeredTool?.name, 'hf_search_models')

  const result = await registeredTool.execute(
    { query: 'demo', limit: 1, pipeline_tag: 'text-generation' },
    { signal: new AbortController().signal },
  )
  assert.equal(result, 'acme/demo-model (downloads=42, likes=7, task=text-generation)')
  console.log('Smoke test passed.')
} finally {
  globalThis.fetch = originalFetch
}

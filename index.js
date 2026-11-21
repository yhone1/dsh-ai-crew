/**
 * Model router — zero-dependency Host plugin.
 *
 * Reads the row's `config` directly (no Schemastery schema) and registers one
 * plain tool definition (no `defineTool` import), so the bundle runs against
 * the installed DSH without resolving any `@deepseek-ai/*` package.
 */

export const name = 'model-router'
export const inject = ['tools', 'agentDefaultModel']

const ROUTE_DESCRIPTION =
  'Return the configured model route for one task class: "smart" for design, debugging, planning and multi-file changes; '
  + '"grunt" for bulk edits, shell commands, log reading, data shuffling and other low-judgement work. '
  + 'Use it before spawning a subagent so the subagent runs on the intended model. '
  + 'Set applyDefault=true to also make this route the default model for new sessions.'

function toSelection(route) {
  const selection = { provider: route.provider, model: route.model }
  if (route.reasoningEffort !== undefined && route.reasoningEffort !== '') {
    selection.reasoningEffort = route.reasoningEffort
  }
  return selection
}

export function apply(ctx, config) {
  // Apply the configured default on activation. A deployment without a
  // configuration editor keeps its composed entry.
  ctx.effect(() => {
    try {
      void ctx.agentDefaultModel.saveSelection(toSelection(config.default)).catch(() => {})
    } catch {}
  })

  ctx.tools.register({
    name: 'model_route',
    description: ROUTE_DESCRIPTION,
    parameters: {
      type: 'object',
      properties: {
        task: {
          type: 'string',
          enum: ['smart', 'grunt'],
          description: 'Task class to route',
        },
        applyDefault: {
          type: 'boolean',
          description: 'Also set this route as the default model for new sessions',
        },
      },
      required: ['task'],
      additionalProperties: false,
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: value }],
    },
    async execute(args) {
      const route = args.task === 'grunt' ? config.grunt : config.smart
      const selection = toSelection(route)
      let appliedDefault = false
      if (args.applyDefault) {
        await ctx.agentDefaultModel.saveSelection(selection)
        appliedDefault = true
      }
      return JSON.stringify({ task: args.task, route: selection, appliedDefault })
    },
  })
}

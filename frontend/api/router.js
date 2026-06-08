import { createVercelHandler, resolveRewrittenApiPath } from './_lib/vercelHandler.js'

export default createVercelHandler(resolveRewrittenApiPath, {
  removeQueryKeys: ['path'],
})

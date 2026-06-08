import { createRequire } from 'node:module'
import { execSync } from 'node:child_process'

const require = createRequire(import.meta.url)
const targetBinding = '@rolldown/binding-linux-x64-gnu'

function isLinuxX64Gnu() {
  return process.platform === 'linux' && process.arch === 'x64'
}

function resolveRolldownBindingVersion() {
  try {
    const rolldownPackage = require('rolldown/package.json')
    return rolldownPackage.optionalDependencies?.[targetBinding] ?? '1.0.0-rc.17'
  } catch {
    return '1.0.0-rc.17'
  }
}

if (!isLinuxX64Gnu()) {
  process.exit(0)
}

try {
  require.resolve(targetBinding)
} catch {
  const version = resolveRolldownBindingVersion()
  console.log(`Missing ${targetBinding}. Installing ${targetBinding}@${version} for Linux build...`)
  execSync(`npm install --no-save --include=optional ${targetBinding}@${version}`, {
    stdio: 'inherit',
  })
}

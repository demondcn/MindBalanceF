import { execSync } from 'node:child_process'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

const nativeBindings = [
  {
    packageName: '@rolldown/binding-linux-x64-gnu',
    parentPackageName: 'rolldown/package.json',
    fallbackVersion: '1.0.0-rc.17',
  },
  {
    packageName: 'lightningcss-linux-x64-gnu',
    parentPackageName: 'lightningcss/package.json',
    fallbackVersion: '1.32.0',
  },
]

function isLinuxX64Gnu() {
  return process.platform === 'linux' && process.arch === 'x64'
}

function resolveBindingVersion(parentPackageName, packageName, fallbackVersion) {
  try {
    const parentPackage = require(parentPackageName)
    return parentPackage.optionalDependencies?.[packageName] ?? fallbackVersion
  } catch {
    return fallbackVersion
  }
}

function isInstalled(packageName) {
  try {
    require.resolve(packageName)
    return true
  } catch {
    return false
  }
}

if (!isLinuxX64Gnu()) {
  process.exit(0)
}

const missingBindings = nativeBindings
  .filter(({ packageName }) => !isInstalled(packageName))
  .map(({ packageName, parentPackageName, fallbackVersion }) => ({
    packageName,
    version: resolveBindingVersion(parentPackageName, packageName, fallbackVersion),
  }))

if (missingBindings.length === 0) {
  process.exit(0)
}

const packagesToInstall = missingBindings.map(({ packageName, version }) => `${packageName}@${version}`)

console.log(`Missing native bindings detected: ${packagesToInstall.join(', ')}. Installing for Linux build...`)
execSync(`npm install --no-save --include=optional ${packagesToInstall.join(' ')}`, {
  stdio: 'inherit',
})

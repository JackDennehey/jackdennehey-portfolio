#!/usr/bin/env node
/** Migrated PUBLIC action allowlist. Does not hit Gemini. */
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'
import ts from 'typescript'

const here = dirname(fileURLToPath(import.meta.url))
const fail = []
function assert(name, ok, detail = '') {
  if (ok) return
  fail.push(`${name}${detail ? ` — ${detail}` : ''}`)
}

function loadTs(path) {
  const source = readFileSync(path, 'utf8')
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
    fileName: path,
  })
  const module = { exports: {} }
  const requireFn = createRequire(path)
  const localRequire = (spec) => {
    if (spec.startsWith('.')) {
      const base = join(dirname(path), spec)
      for (const candidate of [base, `${base}.ts`, `${base}.js`]) {
        try {
          readFileSync(candidate)
          return candidate.endsWith('.ts') ? loadTs(candidate) : requireFn(candidate)
        } catch {
          /* try next */
        }
      }
    }
    return requireFn(spec)
  }
  const fn = new Function('exports', 'require', 'module', '__filename', '__dirname', outputText)
  fn(module.exports, localRequire, module, path, dirname(path))
  return module.exports
}

const { JackOSActionValidator, JACKOS_APP_IDS_ALLOWLIST } = loadTs(
  join(here, '../lib/boch/vendor/action-validator.ts'),
)

const validator = new JackOSActionValidator({ urlAllowlist: ['https://apps.apple.com'] })
function allow(action) {
  return validator.validate(action)
}

assert('roadmap is allowlisted', JACKOS_APP_IDS_ALLOWLIST.includes('roadmap'))
assert('jden-studios is allowlisted', JACKOS_APP_IDS_ALLOWLIST.includes('jden-studios'))

const roadmap = allow({ type: 'OPEN_APP', payload: { appId: 'roadmap' } })
assert('OPEN_APP roadmap validates', roadmap.ok === true)

const jden = allow({ type: 'OPEN_APP', payload: { appId: 'jden-studios' } })
assert('OPEN_APP jden-studios validates', jden.ok === true)

assert('OPEN_APP guestbook denied', allow({ type: 'OPEN_APP', payload: { appId: 'guestbook' } }).ok === false)
assert('OPEN_APP firewall denied', allow({ type: 'OPEN_APP', payload: { appId: 'firewall' } }).ok === false)
assert('COPY_EMAIL action type denied', allow({ type: 'COPY_EMAIL', payload: {} }).ok === false)
assert('EXECUTE_CODE denied', allow({ type: 'EXECUTE_CODE', payload: { code: 'alert(1)' } }).ok === false)
assert('javascript URL denied', allow({ type: 'OPEN_URL', payload: { url: 'javascript:alert(1)' } }).ok === false)
assert('legacy assistant appId denied', allow({ type: 'OPEN_APP', payload: { appId: 'assistant' } }).ok === false)
assert('malformed OPEN_APP payload denied', allow({ type: 'OPEN_APP', payload: { appId: 12 } }).ok === false)

const actionsSrc = readFileSync(join(here, '../lib/boch/actions.ts'), 'utf8')
assert('mapBochActions maps roadmap', /roadmap:\s*'roadmap'/.test(actionsSrc))
assert('mapBochActions maps jden-studios', /'jden-studios':\s*'jden-studios'/.test(actionsSrc))
assert('mapBochActions does not map guestbook', !/guestbook:\s*'guestbook'/.test(actionsSrc))
assert('mapBochActions does not map firewall', !/firewall:\s*'firewall'/.test(actionsSrc))

const appsSrc = readFileSync(join(here, '../components/os/apps.tsx'), 'utf8')
assert('#jd aliases to BOCH', /WINDOW_IDS_BY_HASH\.jd = 'boch'/.test(appsSrc))
assert('#assistant aliases to BOCH', /WINDOW_IDS_BY_HASH\.assistant = 'boch'/.test(appsSrc))
assert('legacy hash helper retained', /export function isLegacyJdAssistantHash/.test(appsSrc))
assert('no J.D. window app', !/id: 'assistant'/.test(appsSrc) && !/WINDOW_APPS\.assistant/.test(appsSrc))

if (fail.length) {
  for (const item of fail) console.error('FAIL', item)
  process.exit(1)
}

console.log('PASS migrated PUBLIC actions')

#!/usr/bin/env node
/** Files explorer: canonical IA, hashes, and no fake disk. Does not hit Gemini. */
import { createRequire } from 'node:module'
import { dirname, join, relative } from 'node:path'
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
  let source = readFileSync(path, 'utf8')
  source = source.replace(/from ['"]@\/(.*?)['"]/g, (_, spec) => {
    const abs = join(here, '..', spec)
    let rel = relative(dirname(path), abs)
    if (!rel.startsWith('.')) rel = `./${rel}`
    return `from '${rel}'`
  })
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

const files = loadTs(join(here, '../lib/os/files.ts'))
const {
  parseFilesHash,
  getFilesHash,
  listFilesItems,
  getPrimaryOpenTarget,
  FILES_ROOT_PATH,
  FILES_RESUME_ID,
} = files

const root = listFilesItems(FILES_ROOT_PATH)
assert(
  'root has canonical folders plus resume',
  root.map((item) => item.id).join(',') ===
    'projects,experience,education,skills,credentials,resume',
)

const gimmicks = /pocket-pier\.exe|hire-me\.exe|skills\.txt|secret-project\.zip/i
assert(
  'no gimmick filenames',
  root.every((item) => !gimmicks.test(item.title) && !gimmicks.test(item.id)),
)

const projects = listFilesItems({ folder: 'projects', selectedId: null })
assert('featured projects first', projects[0]?.featured === true)
assert('canonical project ids present', ['kickoff', 'pocket-pier', 'jackos', 'blue-ocean'].every((id) => projects.some((item) => item.id === id)))

assert('parse #files', parseFilesHash('#files')?.folder === 'root' && parseFilesHash('#files')?.selectedId === null)
assert('parse #files/projects', parseFilesHash('#files/projects')?.folder === 'projects')
assert(
  'parse #files/projects/kickoff',
  parseFilesHash('#files/projects/kickoff')?.folder === 'projects' &&
    parseFilesHash('#files/projects/kickoff')?.selectedId === 'kickoff',
)
assert(
  'parse #files/resume',
  parseFilesHash('#files/resume')?.folder === 'root' &&
    parseFilesHash('#files/resume')?.selectedId === FILES_RESUME_ID,
)
assert('unknown hash is not files', parseFilesHash('#portfolio') === null)
assert(
  'hash roundtrip projects',
  getFilesHash({ folder: 'projects', selectedId: 'kickoff' }) === 'files/projects/kickoff',
)

const resumeTarget = getPrimaryOpenTarget({ folder: 'root', selectedId: 'resume' })
assert('resume opens resume window', resumeTarget?.type === 'window' && resumeTarget.windowId === 'resume')

const projectTarget = getPrimaryOpenTarget({ folder: 'projects', selectedId: 'kickoff' })
assert('kickoff opens existing project destination', projectTarget?.type === 'project' && projectTarget.projectId === 'kickoff')

const experienceTarget = getPrimaryOpenTarget({
  folder: 'experience',
  selectedId: 'independent-technology-projects',
})
assert('experience stays in inspector', experienceTarget === null)

const filesSrc = readFileSync(join(here, '../lib/os/files.ts'), 'utf8')
assert('no real filesystem APIs', !/\b(readdir|readFile|fs\.|child_process)\b/.test(filesSrc))
assert('uses canonical catalogs', /from '@\/lib\/portfolio\//.test(filesSrc))

const appsSrc = readFileSync(join(here, '../components/os/apps.tsx'), 'utf8')
assert('files window registered', /id: 'files'/.test(appsSrc))
assert('files hash slug', /files: 'files'/.test(appsSrc))
assert('files dock pin', /'boch',\s*'files',\s*'portfolio'/.test(appsSrc))

const desktopSrc = readFileSync(join(here, '../components/os/desktop.tsx'), 'utf8')
assert('desktop parses files hashes', /parseFilesHash/.test(desktopSrc))
assert('desktop does not invent a router', !/createBrowserRouter|react-router/.test(desktopSrc))

const validatorSrc = readFileSync(join(here, '../lib/boch/vendor/action-validator.ts'), 'utf8')
assert('no READ_FILE action type', !/READ_FILE|OPEN_FILE|DELETE_FILE/.test(validatorSrc))

if (fail.length) {
  for (const item of fail) console.error('FAIL', item)
  process.exit(1)
}

console.log('PASS files explorer')

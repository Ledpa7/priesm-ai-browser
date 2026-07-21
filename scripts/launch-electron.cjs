/**
 * Launch Electron with a clean env.
 * Some IDEs set ELECTRON_RUN_AS_NODE=1 which breaks BrowserWindow/app APIs.
 * Also applies GPU fallback flags for locked-down / remote desktop environments.
 */
const { spawn } = require('node:child_process')
const path = require('node:path')
const electronPath = require('electron')

const env = { ...process.env }
delete env.ELECTRON_RUN_AS_NODE

const dev = process.argv.includes('--dev')
if (dev) {
  env.VITE_DEV_SERVER_URL = env.VITE_DEV_SERVER_URL || 'http://localhost:5174'
}

const electronArgs = [
  '.',
  '--disable-gpu',
  '--disable-software-rasterizer',
  '--disable-gpu-compositing',
  '--in-process-gpu',
  '--no-sandbox',
]

const child = spawn(String(electronPath), electronArgs, {
  stdio: 'inherit',
  env,
  cwd: path.join(__dirname, '..'),
  shell: false,
})

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }
  process.exit(code ?? 0)
})

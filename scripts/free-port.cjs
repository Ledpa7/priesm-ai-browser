const { execSync } = require('node:child_process')
const port = process.argv[2] || '5174'

function pidsOnPort(p) {
  try {
    // Windows PowerShell
    const out = execSync(
      `powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort ${p} -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique"`,
      { encoding: 'utf8' },
    )
    return out
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter((s) => /^\d+$/.test(s))
  } catch {
    return []
  }
}

const pids = pidsOnPort(port)
for (const id of pids) {
  try {
    execSync(`taskkill /PID ${id} /F`, { stdio: 'ignore' })
    console.log(`[free-port] killed PID ${id} on :${port}`)
  } catch {
    console.log(`[free-port] could not kill PID ${id}`)
  }
}
if (pids.length === 0) console.log(`[free-port] :${port} already free`)
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

test('HTML entry exposes the React root', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8')
  assert.match(html, /id=["']root["']/)
})

test('Docker Compose declares frontend and backend', async () => {
  const compose = await readFile(new URL('../docker-compose.yml', import.meta.url), 'utf8')
  assert.match(compose, /\bfrontend:/)
  assert.match(compose, /\bbackend:/)
})

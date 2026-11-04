import { readFile } from 'node:fs/promises'
import { basename, join } from 'node:path'
import { compilePost } from './compile-post.mjs'

export function blogPlugin() {
  let bibliography

  return {
    name: 'markdown-blog',
    enforce: 'pre',
    configResolved(config) {
      bibliography = join(config.root, 'src/posts/references.bib')
    },
    async load(id) {
      const [filename, query] = id.split('?')
      if (!filename.endsWith('.md') || !new URLSearchParams(query).has('post')) return

      this.addWatchFile(bibliography)
      const markdown = await readFile(filename, 'utf8')
      const post = await compilePost(basename(filename), markdown, bibliography)
      // Source positions are useful to the compiler, but unnecessary in the browser.
      const json = JSON.stringify(post, (key, value) => key === 'position' ? undefined : value)
      return `export default ${json}`
    },
    handleHotUpdate({ file, server }) {
      if (file === bibliography) {
        server.moduleGraph.invalidateAll()
        server.ws.send({ type: 'full-reload' })
        return []
      }
    },
  }
}

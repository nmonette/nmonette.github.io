import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import { parsePost } from '../src/blog/post.js'

const root = fileURLToPath(new URL('../', import.meta.url))
const output = join(root, 'dist')
const template = await readFile(join(output, 'index.html'), 'utf8')
const postsDirectory = join(root, 'src/posts')
const files = await readdir(postsDirectory, { withFileTypes: true })

function withTitle(title) {
  const escaped = title.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character])
  return template.replace(/<title>.*?<\/title>/, () => `<title>${escaped} | Nathan Monette</title>`)
}

async function writePage(directory, title) {
  await mkdir(directory, { recursive: true })
  await writeFile(join(directory, 'index.html'), withTitle(title))
}

// Keep old index links working after moving the list onto the homepage.
await mkdir(join(output, 'blog'), { recursive: true })
await writeFile(join(output, 'blog', 'index.html'), `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="refresh" content="0;url=/#blog" />
    <link rel="canonical" href="/" />
    <title>Blog | Nathan Monette</title>
  </head>
  <body><a href="/#blog">View blog posts on the homepage</a></body>
</html>
`)

// GitHub Pages serves each post directly, including on refresh or a shared link.
for (const file of files) {
  if (!file.isFile() || !file.name.endsWith('.md')) continue
  const markdown = await readFile(join(postsDirectory, file.name), 'utf8')
  const post = parsePost(file.name, markdown)
  await writePage(join(output, 'blog', post.slug), post.title)
}

await writeFile(join(output, '404.html'), withTitle('Page not found'))

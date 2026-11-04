import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { renderToStaticMarkup } from 'react-dom/server'
import { Fragment, jsx, jsxs } from 'react/jsx-runtime'
import { toJsxRuntime } from 'hast-util-to-jsx-runtime'
import { compilePost } from './compile-post.mjs'
import { parsePost } from '../src/blog/post.js'

const directory = await mkdtemp(join(tmpdir(), 'blog-citations-'))
const bibliography = join(directory, 'references.bib')
await writeFile(bibliography, `
@article{smith2024,
  author = {Smith, Alice}, title = {A Test Paper}, journal = {Test Journal},
  year = {2024}, url = {https://example.com/paper}
}
@article{jones2023,
  author = {Jones, Bob}, title = {Another Test Paper}, journal = {Test Journal},
  year = {2023}, doi = {10.1000/test}
}
@article{uncited2022,
  author = {Unused, Chris}, title = {An Uncited Paper}, journal = {Test Journal}, year = {2022}
}
`)
after(() => rm(directory, { recursive: true, force: true }))

async function render(markdown) {
  const post = await compilePost('test-post.md', markdown, bibliography)
  return renderToStaticMarkup(toJsxRuntime(post.tree, { Fragment, jsx, jsxs }))
}

test('post filenames and headings supply stable titles and URLs', () => {
  const post = parsePost('my-post.md', '\uFEFF\r\n# My Post ###\r\n\r\nBody')
  assert.equal(post.title, 'My Post')
  assert.equal(post.href, '/blog/my-post/')
  assert.equal(post.body, 'Body')
  assert.equal(parsePost('my-post.md', 'Body').title, 'my post')
  assert.throws(() => parsePost('../invalid.md', '# Title'), /Rename/)
})

test('ordinary Markdown needs no citations and excludes raw HTML', async () => {
  const html = await render('# A title\n\nA **bold** paragraph.\n\n<script>alert(1)</script>')
  assert.match(html, /<strong>bold<\/strong>/)
  assert.doesNotMatch(html, /References|csl-entry|<script>/)
})

test('math, GFM, and literal citation examples render together', async () => {
  const html = await render('# Math\n\nInline $x^2$.\n\n$$\n\\sum_{t=0}^{T} \\gamma^t r_t\n$$\n\n| A | B |\n| --- | --- |\n| 1 | 2 |\n\n`[@missing]`\n\n```text\n[@missing]\n```')
  assert.match(html, /class="katex"/)
  assert.match(html, /class="katex-display"/)
  assert.doesNotMatch(html, /katex-error/)
  assert.match(html, /<table>/)
  assert.match(html, /<code>\[@missing\]<\/code>/)
})

test('author-year citations, locators, groups, and reference links work', async () => {
  const html = await render('# Citations\n\n[@smith2024]. @smith2024 explains. [-@smith2024]. [@smith2024, p. 3]. [@smith2024; @jones2023].')
  assert.match(html, /href="#bib-smith2024">Smith, 2024<\/a>/)
  assert.match(html, /Smith \(2024\)/)
  assert.match(html, /href="#bib-smith2024">2024<\/a>/)
  assert.match(html, /p\. 3/)
  assert.match(html, /Jones, 2023/)
  assert.equal((html.match(/class="csl-entry"/g) || []).length, 2)
  assert.doesNotMatch(html, /An Uncited Paper/)
  assert.match(html, /<h2 id="references-heading">References<\/h2>/)
  assert.match(html, /href="https:\/\/example.com\/paper"/)
  assert.match(html, /href="https:\/\/doi.org\/10.1000\/test"/)
})

test('unknown bracketed citation keys produce an actionable build error', async () => {
  await assert.rejects(render('# Missing\n\n[@notInBibliography]'), /Unresolved citation.*notInBibliography/)
})

test('citation comments stay literal without inferred page labels or Roman numerals', async () => {
  const html = await render('# Comments\n\n[@smith2024, LAMs]. [@smith2024, 3]. [@smith2024, p. 3]. [@smith2024, compare methods; @jones2023, limitations]. [-@smith2024, LAMs].\n\n`[@smith2024, LAMs]`')
  assert.match(html, /href="#bib-smith2024">Smith, 2024<\/a>, LAMs/)
  assert.match(html, /Smith, 2024<\/a>, 3/)
  assert.match(html, /Smith, 2024<\/a>, p\. 3/)
  const text = html.replace(/<[^>]+>/g, '')
  assert.match(text, /Smith, 2024, compare methods/)
  assert.match(text, /Jones, 2023, limitations/)
  assert.match(html, />2024<\/a>, LAMs/)
  assert.match(html, /<code>\[@smith2024, LAMs\]<\/code>/)
  assert.doesNotMatch(html, /p\. L|pp\. L|L AMs|\uE000/)
  for (const link of html.matchAll(/<a href="#bib-[^"]+">(.*?)<\/a>/g)) {
    assert.doesNotMatch(link[1], /LAMs|compare methods|limitations|p\. 3/)
  }
})

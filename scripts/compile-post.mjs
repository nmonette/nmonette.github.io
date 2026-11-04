import { basename, dirname } from 'node:path'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import remarkRehype from 'remark-rehype'
import rehypeCitation from 'rehype-citation'
import rehypeKatex from 'rehype-katex'
import { parsePost } from '../src/blog/post.js'

// Preserve the comment boundary through citeproc, then remove it from the output.
const citationCommentBoundary = '\uE000'

function formattedCitationText() {
  return (tree) => {
    function visit(node) {
      if (['code', 'pre', 'a', 'math'].includes(node.tagName)) return
      if (!node.children) return
      if (['em', 'strong', 'del'].includes(node.tagName)) {
        // rehype-citation only processes text under a small set of tags,
        // including span. Keep emphasis while making its citations reachable.
        node.children = node.children.map((child) =>
          child.type === 'text' && child.value.includes('@')
            ? { type: 'element', tagName: 'span', properties: {}, children: [child] }
            : child,
        )
      }
      node.children.forEach(visit)
    }
    visit(tree)
  }
}

function literalCitationComments() {
  return (tree) => {
    function visit(node) {
      if (['code', 'pre', 'a', 'math'].includes(node.tagName)) return
      if (node.type === 'text') {
        node.value = node.value.replace(/\[[^[\]]*@[^[\]]+\]/g, (citation) =>
          // An empty explicit locator disables page-number inference. Keep the
          // comma in the literal suffix so citeproc preserves its punctuation.
          citation.replace(/(@(?:\{[^{}]+\}|[\p{L}\d_][^\s,;{}[\]]*)),\s+/gu, `$1{}, ${citationCommentBoundary}, `),
        )
      }
      node.children?.forEach(visit)
    }
    visit(tree)
  }
}

function unlinkCitationComments() {
  return (tree) => {
    function visit(node) {
      if (node.type === 'text') node.value = node.value.replaceAll(citationCommentBoundary, '')
      if (!node.children) return
      node.children = node.children.flatMap((child) => {
        let nodes = [child]
        if (child.tagName === 'a' && child.properties?.href?.startsWith('#bib-')) {
          const index = child.children.findIndex((part) =>
            part.type === 'text' && part.value.includes(citationCommentBoundary),
          )
          if (index !== -1) {
            const text = child.children[index].value
            const boundary = text.indexOf(citationCommentBoundary)
            nodes = [child, { type: 'text', value: text.slice(boundary) }, ...child.children.slice(index + 1)]
            child.children = [...child.children.slice(0, index), { type: 'text', value: text.slice(0, boundary) }]
          }
        }
        nodes.forEach(visit)
        return nodes
      })
    }
    visit(tree)
  }
}

function linkReferenceUrls(node) {
  if (!node.children || node.tagName === 'a') return
  node.children = node.children.flatMap((child) => {
    if (child.type !== 'text') {
      linkReferenceUrls(child)
      return [child]
    }
    const nodes = []
    let end = 0
    for (const match of child.value.matchAll(/https?:\/\/[^\s<>]+/g)) {
      const url = match[0].replace(/[.,;]+$/, '')
      nodes.push({ type: 'text', value: child.value.slice(end, match.index) })
      nodes.push({
        type: 'element', tagName: 'a', properties: { href: url },
        children: [{ type: 'text', value: url }],
      })
      end = match.index + url.length
    }
    nodes.push({ type: 'text', value: child.value.slice(end) })
    return nodes
  })
}

function finishReferences() {
  return (tree, file) => {
    function check(node) {
      if (['code', 'pre', 'a', 'math'].includes(node.tagName)) return
      if (node.type === 'text') {
        const unresolved = node.value.match(/\[[^\]]*?@[\w:.-]+[^\]]*\]/)
        if (unresolved) file.fail(`Unresolved citation ${unresolved[0]}. Check the keys in references.bib.`)
      }
      node.children?.forEach(check)
    }
    check(tree)

    const index = tree.children.findIndex((node) => node.properties?.id === 'refs')
    if (index !== -1) {
      linkReferenceUrls(tree.children[index])
      tree.children.splice(index, 0, {
        type: 'element', tagName: 'h2', properties: { id: 'references-heading' },
        children: [{ type: 'text', value: 'References' }],
      })
      tree.children[index + 1].properties.ariaLabelledBy = 'references-heading'
    }
  }
}

export async function compilePost(filename, markdown, bibliography) {
  const { body, ...post } = parsePost(filename, markdown)
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype)
    .use(formattedCitationText)
    .use(literalCitationComments)
    .use(rehypeCitation, {
      bibliography: basename(bibliography),
      path: dirname(bibliography),
      csl: 'apa',
      linkCitations: true,
    })
    .use(unlinkCitationComments)
    .use(finishReferences)
    .use(rehypeKatex)

  const tree = await processor.run(processor.parse(body), { path: filename, value: body })
  return { ...post, tree }
}

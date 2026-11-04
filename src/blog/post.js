// Shared by Vite's post loader and the static-page build script.
export function parsePost(filename, markdown) {
  const slug = filename.replace(/\.md$/, '')

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error(`Rename "${filename}" to a lowercase, hyphen-separated filename (for example, my-post.md).`)
  }

  const source = markdown.trim()
  const firstLine = source.split('\n', 1)[0]
  const heading = firstLine.match(/^#\s+(.+?)(?:\s+#+)?\s*$/)

  return {
    slug,
    href: `/blog/${slug}/`,
    title: heading ? heading[1] : slug.replace(/-/g, ' '),
    body: heading ? source.slice(firstLine.length).trimStart() : source,
  }
}

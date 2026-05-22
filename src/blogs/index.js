// Eagerly load all markdown files in this directory as raw strings.
const modules = import.meta.glob("./*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

function extractTitle(content) {
  const match = content.match(/^\s*#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

function stripTitle(content) {
  return content.replace(/^\s*#\s+.+\n?/m, "");
}

export const posts = Object.entries(modules)
  .map(([path, content]) => {
    const slug = path.replace(/^\.\//, "").replace(/\.md$/, "");
    const title = extractTitle(content) || slug;
    const body = stripTitle(content);
    return { slug, title, body, content };
  })
  .sort((a, b) => a.title.localeCompare(b.title));

export function getPost(slug) {
  return posts.find((p) => p.slug === slug);
}

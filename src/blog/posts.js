const files = import.meta.glob('../posts/*.md', {
  query: '?post',
  import: 'default',
  eager: true,
})

export const posts = Object.values(files)
  .sort((a, b) => a.slug.localeCompare(b.slug))

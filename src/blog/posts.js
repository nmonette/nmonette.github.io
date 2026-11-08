const files = import.meta.glob('../posts/*.md', {
  query: '?post',
  import: 'default',
  eager: true,
})

const keywords = {
  lam: ['robotics', 'latent actions', 'pretraining'],
  'on-unsupervised-environment-design': [
    'reinforcement learning', 'min-max optimization',
  ],
}

// Optional index thumbnails, keyed by the Markdown filename without .md.
// Paths start at public/; posts without an override use their first image.
const thumbnails = {
  lam: {
    src: '/lam_openx_discrete_sup.png',
    alt: 'Skill comparison',
  },
  'on-unsupervised-environment-design': {
    src: '/blog-images/ued/general_ued.png',
    alt: 'Different Minigrid maze levels',
  },
}

function firstImage(node) {
  if (node.tagName === 'img') return node.properties
  for (const child of node.children ?? []) {
    const image = firstImage(child)
    if (image) return image
  }
}

export const posts = Object.values(files)
  .map((post) => ({
    ...post,
    keywords: keywords[post.slug] ?? [],
    image: thumbnails[post.slug] ?? firstImage(post.tree),
  }))
  .sort((a, b) => a.slug.localeCompare(b.slug))

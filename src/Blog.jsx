import { Fragment, jsx, jsxs } from 'react/jsx-runtime'
import { toJsxRuntime } from 'hast-util-to-jsx-runtime'
import 'katex/dist/katex.min.css'
import { posts } from './blog/posts.js'
import './App.css'

function Blog({ slug }) {
  const post = posts.find((entry) => entry.slug === slug)
  const title = post?.title ?? 'Post not found'

  return (
    <main className="homepage">
      <title>{`${title} | Nathan Monette`}</title>
      <div className="profile-content">
        <nav className="profile-links" aria-label="Back to blog">
          <a className="back-home" href="/#blog">← back</a>
        </nav>
        {post ? (
          <article>
            <h1>{post.title}</h1>
            <div className="profile-bio blog-content">
              {toJsxRuntime(post.tree, { Fragment, jsx, jsxs })}
            </div>
          </article>
        ) : (
          <>
            <h1>{title}</h1>
            <p className="profile-bio">
              This post doesn’t exist. <a href="/#blog">View all posts</a>.
            </p>
          </>
        )}
      </div>
    </main>
  )
}

export default Blog

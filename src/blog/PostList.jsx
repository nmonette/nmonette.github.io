import { posts } from './posts.js'

function PostList() {
  if (posts.length === 0) return <p>No posts yet.</p>

  return (
    <div className="blog-list">
      {posts.map((post) => (
        <article className="blog-post" key={post.slug}>
          {post.image && (
            <img
              className="blog-post-image"
              src={post.image.src}
              alt={post.image.alt ?? ''}
            />
          )}
          <div className="blog-post-details">
            <h3>{post.title}</h3>
            {post.keywords.length > 0 && (
              <p className="blog-post-keywords">
                <em>Keywords: {post.keywords.join(', ')}</em>
              </p>
            )}
            <a className="blog-post-go" href={post.href} aria-label={`Read ${post.title}`}>
              go →
            </a>
          </div>
        </article>
      ))}
    </div>
  )
}

export default PostList

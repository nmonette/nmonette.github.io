import { posts } from './posts.js'

function PostList() {
  if (posts.length === 0) return <p>No posts yet.</p>

  return (
    <div className="blog-list">
      {posts.map((post) => (
        <article className="publication" key={post.slug}>
          <h3><a href={post.href}>{post.title}</a></h3>
        </article>
      ))}
    </div>
  )
}

export default PostList

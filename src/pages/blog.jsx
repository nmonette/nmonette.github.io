import { Link } from "react-router";

import NavButton from "./nav_button.jsx";
import { posts } from "../blogs/index.js";
import ued_notes from '../assets/ued_notes.pdf'
import "./blog.css";

function Blog() {
  return (
    <>
      <NavButton />
      <div className="blog-container">
        <h1>Blog</h1>
        {posts.length === 0 ? (
          <p style={{ color: "#ccc", fontStyle: "italic" }}>No posts yet.</p>
        ) : (
          <ol className="blog-list">
            {posts.map((post) => (
              <li key={post.slug}>
                <Link to={`/blog/${post.slug}`}>{post.title}</Link>
              </li>
            ))}
          </ol>
        )}
        <h1>Notes</h1>
        <ol className="blog-list">
            <li><a rel="noreferrer" target="_blank" href={ued_notes} >On Unsupervised Environment Design</a></li>
          </ol>
      </div>
    </>
  );
}

export default Blog;

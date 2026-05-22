import { useParams, Link } from "react-router";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import remarkMath from "remark-math";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

import NavButton from "./nav_button.jsx";
import { getPost } from "../blogs/index.js";
import "./blog.css";

function BlogPost() {
  const { slug } = useParams();
  const post = getPost(slug);

  return (
    <>
      <NavButton />
      <div className="blog-post">
        {post ? (
          <>
            <h1>{post.title}</h1>
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]}>{post.body}</ReactMarkdown>
          </>
        ) : (
          <h1>Post not found</h1>
        )}
      </div>
    </>
  );
}

export default BlogPost;

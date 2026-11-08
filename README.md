# Nathan Monette’s website

React + Vite, deployed to GitHub Pages.

## Local development

```sh
npm install
npm run dev
```

## Writing blog posts

Add a Markdown file directly to `src/posts/`. No JSX, imports, or route changes are needed.

- Use a lowercase, hyphen-separated filename: `my-new-post.md` becomes `/blog/my-new-post/`.
- Start with a plain-text `# Title`. It supplies the page heading and the link text. If omitted, the filename supplies the title.
- Write the rest as ordinary Markdown. Headings, links, images, lists, blockquotes, code fences, tables, and footnotes are supported.
- Every `.md` file in this folder is published. Keep unfinished drafts outside the folder.
- Posts automatically appear in the homepage's Blog section (`/#blog`), sorted alphabetically by filename. Each post's back link returns here.
- Choose a thumbnail in the filename-keyed `thumbnails` map in `src/blog/posts.js`: set `src` to its URL and `alt` to a short description. For example, an image at `public/blog-images/my-figure.png` uses `src: '/blog-images/my-figure.png'`. Posts without an override use their first image.
- Add keywords to the filename-keyed `keywords` map in `src/blog/posts.js` to show an italic keyword line beneath its title.

For example, create `src/posts/my-new-post.md`:

```markdown
# My New Post

A paragraph with **bold text**, *italics*, and an [external link](https://example.com).

## Equations

Inline math uses single dollar signs: $V^{\pi}(s)$.

Display math uses double dollar signs on their own lines:

$$
V^{\pi}(s) = \mathbb{E}_{\pi}\left[\sum_{t=0}^{\infty}\gamma^t r_t \mid s_0 = s\right]
$$

## Images

![A description of the figure](/blog-images/my-figure.png)
```

Put images in `public/blog-images/` and reference them with root-relative URLs as shown above. Link to another post with `[Post title](/blog/another-post/)`. Escape literal dollar signs as `\$` when needed.

Markdown, equations, and citations are compiled by Vite and rendered as React elements. Styling inherits the existing website typography, colors, width, and responsive layout. Raw HTML and embedded JSX are not executed.

## Citations and references

Add BibTeX entries to `src/posts/references.bib`, then cite their keys in any post. This shared file can contain your whole library; each post’s bibliography includes only the works it cites. Your UED paper is included as a working example under `monette2025ued`.

Use Pandoc-style Markdown citation syntax (the equivalents of natbib’s commands):

| Markdown | Natbib equivalent | Result |
| --- | --- | --- |
| `[@monette2025ued]` | `\citep{monette2025ued}` | (Monette et al., 2025) |
| `@monette2025ued` | `\citet{monette2025ued}` | Monette et al. (2025) |
| `[-@monette2025ued]` | `\citeyearpar{monette2025ued}` | (2025) |
| `[@monette2025ued, p. 3]` | `\citep[p. 3]{monette2025ued}` | (Monette et al., 2025, p. 3) |
| `[@monette2025ued, see discussion]` | `\citep[see discussion]{monette2025ued}` | (Monette et al., 2025, see discussion) |
| `[@firstKey; @secondKey]` | `\citep{firstKey,secondKey}` | Multiple references in one citation |

Text after the comma is treated as a literal comment: `[@key, LAMs]` keeps `LAMs` without inserting `p.` or interpreting it as a Roman numeral. The author and year link to the reference; the comment stays outside the hyperlink. Include `p.` or `pp.` yourself when you want a page label.

For example:

```markdown
@monette2025ued introduces an optimisation framework for UED.
Related work studies environment design [@monette2025ued].
```

The site automatically appends a **References** section in author–year (APA) format. Citations link to their bibliography entries, and DOI/URL fields become links. Posts without citations have no reference list. An unresolved bracketed citation fails the build with a message identifying the citation to fix. Code blocks and inline code are left alone.

Use the Markdown forms above, rather than literal LaTeX `\citep` or `\citet` commands. If needed, change the `csl` option in `scripts/compile-post.mjs` to another style supported by `rehype-citation`. Both Markdown and BibTeX edits update the development preview.

## Build and deploy

```sh
npm test
npm run build
npm run preview
```

The build discovers all posts and creates an HTML entry point for each post, so direct links and refreshes work on GitHub Pages. The former `/blog/` index redirects to `/#blog`. Post content is rendered by React in the browser. A `404.html` lets unknown blog URLs show the missing-post page.

Add or edit posts, then commit and push as usual. The existing GitHub Actions workflow rebuilds and deploys on pushes to `main`; the live site updates after deployment completes. The development server picks up Markdown changes automatically.

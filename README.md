# Bilu Comment System

**Bilu Comment System** is a lightweight commenting system built on Cloudflare Workers and Cloudflare D1. It is designed to be easily embedded into any static website with a simple JavaScript snippet. This system leverages [Hono.js](https://honojs.dev/) for managing API routes and stores comment data in Cloudflare D1 or KV Storage.

## Key Features

- **Easy Embedding**: Integrate the comment system into any static website by adding a simple JavaScript snippet.
- **Cloudflare Worker API**: A serverless API that handles requests for adding, retrieving, and displaying comments associated with specific URLs.
- **Lightweight and Fast**: Thanks to Cloudflare’s global network, the system provides low-latency and fast responses worldwide.
- **Customizable**: You can customize the behavior, style, and placement of the comments on your site.

## Demo

You can view a working demo of the comment system here: [Bilu Comment System Demo](https://bilu.khi-me.workers.dev)

## How It Works

1. **JavaScript Embedding**: You can embed the comment system by adding a `<script>` tag and a `<div>` for displaying comments. Example:

   ```html
   <div id="bilu-comment-section"></div>
   <script src="https://bilu.khi-me.workers.dev/embed.js"></script>
   <script>
     bilu.init({
       api: "https://bilu.khi-me.workers.dev", // API endpoint for comment handling
       url: window.location.pathname, // The page URL to associate comments with
     });
   </script>
   ```

2. **API Endpoints**:
   - `GET /comments?url=<page_url>`: Retrieves all comments associated with the given URL.
   - `POST /comments?url=<page_url>`: Adds a new comment to the specific URL. Requires JSON body with `user` and `comment`.

## Setup

To deploy and run this comment system yourself:

1. **Clone the repository**:

   ```bash
   git clone https://github.com/your-repo/bilu-comment-system.git
   cd bilu-comment-system
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure Cloudflare Workers**:

   - Ensure you have a Cloudflare account and Workers enabled.
   - Set up a Cloudflare D1 or KV namespace for comment storage.
   - Update your `wrangler.toml` file to include your D1 or KV binding.

4. **Deploy to Cloudflare**:

   ```bash
   npx wrangler publish
   ```

5. **Test the API**:
   You can test the API directly by sending requests using tools like `curl` or Postman:

   ```bash
   curl https://your-worker-url/comments?url=/your-page-url
   ```

## Example Code

### `embed.js`

The following script is used to embed the comment section into any webpage:

```javascript
(function () {
  const bilu = {
    init: function (config) {
      const commentDiv = document.getElementById("bilu-comment-section");
      if (!commentDiv) {
        console.error("Div with id 'bilu-comment-section' not found!");
        return;
      }

      const loadComments = function () {
        fetch(config.api + "/comments?url=" + encodeURIComponent(config.url))
          .then((response) => response.json())
          .then((data) => {
            const commentsHtml = data
              .map(
                (comment) =>
                  `<p><strong>${comment.user}</strong>: ${comment.comment} (${new Date(comment.timestamp).toLocaleString()})</p>`,
              )
              .join("");
            commentDiv.querySelector(".comments-list").innerHTML = commentsHtml;
          });
      };

      if (!commentDiv.querySelector("form")) {
        const form = document.createElement("form");
        form.innerHTML = `
          <input type="text" id="name" placeholder="Your Name" required />
          <textarea id="content" placeholder="Your Comment" required></textarea>
          <button type="submit">Submit</button>
          <div class="comments-list"></div>
        `;

        form.addEventListener("submit", function (e) {
          e.preventDefault();
          const name = form.querySelector("#name").value;
          const content = form.querySelector("#content").value;

          fetch(
            config.api + "/comments?url=" + encodeURIComponent(config.url),
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ user: name, comment: content }),
            },
          ).then(() => {
            loadComments();
          });
        });

        commentDiv.appendChild(form);
      }

      loadComments();
    },
  };

  window.bilu = bilu;
})();
```

### Backend API (Hono.js)

This backend API handles the GET and POST requests for comments:

```typescript
import { Hono } from "hono/tiny";
import comments, { COMMENT } from "./libs/comments";

type Bindings = {
  KV: KVNamespace;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/comments", async (c) => {
  const url = c.req.query("url");
  if (!url) {
    return c.json(await comments.all(c.env.KV));
  }
  return c.json(await comments.getByPost(c.env.KV, url));
});

app.post("/comments", async (c) => {
  const url = c.req.query("url");
  const { user, comment } = await c.req.json<COMMENT>();
  if (!url || !user || !comment) {
    return c.json({ success: false, message: "Missing required fields" });
  }

  await comments.addByPost(c.env.KV, url, {
    user,
    comment,
    timestamp: Date.now(),
  });

  return c.json({ user, comment, timestamp: Date.now() });
});

export default app;
```

## Conclusion

Bilu Comment System offers a simple and efficient way to add a commenting feature to any static website. Its integration with Cloudflare Workers makes it fast, reliable, and easy to scale.

### Live Demo

You can check out a live demo of the comment system here: [Bilu Comment System Demo](https://bilu.khi-me.workers.dev)

```

---

This `README.md` provides a comprehensive guide to set up, integrate, and deploy the Bilu Comment System, as well as a live demo link for easy testing.
```

import { Hono } from "hono";
import { cors } from "hono/cors";

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use(cors());

app.get("/", (c) => {
  return c.text("Welcome to Comment System");
});

app.get("/embed.js", (c) => {
  const script = `
  (function() {
    const bilu = {
      init: function(config) {
        const commentDiv = document.getElementById(config.id);
        if (!commentDiv) {
          console.error("Div with id '" + config.id + "' not found!");
          return;
        }
        
        fetch(config.url + "/comments?path=" + encodeURIComponent(config.path))
          .then(response => response.json())
          .then(data => {
            commentDiv.innerHTML = data.map(comment => 
              \`<p><strong>\${comment.name}</strong>: \${comment.content} (\${new Date(comment.created_at).toLocaleString()})</p>\`
            ).join('');
          });

        // Tạo form cho comment
        const form = document.createElement('form');
        form.innerHTML = \`
          <input type="text" id="name" placeholder="Your Name" required />
          <textarea id="content" placeholder="Your Comment" required></textarea>
          <button type="submit">Submit</button>
        \`;

        form.addEventListener('submit', function(e) {
          e.preventDefault();
          const name = form.querySelector('#name').value;
          const content = form.querySelector('#content').value;

          fetch(config.url + "/comments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, content, path: config.path })
          }).then(() => {
            bilu.init(config); // Reload comments after submit
          });
        });

        commentDiv.appendChild(form);
      }
    };

    window.bilu = bilu;
  })();
  `;

  c.header("Content-Type", "application/javascript");
  return c.text(script);
});

app.get("/comments", async (c) => {
  const path = c.req.query("path");
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM comments WHERE path = ? ORDER BY created_at DESC",
  )
    .bind(path)
    .all();
  return c.json(results);
});

app.post("/comments", async (c) => {
  const { name, content, path } = await c.req.json();

  if (!name || !content || !path) {
    return c.text("Name, content, and path are required", 400);
  }

  await c.env.DB.prepare(
    "INSERT INTO comments (name, content, path) VALUES (?, ?, ?)",
  )
    .bind(name, content, path)
    .run();

  return c.text("Comment added successfully", 201);
});

app.get("/demo", (c) => {
  const demoPage = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Comment System Demo</title>
    </head>
    <body>
      <h1>Demo Comment System</h1>
      <div id="comment-section"></div>

      <script src="/embed.js"></script>
      <script>
        bilu.init({
          id: 'comment-section',
          url: location.origin,
          path: '/demo'
        });
      </script>
    </body>
    </html>
  `;

  c.header("Content-Type", "text/html");
  return c.html(demoPage);
});

export default app;

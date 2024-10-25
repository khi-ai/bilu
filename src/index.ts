import { Hono } from "hono/tiny";

import comments, { COMMENT } from "./libs/comments";
import { demo, embed } from "./libs/embed";

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

app.get("/embed.js", (c) => {
  c.header("Content-Type", "application/javascript");
  return c.render(embed);
});

app.get("/", (c) => {
  return c.html(demo);
});

export default app;

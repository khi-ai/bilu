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

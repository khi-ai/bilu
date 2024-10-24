import { KVNamespace } from "@cloudflare/workers-types";
import murmurhash from "murmurhash";

export interface COMMENT {
  id?: number;
  user: string;
  comment: string;
  timestamp?: number;
}

export const hash = (data: string, secret: number = 23): string => {
  return murmurhash.v3(data, secret).toString(16);
};

const COMMENT_PREFIX = "comment_";

const getCommentFromIds = async (
  KV: KVNamespace,
  keys: { name: string }[],
): Promise<COMMENT[]> => {
  const comments: COMMENT[] = [];
  for (const { name } of keys) {
    const comment: COMMENT | null = await KV.get(name, "json");
    if (comment) {
      comments.push(comment);
    }
  }
  return comments;
};

const getAllComments = async (KV: KVNamespace): Promise<COMMENT[]> => {
  const { keys } = await KV.list({ prefix: COMMENT_PREFIX });
  const comments: COMMENT[] = await getCommentFromIds(KV, keys);
  return comments;
};

const getCommentByPostUrl = async (
  KV: KVNamespace,
  url: string,
): Promise<COMMENT[]> => {
  const postId = hash(url);
  const { keys } = await KV.list({ prefix: COMMENT_PREFIX + postId });
  const comments: COMMENT[] = await getCommentFromIds(KV, keys);
  return comments;
};

const addCommentByPostUrl = async (
  KV: KVNamespace,
  url: string,
  comment: COMMENT,
): Promise<void> => {
  const postId = hash(url);
  const id = hash(comment.comment + comment.user);
  await KV.put(
    COMMENT_PREFIX + postId + "_" + id,
    JSON.stringify({ id, ...comment }),
  );
};

const comments = {
  all: getAllComments,
  getByPost: getCommentByPostUrl,
  addByPost: addCommentByPostUrl,
};

export default comments;

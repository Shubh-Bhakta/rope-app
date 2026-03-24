"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getUser,
  getCirclePosts,
  addCirclePost,
  addReaction,
  type CirclePost,
  type CircleTag,
  type User,
} from "@/lib/store";

const tagConfig: Record<CircleTag, { label: string; bg: string; text: string }> = {
  struggle: { label: "Struggle", bg: "bg-struggle", text: "text-white" },
  prayer_request: { label: "Prayer Request", bg: "bg-prayer", text: "text-white" },
  praise: { label: "Praise", bg: "bg-praise", text: "text-dark" },
};

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function CirclePage() {
  const [user, setUserState] = useState<User | null>(null);
  const [posts, setPosts] = useState<CirclePost[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [tag, setTag] = useState<CircleTag>("prayer_request");
  const [content, setContent] = useState("");
  const [anonymous, setAnonymous] = useState(false);

  const refreshPosts = useCallback(() => {
    setPosts(getCirclePosts());
  }, []);

  useEffect(() => {
    const u = getUser();
    setUserState(u);
    refreshPosts();
  }, [refreshPosts]);

  function handleShare() {
    if (!user || !content.trim()) return;
    addCirclePost({
      userId: user.id,
      userName: anonymous ? user.anonymousAlias : user.name,
      isAnonymous: anonymous,
      tag,
      content: content.trim(),
    });
    setContent("");
    setAnonymous(false);
    setShowForm(false);
    refreshPosts();
  }

  function handleReaction(postId: string, type: "prayed" | "encouraged") {
    if (!user) return;
    addReaction(postId, user.id, type);
    refreshPosts();
  }

  return (
    <div className="px-5 pt-6 pb-8">
      <div className="mb-6">
        <h1 className="font-serif text-2xl text-brown">Campus Circle</h1>
        <p className="text-muted text-sm">Share with your community</p>
      </div>

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-3 bg-brown text-ivory font-semibold rounded-xl hover:bg-brown/90 active:scale-[0.98] transition-all mb-6"
        >
          New Post
        </button>
      ) : (
        <div className="bg-cream rounded-2xl p-5 shadow-sm mb-6">
          <p className="font-serif text-lg text-dark mb-3">Share something</p>

          <div className="flex gap-2 mb-4">
            {(Object.entries(tagConfig) as [CircleTag, typeof tagConfig.struggle][]).map(
              ([key, config]) => (
                <button
                  key={key}
                  onClick={() => setTag(key)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                    tag === key
                      ? `${config.bg} ${config.text} scale-105`
                      : "bg-ivory text-muted"
                  }`}
                >
                  {config.label}
                </button>
              )
            )}
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your heart?"
            rows={4}
            className="w-full px-4 py-3 bg-ivory border border-brown/15 rounded-xl text-dark placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-brown/20 text-sm leading-relaxed resize-none mb-4"
          />

          <div className="flex items-center justify-between mb-4">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <button
                type="button"
                role="switch"
                aria-checked={anonymous}
                onClick={() => setAnonymous(!anonymous)}
                className={`relative w-10 h-5.5 rounded-full transition-colors ${
                  anonymous ? "bg-brown" : "bg-muted/30"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-ivory rounded-full shadow transition-transform ${
                    anonymous ? "translate-x-[18px]" : "translate-x-0"
                  }`}
                />
              </button>
              <span className="text-sm text-dark">Post anonymously</span>
            </label>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleShare}
              disabled={!content.trim()}
              className="flex-1 py-2.5 bg-brown text-ivory font-semibold rounded-xl hover:bg-brown/90 disabled:opacity-40 transition-all text-sm"
            >
              Share
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setContent("");
              }}
              className="px-4 py-2.5 text-muted border border-muted/30 rounded-xl text-sm hover:bg-ivory/50 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted text-sm">
              No posts yet. Be the first to share.
            </p>
          </div>
        )}

        {posts.map((post) => {
          const config = tagConfig[post.tag];
          const prayedCount = post.reactions.filter((r) => r.type === "prayed").length;
          const encouragedCount = post.reactions.filter((r) => r.type === "encouraged").length;
          const userPrayed = user
            ? post.reactions.some((r) => r.userId === user.id && r.type === "prayed")
            : false;
          const userEncouraged = user
            ? post.reactions.some((r) => r.userId === user.id && r.type === "encouraged")
            : false;

          return (
            <article key={post.id} className="bg-cream rounded-2xl p-5 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <span
                  className={`${config.bg} ${config.text} px-3 py-1 rounded-full text-xs font-medium`}
                >
                  {config.label}
                </span>
                <span className="text-muted text-xs">{relativeTime(post.createdAt)}</span>
              </div>

              <p className="text-dark text-sm leading-relaxed mb-3">{post.content}</p>

              <p className="text-muted text-xs mb-3">
                {post.isAnonymous ? post.userName : post.userName}
              </p>

              <div className="flex gap-3 border-t border-muted/15 pt-3">
                <button
                  onClick={() => handleReaction(post.id, "prayed")}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition ${
                    userPrayed
                      ? "bg-brown/10 text-brown font-medium"
                      : "text-muted hover:bg-ivory"
                  }`}
                >
                  Prayed {prayedCount > 0 && `(${prayedCount})`}
                </button>
                <button
                  onClick={() => handleReaction(post.id, "encouraged")}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition ${
                    userEncouraged
                      ? "bg-brown/10 text-brown font-medium"
                      : "text-muted hover:bg-ivory"
                  }`}
                >
                  Encouraged {encouragedCount > 0 && `(${encouragedCount})`}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <p className="text-muted/40 text-xs italic text-center mt-8">
        Bear one another&apos;s burdens &mdash; Galatians 6:2
      </p>
    </div>
  );
}

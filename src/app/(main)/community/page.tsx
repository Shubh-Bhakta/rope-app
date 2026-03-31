"use client";

import { useState, useEffect, useRef } from "react";
import { 
  getPublicPrayers, 
  getForumPosts, 
  createForumPost, 
  amenPrayer, 
  votePost, 
  postReply, 
  getForumPostWithReplies, 
  togglePrayerPublic,
  getPrayerWithReplies,
  postPrayerReply,
  getCommunityFeed,
  deleteForumPost,
  deleteVerseComment,
  deleteForumReply,
  deletePrayerReply
} from "@/lib/community-actions";
import { useAuth } from "@clerk/nextjs";
import { OliveBranch } from "@/components/Accents";
import { fetchVerse } from "@/lib/store";

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<'feed' | 'forum' | 'prayers'>('feed');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [prayers, setPrayers] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [feed, setFeed] = useState<any[]>([]);
  const [feedPage, setFeedPage] = useState(0);
  const [hasMoreFeed, setHasMoreFeed] = useState(true);
  
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedPrayerId, setSelectedPrayerId] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [newPost, setNewPost] = useState({ title: "", content: "", category: "General" });
  const [posting, setPosting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { userId } = useAuth();

  useEffect(() => {
    if (errorNotice) {
      const timer = setTimeout(() => setErrorNotice(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorNotice]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prayersData, postsData, feedData] = await Promise.all([
        getPublicPrayers(),
        getForumPosts(),
        getCommunityFeed(0, 20)
      ]);
      setPrayers(prayersData);
      setPosts(postsData);
      setFeed(feedData);
      setFeedPage(0);
      setHasMoreFeed(feedData.length >= 20);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreFeed = async () => {
    if (loadingMore || !hasMoreFeed) return;
    setLoadingMore(true);
    try {
      const nextPage = feedPage + 1;
      const moreData = await getCommunityFeed(nextPage, 20);
      if (moreData.length === 0) {
        setHasMoreFeed(false);
      } else {
        setFeed(prev => [...prev, ...moreData]);
        setFeedPage(nextPage);
        setHasMoreFeed(moreData.length >= 20);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  async function handleCreatePost() {
    if (!newPost.title.trim() || !newPost.content.trim()) return;
    setPosting(true);
    setErrorNotice(null);
    try {
      await createForumPost(newPost.title, newPost.content, newPost.category);
      setNewPost({ title: "", content: "", category: "General" });
      setShowCreatePost(false);
      loadData();
    } catch (err: any) {
      setErrorNotice(err.message || "Could not create discussion. Please try again.");
    } finally {
      setPosting(false);
    }
  }

  const handleAmen = async (id: string) => {
    if (!userId) return;
    setPrayers(prev => prev.map(p => {
      if (p.id === id) {
        return { 
          ...p, 
          amenCount: p.userAmen ? p.amenCount - 1 : p.amenCount + 1, 
          userAmen: !p.userAmen 
        };
      }
      return p;
    }));
    await amenPrayer(id);
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      await deleteForumPost(id);
      loadData();
    } catch (err) {
      console.error(err);
      setErrorNotice("Could not delete post.");
    }
  };

  const handleDeleteComment = async (id: string) => {
    if (!confirm("Are you sure you want to delete this discussion?")) return;
    try {
      await deleteVerseComment(id);
      loadData();
    } catch (err) {
      console.error(err);
      setErrorNotice("Could not delete discussion.");
    }
  };

  return (
    <div className="px-5 pt-6 pb-20 max-w-2xl mx-auto relative min-h-screen" style={{ animation: "fadeIn 0.4s ease-out both" }}>
      {/* Help icon - moved to global fixed position */}
      <button 
        onClick={() => setShowHelp(true)}
        className="fixed right-6 top-1/2 -translate-y-1/2 z-40 w-10 h-10 rounded-full bg-ivory border border-brown/10 shadow-elevated flex items-center justify-center text-muted hover:text-brown hover:scale-110 active:scale-95 transition-all"
        title="Community Help"
      >
        <span className="font-serif text-lg leading-none">?</span>
      </button>

      {errorNotice && (
        <div className="fixed top-6 left-5 right-5 z-[100] p-4 bg-red-500 text-white text-xs font-bold rounded-2xl shadow-lg animate-bounce">
          {errorNotice}
        </div>
      )}
      <h1 className="font-serif text-3xl text-brown mb-2 text-center">Community</h1>
      <div className="flex justify-center mb-6 relative">
        <div className="inline-flex p-1 bg-brown/5 rounded-2xl relative">
          <button 
            onClick={() => setActiveTab('feed')}
            className={`px-6 py-2 text-[10px] uppercase font-bold tracking-widest rounded-xl transition ${activeTab === 'feed' ? "bg-brown text-ivory shadow-lg shadow-brown/20" : "text-muted hover:text-brown"}`}
          >
            Stream
          </button>
          <button 
            onClick={() => setActiveTab('forum')}
            className={`px-6 py-2 text-[10px] uppercase font-bold tracking-widest rounded-xl transition ${activeTab === 'forum' ? "bg-brown text-ivory shadow-lg shadow-brown/20" : "text-muted hover:text-brown"}`}
          >
            Topics
          </button>
          <button 
            onClick={() => setActiveTab('prayers')}
            className={`px-6 py-2 text-[10px] uppercase font-bold tracking-widest rounded-xl transition ${activeTab === 'prayers' ? "bg-brown text-ivory shadow-lg shadow-brown/20" : "text-muted hover:text-brown"}`}
          >
            Prayers
          </button>
        </div>
        
        <button 
          onClick={() => setShowHelp(true)}
          className="absolute right-[-40px] top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-brown/5 text-muted hover:text-brown transition"
          title="Community Guide"
        >
          <span className="font-serif italic text-lg text-brown/40">?</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-8 h-8 border-2 border-brown/20 border-t-brown rounded-full animate-spin" />
          <p className="text-muted font-serif italic text-sm">Gathering the community...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Stream Tab */}
          {activeTab === 'feed' && (
            <div className="space-y-6" style={{ animation: "fadeInUp 0.4s ease-out both" }}>
              <div className="p-6 bg-brown/[0.03] border border-brown/10 rounded-[2rem] text-center mb-8">
                <p className="text-dark text-sm italic font-serif">"Encourage one another and build each other up."</p>
              </div>
              
              {feed.map((item) => {
                if (item.type === 'discussion') {
                  return <VerseDiscussionCard key={item.id} item={item} />;
                }
                return (
                  <CommunityCard 
                    key={item.id} 
                    item={item} 
                    type={item.type === 'post' ? 'post' : 'prayer'} 
                    currentUserId={userId}
                    onAmen={() => handleAmen(item.id)}
                    onLike={() => handleLike(item.id)}
                    onOpen={() => {
                      if (item.type === 'post') setSelectedPostId(item.id);
                      else setSelectedPrayerId(item.id);
                    }}
                    onUnshare={async () => {
                      if (item.type === 'post') return;
                      await togglePrayerPublic(item.id, false);
                      loadData();
                    }}
                  />
                );
              })}

              {hasMoreFeed && (
                <button 
                  onClick={loadMoreFeed}
                  disabled={loadingMore}
                  className="w-full py-4 text-[10px] uppercase font-bold tracking-widest text-brown/40 border border-brown/10 rounded-2xl hover:bg-brown/5 transition-all"
                >
                  {loadingMore ? "Loading more..." : "Load More Stream"}
                </button>
              )}
            </div>
          )}

          {/* Topics Tab */}
          {activeTab === 'forum' && (
            <div className="space-y-6" style={{ animation: "fadeInUp 0.4s ease-out both" }}>
              <div className="flex items-center justify-between mb-4 px-2">
                <h2 className="text-[10px] text-muted uppercase tracking-[0.2em] font-bold">Discussion Threads</h2>
                <button 
                  onClick={() => setShowCreatePost(true)}
                  className="px-4 py-1.5 bg-brown text-ivory text-[9px] uppercase font-bold tracking-widest rounded-xl shadow-md shadow-brown/10 hover:scale-105 transition"
                >
                  + New Topic
                </button>
              </div>
              
              {posts.length === 0 ? (
                <div className="text-center py-12">
                   <p className="text-sm text-muted italic">No topics yet. Start a conversation!</p>
                </div>
              ) : (
                posts.map(p => (
                  <CommunityCard 
                    key={p.id} 
                    item={p} 
                    type="post" 
                    onLike={() => handleLike(p.id)}
                    onOpen={() => setSelectedPostId(p.id)} 
                  />
                ))
              )}
            </div>
          )}

          {/* Prayers Tab */}
          {activeTab === 'prayers' && (
            <div className="space-y-6" style={{ animation: "fadeInUp 0.4s ease-out both" }}>
              <div className="p-4 bg-brown/5 border border-brown/10 rounded-2xl mb-6">
                <p className="text-[10px] text-brown font-bold uppercase tracking-widest mb-1">How to Share</p>
                <p className="text-xs text-muted leading-relaxed">
                  Have a testimony? You can publish your answered prayers to this feed from your <span className="font-bold text-brown">Prayers &gt; Answered</span> page.
                </p>
              </div>
              <h2 className="text-[10px] text-muted uppercase tracking-[0.2em] font-bold mb-4 ml-2">Public Answered Prayers</h2>
              {prayers.length === 0 ? (
                <div className="text-center py-12">
                   <p className="text-sm text-muted italic">Share your answered prayers to inspire the community.</p>
                </div>
              ) : (
                prayers.map(p => (
                  <CommunityCard 
                    key={p.id} 
                    item={p} 
                    type="prayer" 
                    currentUserId={userId}
                    onAmen={() => handleAmen(p.id)}
                    onOpen={() => setSelectedPrayerId(p.id)}
                    onUnshare={async () => {
                      await togglePrayerPublic(p.id, false);
                      loadData();
                    }}
                  />
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Create Topic Modal Backdrop */}
      {showCreatePost && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center px-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300">
          <div 
            className="w-full max-w-lg bg-ivory rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom-10"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-serif text-2xl text-brown">Start a Topic</h3>
              <button onClick={() => setShowCreatePost(false)} className="text-muted hover:text-brown transition">✕</button>
            </div>
            <div className="space-y-4">
              <input 
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                placeholder="Title"
                className="w-full px-4 py-3 bg-brown/5 border border-brown/10 rounded-xl text-dark text-sm focus:outline-none focus:ring-1 focus:ring-brown/30"
              />
              <textarea 
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                placeholder="What's on your heart?"
                rows={4}
                className="w-full px-4 py-3 bg-brown/5 border border-brown/10 rounded-xl text-dark text-sm focus:outline-none focus:ring-1 focus:ring-brown/30 resize-none"
              />
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  onClick={() => setShowCreatePost(false)}
                  className="px-6 py-2 text-[10px] uppercase font-bold tracking-widest text-muted hover:text-brown transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreatePost}
                  disabled={posting || !newPost.title || !newPost.content}
                  className="px-8 py-2 bg-brown text-ivory text-[10px] uppercase font-bold tracking-widest rounded-xl shadow-lg shadow-brown/20 hover:scale-105 active:scale-95 transition disabled:opacity-50"
                >
                  {posting ? "Posting..." : "Publish Topic"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {(selectedPostId || selectedPrayerId) && (
        <ForumPostDrawer 
          postId={selectedPostId} 
          prayerId={selectedPrayerId}
          onClose={() => { setSelectedPostId(null); setSelectedPrayerId(null); }}
        />
      )}

      {/* Standardized Help Modal */}
      {showHelp && (
        <CommunityHelpModal onClose={() => setShowHelp(false)} />
      )}
    </div>
  );
}

function CommunityHelpModal({ onClose }: { onClose: () => void }) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        ref={modalRef}
        className="max-w-md w-full bg-ivory border border-brown/15 shadow-2xl rounded-[3rem] overflow-hidden animate-in fade-in zoom-in duration-400"
      >
        <div className="bg-brown/5 px-8 py-6 border-b border-brown/10 flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold text-brown">Community Compass</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-muted hover:bg-brown/10 hover:text-brown transition-colors">
            ✕
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-brown/10 flex items-center justify-center shrink-0 text-lg">✨</div>
              <div>
                <p className="text-sm font-bold text-dark mb-1">The Stream</p>
                <p className="text-xs text-muted leading-relaxed">A living chronological record of what God is doing. See discussion posts, topics, and public testimonies as they happen.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-brown/10 flex items-center justify-center shrink-0 text-lg">💬</div>
              <div>
                <p className="text-sm font-bold text-dark mb-1">Topics</p>
                <p className="text-xs text-muted leading-relaxed">Deeper dives into specific themes or questions. Join a thread to explore truths withothers.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-brown/10 flex items-center justify-center shrink-0 text-lg">🙏</div>
              <div>
                <p className="text-sm font-bold text-dark mb-1">Public Prayers</p>
                <p className="text-xs text-muted leading-relaxed">Testimonies of answered prayer. Share yours from your prayer journal to encourage the body of Christ.</p>
              </div>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-full py-4 bg-brown text-ivory rounded-2xl font-bold text-sm hover:bg-brown/90 shadow-lg shadow-brown/20 transition-all active:scale-[0.98]"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}

function CommunityCard({ item, type, onAmen, onLike, onOpen, onUnshare, currentUserId }: { 
  item: any; 
  type: 'prayer' | 'post'; 
  onAmen?: () => void; 
  onLike?: () => void; 
  onOpen?: () => void;
  onUnshare?: () => void;
  currentUserId?: string | null;
}) {
  const isAmen = item.userAmen;
  const isLiked = item.userLiked;
  const isOwner = currentUserId && item.userId === currentUserId;
  const replyCount = item.replyCount || 0;
  
  return (
    <div 
      className="card-surface rounded-2xl p-5 border-l-3 border-l-transparent hover:border-l-brown/30 transition-all duration-300 group cursor-pointer"
      onClick={onOpen}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-brown/5 flex-shrink-0 overflow-hidden ring-2 ring-ivory group-hover:ring-brown/10 transition-all">
          {item.profile?.imageUrl ? (
            <img src={item.profile.imageUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-brown/40">
              {item.profile?.displayName?.charAt(0) || "?"}
            </div>
          )}
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold text-brown leading-tight">{item.profile?.displayName || "Anonymous"}</p>
          <p className="text-[10px] text-muted-dark/50 uppercase tracking-tighter">
            {type === 'prayer' ? "Answered Prayer" : item.category || "Forum Topic"}
          </p>
        </div>
        <div className="text-right">
          <span className="text-[9px] text-muted-dark/30 font-medium">
            {new Date(item.createdAt || item.publicAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="mb-5 pl-13">
        {item.title && <h3 className="font-serif text-lg text-brown mb-2 leading-snug">{item.title}</h3>}
        <p className="text-sm text-dark leading-relaxed line-clamp-3 select-none">{item.content}</p>
      </div>

      <div className="flex items-center gap-4 pt-4 border-t border-brown/5 pl-13">
        <button 
          onClick={(e) => { e.stopPropagation(); type === 'prayer' ? onAmen?.() : onLike?.(); }}
          className={`flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest transition-colors ${(type === 'prayer' ? isAmen : isLiked) ? "text-accent-gold" : "text-muted hover:text-brown"}`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill={(type === 'prayer' ? isAmen : isLiked) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          {type === 'prayer' ? (item.amenCount || 0) : (item.likeCount || 0)} {type === 'prayer' ? "Amen" : "Like"}
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onOpen?.(); }}
          className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-muted hover:text-brown transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-7.6 8.38 8.38 0 0 1 3.8.9L21 3z"/></svg>
          {replyCount} Replies
        </button>
        {type === 'prayer' && isOwner && (
          <button 
            onClick={(e) => { e.stopPropagation(); if(confirm("Make this prayer private again?")) onUnshare?.(); }}
            className="ml-auto text-[9px] uppercase font-bold tracking-widest text-red-400/60 hover:text-red-400 transition-colors"
          >
            Unshare
          </button>
        )}
      </div>
    </div>
  );
}

function ForumPostDrawer({ postId, prayerId, onClose }: { postId: string | null; prayerId: string | null; onClose: () => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { userId } = useAuth();

  const loadData = async () => {
    setLoading(true);
    try {
      if (postId) {
        const d = await getForumPostWithReplies(postId);
        setData(d);
      } else if (prayerId) {
        const d = await getPrayerWithReplies(prayerId);
        setData(d);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [postId, prayerId]);

  async function handlePostReply() {
    if (!reply.trim() || !userId) return;
    setPosting(true);
    setError(null);
    try {
      if (postId) await postReply(postId, reply);
      else if (prayerId) await postPrayerReply(prayerId, reply);
      setReply("");
      loadData();
    } catch (err: any) {
      setError(err.message || "Could not post reply.");
    } finally {
      setPosting(false);
    }
  }

  return (
    <div 
      className="fixed inset-x-0 bottom-0 z-50 flex flex-col max-h-[90vh] bg-ivory rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.15)] border-t border-brown/5 overflow-hidden"
      style={{ animation: "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both" }}
    >
      <div className="flex justify-center p-4">
        <div className="w-10 h-1 bg-brown/10 rounded-full" />
      </div>

      <div className="px-6 pb-4 flex items-center justify-between border-b border-brown/5 relative">
        <div>
          <h2 className="font-serif text-lg text-dark">{prayerId ? "Testimony Discussion" : "Forum Thread"}</h2>
          {error && (
            <div className="absolute top-1/2 -translate-y-1/2 right-12 px-3 py-1.5 bg-red-500 text-white text-[10px] uppercase font-bold tracking-widest rounded-lg shadow-lg animate-pulse z-[110]">
              {error}
            </div>
          )}
        </div>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-brown/5 text-muted hover:text-brown transition">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-2 border-brown/20 border-t-brown rounded-full animate-spin mx-auto mb-4" />
            <p className="text-xs text-muted italic">Gathering discussions...</p>
          </div>
        ) : (
          <div className="space-y-8 pb-10">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brown/10 ring-2 ring-brown/5 flex items-center justify-center text-brown/40 font-bold overflow-hidden">
                  {data?.profile?.imageUrl ? <img src={data.profile.imageUrl} alt="" className="w-full h-full object-cover" /> : data?.profile?.displayName?.charAt(0) || "?"}
                </div>
                <div>
                  <h3 className="font-serif text-xl text-brown leading-tight">{data?.title || "Public Testimony"}</h3>
                  <p className="text-[10px] text-muted uppercase tracking-widest">{data?.profile?.displayName || "Anonymous"} • {new Date(data?.createdAt || data?.publicAt).toLocaleDateString()}</p>
                </div>
              </div>
              <p className="text-sm text-dark leading-relaxed pl-[3.25rem] whitespace-pre-wrap">{data?.content}</p>
            </div>

            <div className="h-px bg-brown/5" />

            <div className="space-y-6">
              <h4 className="text-[10px] text-muted uppercase tracking-widest font-bold">Replies ({data?.replies?.length || 0})</h4>
              {data?.replies?.map((r: any) => (
                <div key={r.id} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-brown/5 shrink-0 overflow-hidden ring-1 ring-brown/5">
                    {r.profile?.imageUrl ? <img src={r.profile.imageUrl} alt="" className="w-full h-full object-cover" /> : r.profile?.displayName?.charAt(0) || "?"}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-brown">{r.profile?.displayName}</span>
                      <span className="text-[9px] text-muted">{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-dark leading-relaxed">{r.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-ivory border-t border-brown/5 safe-bottom">
        <div className="flex gap-3">
          <textarea 
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Build them up..."
            className="flex-1 px-4 py-3 bg-brown/5 border border-brown/10 rounded-2xl text-sm text-dark focus:outline-none focus:ring-1 focus:ring-brown/20 resize-none"
            rows={2}
          />
          <button 
            onClick={handlePostReply}
            disabled={posting || !reply.trim() || !userId}
            className="w-12 h-12 flex items-center justify-center bg-brown text-ivory rounded-2xl transition shadow-lg shadow-brown/10 disabled:opacity-30"
          >
            {posting ? "..." : "✈"}
          </button>
        </div>
      </div>
    </div>
  );
}

function VerseDiscussionCard({ item }: { item: any }) {
  return (
    <div className="card-surface rounded-2xl p-5 border-l-3 border-l-accent-gold/30 hover:border-l-accent-gold transition-all duration-300 group">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-brown/5 flex items-center justify-center text-[10px] font-bold text-brown/40 shrink-0 overflow-hidden ring-2 ring-ivory group-hover:ring-brown/10 transition-all">
          {item.profile?.imageUrl ? <img src={item.profile.imageUrl} alt="" className="w-full h-full object-cover" /> : item.profile?.displayName?.charAt(0) || "?"}
        </div>
        <div className="flex-1">
          <p className="text-[11px] font-bold text-brown leading-tight">{item.profile?.displayName || "Anonymous"}</p>
          <p className="text-[9px] text-muted-dark/40 uppercase tracking-tighter">Shared a Discussion Post</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-bold text-accent-gold uppercase tracking-widest">{item.book} {item.chapter}:{item.verse}</p>
        </div>
      </div>

      {/* Bibical Context */}
      <div className="mb-4 bg-brown/[0.04] border-l-2 border-brown/10 p-3 rounded-r-xl">
        <p className="text-[10px] text-brown font-bold uppercase tracking-widest mb-1 opacity-50">Referenced Verse</p>
        <p className="text-xs text-dark/70 italic leading-relaxed">
          {item.verseText || "(Reference recorded)"}
        </p>
      </div>

      <div className="space-y-3 mb-4">
        <p className="text-sm text-dark leading-relaxed font-serif bg-brown/[0.02] p-3 rounded-xl border border-brown/5">
          "{item.content}"
        </p>
        <a 
          href={`/bible?b=${item.book}&c=${item.chapter}&m=community`}
          className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted hover:text-brown transition-colors"
        >
          Read in Context →
        </a>
      </div>

      <div className="flex items-center gap-4 pt-4 border-t border-brown/5">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-accent-gold">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          {item.score || 0}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { getPublicPrayers, getForumPosts, createForumPost, getProfile, amenPrayer, votePost, postReply, getForumPostWithReplies } from "@/lib/community-actions";
import { useAuth } from "@clerk/nextjs";
import { OliveBranch, LampIcon } from "@/components/Accents";

// ─── Community Page ──────────────────────────────────────────────────────────

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<'feed' | 'prayers' | 'forum'>('feed');
  const [loading, setLoading] = useState(true);
  const { isLoaded, userId } = useAuth();
  
  const [prayers, setPrayers] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [newPost, setNewPost] = useState({ title: "", content: "", category: "General" });
  const [posting, setPosting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const p = await getPublicPrayers();
      const f = await getForumPosts();
      setPrayers(p);
      setPosts(f);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim() || !userId) return;
    setPosting(true);
    try {
      await createForumPost(newPost.title, newPost.content, newPost.category);
      setNewPost({ title: "", content: "", category: "General" });
      setShowCreatePost(false);
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setPosting(false);
    }
  };

  const handleAmen = async (id: string) => {
    if (!userId) return;
    // Optimistic
    setPrayers(prev => prev.map(p => {
      if (p.id === id) {
        return { 
          ...p, 
          userAmen: !p.userAmen, 
          amenCount: p.userAmen ? p.amenCount - 1 : p.amenCount + 1 
        };
      }
      return p;
    }));
    try {
      await amenPrayer(id);
    } catch {
      loadData();
    }
  };

  const handleLike = async (id: string) => {
    if (!userId) return;
    // Optimistic
    setPosts(prev => prev.map(p => {
      if (p.id === id) {
        return { 
          ...p, 
          userLiked: !p.userLiked, 
          likeCount: p.userLiked ? p.likeCount - 1 : p.likeCount + 1 
        };
      }
      return p;
    }));
    try {
      await votePost(id);
    } catch {
      loadData();
    }
  };

  return (
    <div className="px-5 pt-6 pb-20 max-w-2xl mx-auto" style={{ animation: "fadeIn 0.4s ease-out both" }}>
      {/* Header */}
      <h1 className="font-serif text-3xl text-brown mb-2 text-center">Community</h1>
      <div className="flex justify-center mb-6 relative">
        <OliveBranch className="opacity-50" />
        <button 
          onClick={() => setShowHelp(!showHelp)}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-brown/5 flex items-center justify-center text-muted hover:text-brown transition"
        >
          <span className="text-xs font-bold">?</span>
        </button>
      </div>

      {showHelp && (
        <div className="mb-8 p-6 bg-accent-gold/5 border border-accent-gold/10 rounded-3xl relative" style={{ animation: "fadeInDown 0.4s ease-out both" }}>
          <button onClick={() => setShowHelp(false)} className="absolute top-4 right-4 text-muted/40 hover:text-muted">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
          <h3 className="font-serif text-lg text-brown mb-3">Community Compass</h3>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-accent-gold/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[10px] text-accent-gold font-bold">1</span>
              </div>
              <p className="text-xs text-dark/70 leading-relaxed"><span className="font-bold">The Feed</span> shows public activity from across the community. It's a place for broad encouragement.</p>
            </div>
            <div className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-accent-gold/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[10px] text-accent-gold font-bold">2</span>
              </div>
              <p className="text-xs text-dark/70 leading-relaxed"><span className="font-bold">Answered Prayers</span> are testimonies of God's faithfulness. Saying "Amen" shows you're celebrating with them.</p>
            </div>
            <div className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-accent-gold/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[10px] text-accent-gold font-bold">3</span>
              </div>
              <p className="text-xs text-dark/70 leading-relaxed"><span className="font-bold">The Forum</span> is for deeper discussions. Ask questions, share struggles, or offer wisdom on specific topics.</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center justify-center mb-8">
        <div className="inline-flex p-1 bg-brown/5 rounded-2xl w-full">
          {(['feed', 'prayers', 'forum'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 text-xs uppercase font-bold tracking-widest rounded-xl transition-all duration-300 ${
                activeTab === tab
                  ? "bg-brown text-ivory shadow-lg shadow-brown/20"
                  : "text-muted hover:text-brown"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4">
          <div className="w-8 h-8 border-2 border-brown/10 border-t-brown rounded-full animate-spin" />
          <p className="text-sm text-muted font-serif italic">Gathering the saints...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Feed Tab */}
          {activeTab === 'feed' && (
            <div className="space-y-6" style={{ animation: "fadeInUp 0.4s ease-out both" }}>
              <div className="p-4 bg-accent-gold/5 border border-accent-gold/10 rounded-2xl text-center mb-8">
                <p className="text-xs text-accent-gold font-medium uppercase tracking-wider mb-1">Global Activity</p>
                <p className="text-dark text-sm italic">"Encourage one another and build each other up."</p>
              </div>
              
              {/* Combine prayers and posts for a feed */}
              {[...prayers, ...posts].sort((a,b) => new Date(b.createdAt || b.publicAt).getTime() - new Date(a.createdAt || a.publicAt).getTime()).map((item, i) => (
                <CommunityCard 
                  key={item.id} 
                  item={item} 
                  type={item.title ? 'post' : 'prayer'} 
                  onAmen={() => handleAmen(item.id)}
                  onLike={() => handleLike(item.id)}
                  onOpen={() => item.title && setSelectedPostId(item.id)}
                />
              ))}
            </div>
          )}

          {/* Prayers Tab */}
          {activeTab === 'prayers' && (
            <div className="space-y-6" style={{ animation: "fadeInUp 0.4s ease-out both" }}>
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
                    onAmen={() => handleAmen(p.id)}
                  />
                ))
              )}
            </div>
          )}

          {/* Forum Tab */}
          {activeTab === 'forum' && (
            <div className="space-y-6" style={{ animation: "fadeInUp 0.4s ease-out both" }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[10px] text-muted uppercase tracking-[0.2em] font-bold ml-2">Discussion Boards</h2>
                <button 
                  onClick={() => setShowCreatePost(true)}
                  className="px-4 py-1.5 bg-brown text-ivory text-[10px] uppercase font-bold tracking-widest rounded-full hover:bg-brown-light transition shadow-sm"
                >
                  New Topic
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
        </div>
      )}

      {/* Forum Post Detail Drawer */}
      {selectedPostId && (
        <ForumPostDrawer 
          postId={selectedPostId} 
          onClose={() => setSelectedPostId(null)}
        />
      )}

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-dark-brown/40 backdrop-blur-sm">
          <div className="bg-ivory w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4" style={{ animation: "bounceIn 0.4s ease-out both" }}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-serif text-xl text-brown">New Conversation</h3>
              <button onClick={() => setShowCreatePost(false)} className="text-muted hover:text-brown transition">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <input 
              value={newPost.title}
              onChange={(e) => setNewPost({...newPost, title: e.target.value})}
              placeholder="Topic Title"
              className="w-full px-4 py-3 bg-cream/30 border border-brown/10 rounded-xl text-dark text-sm focus:outline-none focus:ring-1 focus:ring-brown/20"
            />
            <textarea 
              value={newPost.content}
              onChange={(e) => setNewPost({...newPost, content: e.target.value})}
              placeholder="What's on your heart?"
              rows={4}
              className="w-full px-4 py-3 bg-cream/30 border border-brown/10 rounded-xl text-dark text-sm focus:outline-none focus:ring-1 focus:ring-brown/20 resize-none"
            />
            <button 
              disabled={posting || !newPost.title.trim() || !newPost.content.trim()}
              onClick={handleCreatePost}
              className="w-full py-3 bg-brown text-ivory rounded-xl text-sm font-bold shadow-lg shadow-brown/20 active:scale-95 transition-all disabled:opacity-30"
            >
              Post to Community
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CommunityCard({ item, type, onAmen, onLike, onOpen }: { item: any; type: 'prayer' | 'post'; onAmen?: () => void; onLike?: () => void; onOpen?: () => void }) {
  const isAmen = item.userAmen;
  const isLiked = item.userLiked;
  
  return (
    <div className="card-surface rounded-2xl p-5 border-l-3 border-l-transparent hover:border-l-brown/30 transition-all duration-300 group">
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
        <div>
          <p className="text-sm font-bold text-dark">{item.profile?.displayName || "Anonymous"}</p>
          <div className="flex items-center gap-2">
            <span className={`text-[9px] uppercase tracking-wider font-bold ${type === 'prayer' ? "text-accent-gold" : "text-accent-olive"}`}>
              {type === 'prayer' ? "Answered Prayer" : "Discussion"}
            </span>
            <span className="text-[9px] text-muted/40">•</span>
            <span className="text-[9px] text-muted/60">{new Date(item.createdAt || item.publicAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {type === 'post' && <h3 className="font-serif text-lg text-brown mb-2">{item.title}</h3>}
      
      <p className={`text-sm text-dark leading-relaxed ${type === 'prayer' ? "italic font-serif opacity-80" : ""}`}>
        {item.content || item.text}
      </p>

      {item.verse && (
        <div className="mt-3 px-3 py-1.5 bg-cream/30 rounded-lg inline-block">
          <p className="text-[10px] text-brown font-medium">Ref: {item.verse}</p>
        </div>
      )}

      <div className="flex items-center gap-6 mt-4 pt-4 border-t border-brown/5">
        <button 
          onClick={(e) => { e.stopPropagation(); type === 'prayer' ? onAmen?.() : onLike?.(); }}
          className={`flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest transition-colors ${
            (type === 'prayer' ? isAmen : isLiked) ? "text-accent-gold" : "text-muted hover:text-brown"
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill={(type === 'prayer' ? isAmen : isLiked) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          {type === 'prayer' ? (item.amenCount || 0) : (item.likeCount || 0)} {type === 'prayer' ? "Amen" : "Like"}
        </button>
        {type === 'post' && (
          <button 
            onClick={(e) => { e.stopPropagation(); onOpen?.(); }}
            className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-muted hover:text-brown transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-7.6 8.38 8.38 0 0 1 3.8.9L21 3z"/></svg>
            {item.replyCount || 0} Replies
          </button>
        )}
      </div>
    </div>
  );
}

function ForumPostDrawer({ postId, onClose }: { postId: string; onClose: () => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [posting, setPosting] = useState(false);
  const { userId } = useAuth();

  const loadThread = async () => {
    setLoading(true);
    try {
      const res = await getForumPostWithReplies(postId);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadThread();
  }, [postId]);

  const handleReply = async () => {
    if (!reply.trim() || !userId) return;
    setPosting(true);
    try {
      await postReply(postId, reply);
      setReply("");
      loadThread();
    } catch (err) {
      console.error(err);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div 
      className="fixed inset-x-0 bottom-0 z-50 flex flex-col max-h-[90vh] bg-ivory rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.15)] border-t border-brown/5 overflow-hidden"
      style={{ animation: "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both" }}
    >
      <div className="flex justify-center p-3 shrink-0">
        <div className="w-10 h-1 bg-brown/10 rounded-full" />
      </div>

      <div className="px-6 pb-4 flex items-center justify-between border-b border-brown/5 shrink-0">
        <div>
          <h2 className="font-serif text-lg text-brown line-clamp-1">{data?.title || "Discussion"}</h2>
          <p className="text-[9px] text-muted uppercase tracking-widest font-bold">{data?.category || "Thread"}</p>
        </div>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-brown/5 text-muted hover:text-brown transition">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-4">
            <div className="w-6 h-6 border-2 border-brown/10 border-t-brown rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-8 pb-10">
            {/* Main Post */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brown/5 overflow-hidden ring-2 ring-ivory shadow-sm">
                  <img src={data?.profile?.imageUrl} alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-sm font-bold text-dark">{data?.profile?.displayName}</p>
                  <p className="text-[10px] text-muted">{new Date(data?.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <p className="text-base text-dark leading-relaxed font-serif">{data?.content}</p>
            </div>

            <div className="h-px bg-brown/5" />

            {/* Replies */}
            <div className="space-y-6">
              <h4 className="text-[10px] text-muted uppercase tracking-widest font-bold">Replies ({data?.replies?.length || 0})</h4>
              {data?.replies?.map((r: any) => (
                <div key={r.id} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-brown/5 overflow-hidden ring-1 ring-brown/5 shrink-0">
                    <img src={r.profile?.imageUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-brown">{r.profile?.displayName}</span>
                      <span className="text-[9px] text-muted/60">{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-dark/90 leading-relaxed">{r.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-ivory border-t border-brown/5 shrink-0 safe-bottom">
        <div className="flex gap-3">
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Add to the conversation..."
            rows={2}
            className="flex-1 px-4 py-3 bg-cream/30 border border-brown/10 rounded-2xl text-dark text-sm resize-none focus:outline-none"
          />
          <button
            onClick={handleReply}
            disabled={posting || !reply.trim() || !userId}
            className="w-12 h-12 flex items-center justify-center bg-brown text-ivory rounded-2xl disabled:opacity-30 transition-all active:scale-95"
          >
            {posting ? <div className="w-4 h-4 border-2 border-ivory/20 border-t-ivory rounded-full animate-spin" /> : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>}
          </button>
        </div>
      </div>
    </div>
  );
}

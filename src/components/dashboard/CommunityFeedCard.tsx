import React, { useState } from 'react';
import { Heart, Bookmark, Share2, MessageSquare, Send, User } from 'lucide-react';
import type { FeedPost } from '../../context/CitizenContext';
import { useCitizen } from '../../context/CitizenContext';
import { motion, AnimatePresence } from 'framer-motion';

interface CommunityFeedCardProps {
  post: FeedPost;
}

export const CommunityFeedCard: React.FC<CommunityFeedCardProps> = ({ post }) => {
  const { toggleLikeFeedPost, toggleBookmarkFeedPost } = useCitizen();
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<{ author: string; text: string; time: string }[]>([
    { author: 'Jane Cooper', text: 'This was resolved so quickly, thanks for the post!', time: '2h ago' },
    { author: 'Robert Fox', text: 'Agree! Our street is much cleaner now.', time: '1h ago' }
  ]);
  const [newComment, setNewComment] = useState('');

  const handleLike = () => {
    toggleLikeFeedPost(post.id);
  };

  const handleBookmark = () => {
    toggleBookmarkFeedPost(post.id);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.content,
        url: window.location.href
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(`${post.title}\n\n${post.content}`);
      alert('Post details copied to clipboard!');
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setComments(prev => [
      ...prev,
      { author: 'You', text: newComment.trim(), time: 'Just now' }
    ]);
    setNewComment('');
  };

  const getCategoryStyles = (category: string) => {
    const styles: Record<string, string> = {
      'Community Issue': 'bg-primary/10 text-primary border-primary/20',
      'Event': 'bg-accent/10 text-accent border-accent/20',
      'Emergency': 'bg-rose-500/10 text-rose-500 border-rose-500/20',
      'Gov Announcement': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
    };
    return styles[category] || 'bg-slate-500/10 text-slate-500 border-slate-500/20';
  };

  return (
    <div className="bg-slate-900/30 dark:bg-slate-900/30 light:bg-white/40 border border-white/10 dark:border-white/5 light:border-slate-200/80 rounded-2xl p-6 backdrop-blur-md shadow-sm transition-all hover:shadow-md space-y-4">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex gap-3 items-center">
          <div className="w-10 h-10 rounded-full bg-slate-800 dark:bg-slate-800 light:bg-slate-200 text-slate-400 flex items-center justify-center shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
              {post.author_name}
            </h4>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 flex items-center gap-1.5">
              <span>{post.author_role}</span>
              <span>•</span>
              <span>{new Date(post.created_at).toLocaleDateString()}</span>
            </span>
          </div>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${getCategoryStyles(post.category)}`}>
          {post.category}
        </span>
      </div>

      {/* Content */}
      <div className="space-y-2">
        <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-slate-100">
          {post.title}
        </h3>
        <p className="text-sm text-slate-655 dark:text-slate-350 leading-relaxed whitespace-pre-line">
          {post.content}
        </p>
      </div>

      {/* Actions toolbar */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5 dark:border-white/5 light:border-slate-200/50">
        <div className="flex gap-4">
          {/* Like */}
          <button 
            onClick={handleLike}
            className={`flex items-center gap-1.5 text-xs font-semibold py-1 px-2.5 rounded-lg hover:bg-slate-800/50 dark:hover:bg-slate-800/50 light:hover:bg-slate-100 transition-colors ${
              post.is_liked ? 'text-rose-500' : 'text-slate-505 dark:text-slate-400 hover:text-slate-905 dark:hover:text-slate-205'
            }`}
          >
            <Heart className={`w-4 h-4 ${post.is_liked ? 'fill-current' : ''}`} />
            <span>{post.likes_count}</span>
          </button>
          
          {/* Comment toggle */}
          <button 
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-1.5 text-xs font-semibold py-1 px-2.5 rounded-lg hover:bg-slate-800/50 dark:hover:bg-slate-800/50 light:hover:bg-slate-100 transition-colors ${
              showComments ? 'text-primary' : 'text-slate-505 dark:text-slate-400 hover:text-slate-905 dark:hover:text-slate-205'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>{comments.length}</span>
          </button>
        </div>

        <div className="flex gap-2">
          {/* Bookmark */}
          <button 
            onClick={handleBookmark}
            className={`p-1.5 rounded-lg hover:bg-slate-800/50 dark:hover:bg-slate-800/50 light:hover:bg-slate-100 transition-colors ${
              post.is_bookmarked ? 'text-accent' : 'text-slate-505 dark:text-slate-400 hover:text-slate-905 dark:hover:text-slate-205'
            }`}
            aria-label="Bookmark post"
          >
            <Bookmark className={`w-4.5 h-4.5 ${post.is_bookmarked ? 'fill-current' : ''}`} />
          </button>

          {/* Share */}
          <button 
            onClick={handleShare}
            className="p-1.5 rounded-lg hover:bg-slate-800/50 dark:hover:bg-slate-800/50 light:hover:bg-slate-100 text-slate-505 dark:text-slate-400 hover:text-slate-905 dark:hover:text-slate-205 transition-colors"
            aria-label="Share post"
          >
            <Share2 className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* Comments Drawer */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-white/5 dark:border-white/5 light:border-slate-200/50 pt-4 space-y-4"
          >
            {/* List */}
            <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {comments.map((comment, i) => (
                <div key={i} className="bg-slate-800/20 dark:bg-slate-800/20 light:bg-slate-100/50 p-3 rounded-xl border border-white/5 dark:border-white/5 light:border-slate-200/40 text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-805 dark:text-slate-205">{comment.author}</span>
                    <span className="text-[9px] text-slate-500">{comment.time}</span>
                  </div>
                  <p className="text-slate-650 dark:text-slate-350">{comment.text}</p>
                </div>
              ))}
            </div>

            {/* Input form */}
            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 px-3 py-2 rounded-xl bg-slate-950/40 border border-white/10 dark:border-white/5 light:border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-slate-900 dark:text-slate-100"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-primary hover:bg-primary-dark text-white transition-colors"
                aria-label="Send comment"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CommunityFeedCard;

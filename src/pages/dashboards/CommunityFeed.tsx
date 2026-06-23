import React, { useEffect, useState } from 'react';
import { useCitizen } from '../../context/CitizenContext';
import { CommunityFeedCard } from '../../components/dashboard/CommunityFeedCard';
import { LoadingSkeleton } from '../../components/dashboard/LoadingSkeleton';
import { SectionHeader } from '../../components/SectionHeader';
import { SearchComponent } from '../../components/dashboard/SearchComponent';
import { FilterComponent } from '../../components/dashboard/FilterComponent';
import { Users } from 'lucide-react';

export const CommunityFeed: React.FC = () => {
  const { feedPosts, refreshDashboard, isLoading } = useCitizen();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  // Filtering feed posts in memory
  const filteredPosts = feedPosts.filter((post) => {
    const matchesSearch = 
      post.title.toLowerCase().includes(search.toLowerCase()) || 
      post.content.toLowerCase().includes(search.toLowerCase()) ||
      post.author_name.toLowerCase().includes(search.toLowerCase());
      
    const matchesCategory = category === 'All' || post.category === category;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 pb-10">
      <SectionHeader
        title="District Activity Stream"
        subtitle="Stay updated on recent issues, trending announcements, and events in your municipal zoning zone."
        badge="Community Feed"
        center={false}
      />

      {/* Search & filters */}
      <div className="bg-slate-900/20 dark:bg-slate-900/20 light:bg-white/40 border border-white/10 dark:border-white/5 light:border-slate-200/80 rounded-2xl p-5 backdrop-blur-md shadow-sm flex flex-col md:flex-row gap-5 items-end justify-between">
        
        <SearchComponent 
          value={search} 
          onChange={setSearch} 
          placeholder="Search community posts, events, author name..." 
          className="flex-1"
        />

        <FilterComponent
          label="Post Type"
          value={category}
          onChange={setCategory}
          options={['All', 'Community Issue', 'Event', 'Emergency', 'Gov Announcement']}
        />
      </div>

      {/* Feed Stream */}
      {isLoading ? (
        <LoadingSkeleton type="feed" count={3} />
      ) : (
        <div className="grid grid-cols-1 gap-6 max-w-3xl mx-auto">
          {filteredPosts.map((post) => (
            <CommunityFeedCard key={post.id} post={post} />
          ))}

          {filteredPosts.length === 0 && (
            <div className="text-center py-12 bg-slate-900/10 dark:bg-slate-900/10 light:bg-white/20 border border-dashed border-white/10 dark:border-white/5 light:border-slate-300 rounded-2xl">
              <Users className="w-12 h-12 text-slate-500 mx-auto mb-3" />
              <h4 className="font-heading font-semibold text-slate-705 dark:text-slate-305">Feed Stream Empty</h4>
              <p className="text-xs text-slate-500 mt-1">Check back later for recent announcements or modify search query.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CommunityFeed;

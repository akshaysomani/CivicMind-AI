import React, { useEffect } from 'react';
import { useCitizen } from '../../context/CitizenContext';
import { AchievementBadge } from '../../components/dashboard/AchievementBadge';
import { LoadingSkeleton } from '../../components/dashboard/LoadingSkeleton';
import { SectionHeader } from '../../components/SectionHeader';
import { Award, Target, CheckCircle2 } from 'lucide-react';
import { ProgressCard } from '../../components/dashboard/ProgressCard';

export const AchievementsPage: React.FC = () => {
  const { achievements, stats, refreshDashboard, isLoading } = useCitizen();

  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const overallProgress = achievements.length 
    ? Math.round((achievements.reduce((acc, curr) => acc + curr.progress, 0) / (achievements.length * 100)) * 100) 
    : 0;

  return (
    <div className="space-y-8 pb-10">
      <SectionHeader
        title="Civic Contribution Achievements"
        subtitle="Track your community score, unlock reporter badges, and level up your local coordinates involvement."
        badge="Citizen Gamification"
        center={false}
      />

      {/* Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Participation Stats */}
        <div className="bg-slate-900/30 dark:bg-slate-900/30 light:bg-white/40 border border-white/10 dark:border-white/5 light:border-slate-200/80 rounded-2xl p-5 backdrop-blur-md shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-primary/10 border border-primary/20 text-primary rounded-xl shrink-0">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Unlocked Badges</span>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 block">
              {unlockedCount} / {achievements.length}
            </span>
          </div>
        </div>

        {/* Community Score */}
        <div className="bg-slate-900/30 dark:bg-slate-900/30 light:bg-white/40 border border-white/10 dark:border-white/5 light:border-slate-200/80 rounded-2xl p-5 backdrop-blur-md shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-accent/10 border border-accent/20 text-accent rounded-xl shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Total Community Points</span>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 block">
              {stats?.participation_score || 50} pts
            </span>
          </div>
        </div>

        {/* Global Progress Bar */}
        <ProgressCard
          title="Overall Level Completion"
          description="Complete tasks and resolve issues to elevate your contributor rank."
          progress={overallProgress}
          badgeText="Level 1 Contributor"
          scoreLabel="Overall completion:"
        />
      </div>

      {/* Badges list */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-primary" />
          Earned & In-Progress Badges
        </h3>
        
        {isLoading ? (
          <LoadingSkeleton type="list" count={4} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {achievements.map((ach) => (
              <AchievementBadge key={ach.id} badge={ach} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AchievementsPage;

import { useNavigate } from 'react-router-dom';

import type { AppStoryCard } from '@sdkwork/whatseek-pc-core';

/** Editorial story card (appstore Today 故事卡) — links to its featured app. */
export function StoryCard({ story }: { story: AppStoryCard }) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => {
        navigate(`/apps/detail/${story.appId}`);
      }}
      className="flex w-48 shrink-0 flex-col items-start gap-2 rounded-2xl border border-border-subtle bg-brand-soft p-3 text-left transition-opacity hover:opacity-90"
    >
      <span
        aria-hidden="true"
        className="flex h-9 w-9 items-center justify-center rounded-xl bg-panel text-xl"
      >
        {story.icon}
      </span>
      <span className="line-clamp-2 text-sm font-semibold text-primary">{story.title}</span>
      <span className="line-clamp-2 text-xs text-secondary">{story.subtitle}</span>
    </button>
  );
}

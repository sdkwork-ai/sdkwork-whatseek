import { useNavigate } from 'react-router-dom';

import type { AppCollectionCard } from '@sdkwork/whatseek-pc-core';

/** Curated collection card (appstore 编辑精选合集) — opens the collection screen. */
export function CollectionCard({ collection }: { collection: AppCollectionCard }) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => {
        navigate(`/apps/collection/${collection.id}`);
      }}
      className="flex w-56 shrink-0 flex-col items-start gap-2 rounded-2xl border border-border-subtle bg-panel p-3 text-left transition-colors hover:bg-panel-muted"
    >
      <span className="grid w-full grid-cols-2 gap-1">
        {collection.coverApps.map((app) => (
          <span
            key={app.id}
            aria-hidden="true"
            className="flex h-10 items-center justify-center rounded-lg bg-panel-muted text-lg"
          >
            {app.icon}
          </span>
        ))}
      </span>
      <span className="line-clamp-1 text-sm font-semibold text-primary">{collection.title}</span>
      <span className="line-clamp-2 text-xs text-secondary">{collection.description}</span>
    </button>
  );
}

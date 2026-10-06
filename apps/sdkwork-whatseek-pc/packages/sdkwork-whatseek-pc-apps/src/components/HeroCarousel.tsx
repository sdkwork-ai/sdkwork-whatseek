import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { AppHeroSlide } from '@sdkwork/whatseek-pc-core';

/**
 * Appstore-style hero banner (sdkwork-appstore PRD §5.1): scroll-snap
 * carousel of editorial slides with a dot pager.
 */
export function HeroCarousel({ slides }: { slides: readonly AppHeroSlide[] }) {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);

  if (slides.length === 0) {
    return null;
  }

  return (
    <div className="pt-3">
      <div
        className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth"
        onScroll={(event) => {
          const { scrollLeft, offsetWidth } = event.currentTarget;
          if (offsetWidth > 0) {
            setActiveIndex(Math.min(slides.length - 1, Math.max(0, Math.round(scrollLeft / offsetWidth))));
          }
        }}
      >
        {slides.map((slide) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => {
              navigate(`/apps/detail/${slide.appId}`);
            }}
            className="w-full shrink-0 snap-center px-4 text-left"
          >
            <div className="flex h-44 flex-col justify-between rounded-2xl bg-gradient-to-br from-brand to-brand-hover p-4 text-white">
              <span className="w-fit rounded-full bg-white/20 px-2 py-0.5 text-[0.625rem]">{slide.badge}</span>
              <span className="flex items-end justify-between gap-3">
                <span className="min-w-0">
                  <span className="block truncate text-lg font-semibold">{slide.title}</span>
                  <span className="mt-0.5 block truncate text-xs text-white/85">{slide.tagline}</span>
                </span>
                <span aria-hidden="true" className="text-3xl">
                  {slide.icon}
                </span>
              </span>
            </div>
          </button>
        ))}
      </div>
      <div className="mt-2 flex justify-center gap-1.5">
        {slides.map((slide, index) => (
          <span
            key={slide.id}
            aria-hidden="true"
            className={`h-1.5 rounded-full transition-all ${
              index === activeIndex ? 'w-4 bg-brand' : 'w-1.5 bg-border-subtle'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

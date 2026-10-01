import { useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { ScreenState } from '@sdkwork/whatseek-pc-commons';
import { getWhatseekClient } from '@sdkwork/whatseek-pc-core';
import type { CreatedApp } from '@sdkwork/whatseek-pc-core';

/**
 * AI app creation flow (PRD §17/§18/§43): requirement → plan → generate →
 * preview → continue modifying → publish → 我的应用.
 */
type CreationPhase = 'input' | 'plan' | 'generating' | 'preview';

export function AppCreateScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const basedOn = searchParams.get('basedOn');
  const apps = getWhatseekClient('apps');

  const [requirement, setRequirement] = useState(searchParams.get('q') ?? '');
  const [phase, setPhase] = useState<CreationPhase>('input');
  const [modules, setModules] = useState<readonly string[]>([]);
  const [generated, setGenerated] = useState<CreatedApp | null>(null);
  const [instruction, setInstruction] = useState('');
  const [published, setPublished] = useState(false);
  const [basedOnName, setBasedOnName] = useState('');

  useEffect(() => {
    if (basedOn === null || basedOn.length === 0) {
      return;
    }
    void apps.getApp(basedOn).then((app) => {
      if (app !== null) {
        setBasedOnName(app.name);
        setRequirement((current) => (current.length === 0 ? `${app.name} · ${app.summary}` : current));
      }
    });
  }, [apps, basedOn]);

  const makePlan = () => {
    const trimmed = requirement.trim();
    if (trimmed.length === 0) {
      return;
    }
    const plan = apps.draftCreationPlan(trimmed);
    setModules(plan.modules);
    setPhase('plan');
  };

  const generate = () => {
    setPhase('generating');
    void apps
      .createAppFromPlan(requirement, modules)
      .then((created) => {
        setGenerated(created);
        setPhase('preview');
      })
      .catch(() => {
        setPhase('plan');
      });
  };

  const applyInstruction = () => {
    if (generated === null || instruction.trim().length === 0) {
      return;
    }
    void apps.modifyApp(generated.id, instruction).then((updated) => {
      setGenerated(updated);
      setInstruction('');
    });
  };

  const publish = () => {
    if (generated === null) {
      return;
    }
    void apps.publishApp(generated.id).then((publishedApp) => {
      setGenerated(publishedApp);
      setPublished(true);
    });
  };

  if (phase === 'input') {
    return (
      <div className="flex min-h-full flex-col pb-6">
        <header className="flex items-center gap-2 px-4 pt-4">
          <button
            type="button"
            aria-label={t('whatseek.commons.action.back')}
            onClick={() => {
              navigate(-1);
            }}
            className="text-xl text-secondary"
          >
            ‹
          </button>
          <h1 className="text-base font-semibold text-primary">{t('whatseek.apps.create.title')}</h1>
        </header>
        <div className="px-4 pt-6">
          {basedOnName.length > 0 ? (
            <p className="pb-2 text-xs text-muted">{t('whatseek.apps.create.basedOn', { name: basedOnName })}</p>
          ) : null}
          <textarea
            value={requirement}
            onChange={(event) => {
              setRequirement(event.target.value);
            }}
            rows={4}
            placeholder={t('whatseek.apps.create.placeholder')}
            aria-label={t('whatseek.apps.create.inputLabel')}
            className="w-full rounded-2xl border border-border-default bg-panel p-4 text-sm text-primary outline-none placeholder:text-muted focus:border-brand"
          />
          <button
            type="button"
            disabled={requirement.trim().length === 0}
            onClick={makePlan}
            className="mt-4 w-full rounded-full bg-brand py-3 text-sm font-semibold text-white transition-opacity hover:bg-brand-hover disabled:opacity-40"
          >
            {t('whatseek.apps.create.planAction')}
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'generating') {
    return <ScreenState state="loading" titleKey="whatseek.apps.create.generating" />;
  }

  return (
    <div className="flex min-h-full flex-col pb-6">
      <header className="flex items-center gap-2 px-4 pt-4">
        <button
          type="button"
          aria-label={t('whatseek.commons.action.back')}
          onClick={() => {
            navigate(-1);
          }}
          className="text-xl text-secondary"
        >
          ‹
        </button>
        <h1 className="text-base font-semibold text-primary">
          {phase === 'plan' ? t('whatseek.apps.create.planTitle') : t('whatseek.apps.create.previewTitle')}
        </h1>
      </header>

      {phase === 'plan' ? (
        <div className="px-4 pt-4">
          <div className="rounded-2xl border border-border-subtle bg-panel p-4">
            <p className="text-sm font-semibold text-primary">
              {t('whatseek.apps.create.planFor', { requirement: requirement.trim() })}
            </p>
            <ul className="mt-2 space-y-1.5">
              {modules.map((moduleName) => (
                <li key={moduleName} className="flex items-center gap-2 text-sm text-secondary">
                  <span aria-hidden="true" className="text-success">✓</span>
                  {moduleName}
                </li>
              ))}
            </ul>
          </div>
          <button
            type="button"
            onClick={generate}
            className="mt-4 w-full rounded-full bg-brand py-3 text-sm font-semibold text-white hover:bg-brand-hover"
          >
            {t('whatseek.apps.create.generateAction')}
          </button>
        </div>
      ) : null}

      {phase === 'preview' && generated !== null ? (
        <div className="px-4 pt-4">
          <div className="rounded-2xl border border-border-subtle bg-panel p-4">
            <p className="flex items-center justify-between text-sm font-semibold text-primary">
              <span>🧩 {generated.name}</span>
              <span className="rounded-full bg-warning/15 px-2 py-0.5 text-[0.625rem] text-warning">
                {t(`whatseek.apps.lifecycle.${generated.lifecycle}`)} · v{generated.versions[generated.versions.length - 1]}
              </span>
            </p>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {generated.modules.map((moduleName) => (
                <li key={moduleName} className="rounded-full border border-border-subtle px-2 py-0.5 text-xs text-secondary">
                  {moduleName}
                </li>
              ))}
            </ul>
            <div className="mt-3 rounded-xl bg-panel-muted p-3" aria-hidden="true">
              <div className="h-2.5 w-1/2 rounded bg-border-subtle" />
              <div className="mt-1.5 h-2.5 w-full rounded bg-border-subtle" />
            </div>
          </div>

          {published ? (
            <div className="mt-4 rounded-2xl bg-success/10 p-4 text-center">
              <p className="text-sm font-medium text-success">{t('whatseek.apps.create.published')}</p>
              <button
                type="button"
                onClick={() => {
                  navigate('/apps/my');
                }}
                className="mt-2 text-sm font-medium text-brand underline-offset-2 hover:underline"
              >
                {t('whatseek.apps.create.goMyApps')}
              </button>
            </div>
          ) : (
            <>
              <div className="mt-3 flex gap-2">
                <input
                  value={instruction}
                  onChange={(event) => {
                    setInstruction(event.target.value);
                  }}
                  placeholder={t('whatseek.apps.create.modifyPlaceholder')}
                  aria-label={t('whatseek.apps.create.modifyPlaceholder')}
                  className="flex-1 rounded-full border border-border-default bg-panel px-4 py-2.5 text-sm text-primary outline-none placeholder:text-muted focus:border-brand"
                />
                <button
                  type="button"
                  onClick={applyInstruction}
                  disabled={instruction.trim().length === 0}
                  className="rounded-full border border-border-default px-4 py-2.5 text-sm text-secondary hover:bg-panel-muted disabled:opacity-40"
                >
                  {t('whatseek.apps.create.modifyAction')}
                </button>
              </div>
              <button
                type="button"
                onClick={publish}
                className="mt-3 w-full rounded-full bg-brand py-3 text-sm font-semibold text-white hover:bg-brand-hover"
              >
                {t('whatseek.apps.create.publishAction')}
              </button>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}

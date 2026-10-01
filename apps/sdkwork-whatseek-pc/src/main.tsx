import { StrictMode } from 'react';

import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import {
  createWhatseekI18n,
  mergeWhatseekResources,
  readStoredLocale,
} from '@sdkwork/whatseek-pc-core';
import { commonsI18nResources } from '@sdkwork/whatseek-pc-commons';
import { shellI18nResources } from '@sdkwork/whatseek-pc-shell';
import { chatI18nResources } from '@sdkwork/whatseek-pc-chat';
import { appsI18nResources } from '@sdkwork/whatseek-pc-apps';
import { contactsI18nResources } from '@sdkwork/whatseek-pc-contacts';
import { messagesI18nResources } from '@sdkwork/whatseek-pc-messages';
import { profileI18nResources } from '@sdkwork/whatseek-pc-profile';

import { App } from './App.js';
import { bootstrapEnvironment } from './bootstrap/environment.js';
import { bootstrapSdkClients } from './bootstrap/sdkClients.js';
import './index.css';

async function main(): Promise<void> {
  await bootstrapEnvironment();
  bootstrapSdkClients();
  createWhatseekI18n(
    mergeWhatseekResources(
      commonsI18nResources,
      shellI18nResources,
      chatI18nResources,
      appsI18nResources,
      contactsI18nResources,
      messagesI18nResources,
      profileI18nResources,
    ),
    readStoredLocale(),
  );

  const container = document.getElementById('root');
  if (container === null) {
    throw new Error('missing #root container');
  }
  ReactDOM.createRoot(container).render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>,
  );
}

void main();

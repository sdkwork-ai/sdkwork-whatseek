/**
 * PRD §10.1 core intent vocabulary shared by every WhatSeek chat capability
 * (H5, PC, mini-program). Pure data — no UI or platform dependency.
 */

export type WhatseekIntent =
  | 'SEARCH_APP'
  | 'USE_APP'
  | 'CREATE_APP'
  | 'SEARCH_AGENT'
  | 'USE_AGENT'
  | 'CREATE_AGENT'
  | 'SEARCH_PRODUCT'
  | 'SEARCH_SUPPLIER'
  | 'SEARCH_SERVICE'
  | 'SEARCH_PERSON'
  | 'SEND_MESSAGE'
  | 'CREATE_CONTENT'
  | 'EDIT_CONTENT'
  | 'EXECUTE_TASK'
  | 'GENERAL_CHAT';

export interface IntentResult {
  intent: WhatseekIntent;
  confidence: number;
  keywords: string[];
}

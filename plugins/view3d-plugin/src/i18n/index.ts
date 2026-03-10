import { registerMessages, type TranslationMessages } from 'vjcad';
import zhCN from './zh-CN';
import enUS from './en-US';

export function registerView3dPluginMessages(): void {
  registerMessages({
    'zh-CN': zhCN as unknown as TranslationMessages,
    'en-US': enUS as unknown as TranslationMessages,
  });
}

import { nativeTheme } from '@electron/remote';
import { action, computed, makeObservable, observable, reaction } from 'mobx';

import type { Stores } from '../@types/stores.types';
import type { Actions } from '../actions/lib/actions';
import type { ApiInterface } from '../api';
import { type Theme, ThemeType, theme } from '../themes';
import TypedStore from './lib/TypedStore';

export default class UIStore extends TypedStore {
  @observable showServicesUpdatedInfoBar = false;

  @observable isOsDarkThemeActive = nativeTheme.shouldUseDarkColors;

  // Added state for AI Chat visibility
  @observable isAiChatVisible = false;

  constructor(stores: Stores, api: ApiInterface, actions: Actions) {
    super(stores, api, actions);

    makeObservable(this);

    // Register action handlers
    this.actions.ui.openDownloads.listen(this._openDownloads.bind(this));
    this.actions.ui.openSettings.listen(this._openSettings.bind(this));
    this.actions.ui.closeSettings.listen(this._closeSettings.bind(this));
    this.actions.ui.toggleServiceUpdatedInfoBar.listen(
      this._toggleServiceUpdatedInfoBar.bind(this),
    );
    // Register listener for the new action (implementation below)
    this.actions.ui.toggleAiChat.listen(this._toggleAiChat.bind(this));

    // Listen for theme change
    nativeTheme.on('updated', () => {
      this.isOsDarkThemeActive = nativeTheme.shouldUseDarkColors;
      this.actions.service.shareSettingsWithServiceProcess();
    });
  }

  setup(): void {
    reaction(
      () => this.isDarkThemeActive,
      () => {
        this._setupThemeInDOM();
      },
      { fireImmediately: true },
    );
    reaction(
      () => this.isSplitModeActive,
      () => {
        this._setupModeInDOM();
      },
      { fireImmediately: true },
    );
    reaction(
      () => this.splitColumnsNo,
      () => {
        this._setupColumnsInDOM();
      },
      { fireImmediately: true },
    );
  }

  @computed get showMessageBadgesEvenWhenMuted() {
    const settings = this.stores.settings.all;

    return (
      (settings.app.isAppMuted && settings.app.showMessageBadgeWhenMuted) ||
      !settings.app.isAppMuted
    );
  }

  @computed get isDarkThemeActive() {
    const isWithAdaptableInDarkMode =
      this.stores.settings.all.app.adaptableDarkMode &&
      this.isOsDarkThemeActive;
    const isWithoutAdaptableInDarkMode =
      this.stores.settings.all.app.darkMode &&
      !this.stores.settings.all.app.adaptableDarkMode;
    const isInDarkMode = this.stores.settings.all.app.darkMode;
    return !!(
      isWithAdaptableInDarkMode ||
      isWithoutAdaptableInDarkMode ||
      isInDarkMode
    );
  }

  @computed get isSplitModeActive(): boolean {
    return this.stores.settings.app.splitMode;
  }

  @computed get splitColumnsNo(): number {
    return this.stores.settings.app.splitColumns;
  }

  @computed get theme(): Theme {
    const themeId =
      this.isDarkThemeActive || this.stores.settings.app.darkMode
        ? ThemeType.dark
        : ThemeType.default;
    const { accentColor } = this.stores.settings.app;
    return theme(themeId, accentColor);
  }

  // Actions
  @action _openDownloads({ path = '/downloadmanager' }): void {
    const downloadsPath =
      path === '/downloadmanager' ? path : `/downloadmanager/${path}`;
    this.stores.router.push(downloadsPath);
  }

  @action _openSettings({ path = '/settings' }): void {
    const settingsPath = path === '/settings' ? path : `/settings/${path}`;
    this.stores.router.push(settingsPath);
  }

  @action _closeSettings(): void {
    this.stores.router.push('/');
  }

  @action _toggleServiceUpdatedInfoBar({ visible }): void {
    let visibility = visible;
    if (visibility === null) {
      visibility = !this.showServicesUpdatedInfoBar;
    }
    this.showServicesUpdatedInfoBar = visibility;
  }

  // Action implementation for toggling AI Chat visibility
  @action _toggleAiChat(): void {
    this.isAiChatVisible = !this.isAiChatVisible;
    console.log('AI Chat Visible:', this.isAiChatVisible); // For debugging
  }

  // Reactions
  _setupThemeInDOM(): void {
    if (this.isDarkThemeActive) {
      document.body.classList.add('theme__dark');
    } else {
      document.body.classList.remove('theme__dark');
    }
  }

  _setupModeInDOM(): void {
    if (this.isSplitModeActive) {
      document.body.classList.add('mode__split');
      document.body.dataset.columns = this.splitColumnsNo.toString();
    } else {
      document.body.classList.remove('mode__split');
    }
  }

  _setupColumnsInDOM(): void {
    document.body.dataset.columns = this.splitColumnsNo.toString();
  }
}

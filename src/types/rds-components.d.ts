/**
 * TypeScript JSX intrinsic element declarations for RDS Web Components.
 * Source: RDS Design System — https://rds-storybook.azurewebsites.net
 * All components use the `rds-` prefix and emit native DOM custom events.
 */
import type React from 'react';

type HTMLProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      /* ── Layout & Structure ─────────────────────────────────────── */
      'rds-app-layout': HTMLProps;
      'rds-header': HTMLProps & { 'app-name'?: string };
      'rds-nav': HTMLProps;
      'rds-nav-item': HTMLProps & { href?: string; icon?: string; active?: boolean | string };
      'rds-footer': HTMLProps;
      'rds-page-heading': HTMLProps;
      'rds-section-heading': HTMLProps;
      'rds-breadcrumbs': HTMLProps;
      'rds-breadcrumb-item': HTMLProps & { href?: string };

      /* ── Cards ──────────────────────────────────────────────────── */
      'rds-card-container': HTMLProps;
      'rds-card-header': HTMLProps;
      'rds-card-body': HTMLProps;
      'rds-card-footer': HTMLProps;
      'rds-card-group': HTMLProps;
      'rds-card-media': HTMLProps;

      /* ── Typography ─────────────────────────────────────────────── */
      'rds-headline': HTMLProps & { level?: '1' | '2' | '3'; weight?: string; spacing?: string };
      'rds-text': HTMLProps & { size?: string; weight?: string; spacing?: string; align?: string; italic?: boolean | string };

      /* ── Buttons & Actions ──────────────────────────────────────── */
      'rds-button': HTMLProps & { variant?: string; size?: string; disabled?: boolean | string; type?: string; 'icon-only'?: boolean | string };
      'rds-button-group': HTMLProps;
      'rds-action-bar': HTMLProps;
      'rds-action': HTMLProps & { icon?: string; label?: string };
      'rds-fab': HTMLProps & { icon?: string; size?: string };
      'rds-link': HTMLProps & { href?: string; variant?: string; size?: string; disabled?: boolean | string; 'icon-only'?: boolean | string; 'icon-position'?: string };

      /* ── Form Controls ──────────────────────────────────────────── */
      'rds-form-wrapper': HTMLProps & { action?: string; method?: string; autocomplete?: string; name?: string; target?: string; enctype?: string; validate?: boolean | string };
      'rds-input': HTMLProps & {
        label?: string; type?: string; placeholder?: string;
        required?: boolean | string; disabled?: boolean | string; readonly?: boolean | string;
        error?: string; 'help-text'?: string; 'sub-label'?: string;
        'leading-icon'?: string; 'trailing-icon'?: string;
        'leading-addon'?: string; 'trailing-addon'?: string;
        value?: string; min?: string; max?: string;
        minlength?: string; maxlength?: string; pattern?: string; autocomplete?: string;
      };
      'rds-textarea': HTMLProps & {
        label?: string; placeholder?: string; rows?: string | number;
        required?: boolean | string; disabled?: boolean | string; readonly?: boolean | string;
        error?: string; 'help-text'?: string; resize?: string;
        maxlength?: string; minlength?: string; value?: string;
      };
      'rds-select': HTMLProps & {
        label?: string; multiple?: boolean | string; required?: boolean | string;
        disabled?: boolean | string; error?: string; placeholder?: string; 'label-position'?: string;
        value?: string;
      };
      'rds-combobox': HTMLProps & {
        label?: string; multiple?: boolean | string; required?: boolean | string;
        disabled?: boolean | string; error?: string; value?: string;
      };
      'rds-checkbox': HTMLProps & {
        label?: string; checked?: boolean | string; indeterminate?: boolean | string;
        disabled?: boolean | string; 'sub-label'?: string; 'inline-sub-label'?: string; value?: string;
      };
      'rds-checkbox-group': HTMLProps & { label?: string; orientation?: string; disabled?: boolean | string };
      'rds-radio-button': HTMLProps & {
        label?: string; name?: string; value?: string;
        checked?: boolean | string; disabled?: boolean | string;
      };
      'rds-radio-button-group': HTMLProps & {
        label?: string; name?: string; orientation?: string;
        disabled?: boolean | string; value?: string;
      };
      'rds-toggle': HTMLProps & { label?: string; switched?: boolean | string; disabled?: boolean | string };
      'rds-date-picker': HTMLProps & { label?: string };
      'rds-input-date-picker': HTMLProps & {
        label?: string; disabled?: boolean | string; required?: boolean | string;
        range?: boolean | string; min?: string; max?: string; readonly?: boolean | string; value?: string;
      };
      'rds-input-slider': HTMLProps & { label?: string; min?: string; max?: string; value?: string; dual?: boolean | string };
      'rds-label': HTMLProps & { for?: string; 'sub-label'?: string };
      'rds-file-uploader': HTMLProps & {
        label?: string; accept?: string; multiple?: boolean | string;
        'max-file-size'?: string; 'max-files'?: string; disabled?: boolean | string;
      };
      'rds-search': HTMLProps & { placeholder?: string; disabled?: boolean | string; 'with-search-button'?: boolean | string };
      'rds-comment-box': HTMLProps & { placeholder?: string; 'raw-text'?: boolean | string };

      /* ── Feedback & Notifications ────────────────────────────────── */
      'rds-alert': HTMLProps & { variant?: string; heading?: string; dismissible?: boolean | string };
      'rds-banner': HTMLProps & { variant?: string; dismissible?: boolean | string; appearance?: string };
      'rds-snackbar': HTMLProps & { variant?: string; message?: string };
      'rds-badge': HTMLProps & { variant?: string };
      'rds-indicator': HTMLProps & { variant?: string };

      /* ── Progress & Loading ─────────────────────────────────────── */
      'rds-spinner': HTMLProps & { size?: string };
      'rds-progress-bar': HTMLProps & { value?: string | number; max?: string | number };
      'rds-progress-circle': HTMLProps & { value?: string | number; max?: string | number; size?: string };
      'rds-skeleton': HTMLProps & { type?: string; width?: string | number; height?: string | number; count?: string | number };

      /* ── Navigation & Wayfinding ────────────────────────────────── */
      'rds-tabs': HTMLProps & { variant?: string };
      'rds-tab': HTMLProps & { active?: boolean | string; disabled?: boolean | string };
      'rds-pagination': HTMLProps & { total?: string | number; 'page-size'?: string | number; 'current-page'?: string | number; type?: string };
      'rds-stepper': HTMLProps;
      'rds-stepper-step': HTMLProps & { label?: string; completed?: boolean | string; active?: boolean | string };

      /* ── Overlays & Panels ──────────────────────────────────────── */
      'rds-modal': HTMLProps & { heading?: string; size?: string; 'no-escape-key-close'?: boolean | string; 'no-overlay-close'?: boolean | string };
      'rds-panel': HTMLProps & { heading?: string; orientation?: string; wide?: boolean | string };
      'rds-menu': HTMLProps & { position?: string; 'open-with-hover'?: boolean | string; disabled?: boolean | string };
      'rds-menu-item': HTMLProps & { value?: string; disabled?: boolean | string };
      'rds-tooltip': HTMLProps & { content?: string; position?: string };

      /* ── Data Display ───────────────────────────────────────────── */
      'rds-table': HTMLProps & { striped?: boolean | string; compact?: boolean | string; 'vertical-lines'?: boolean | string };
      'rds-list': HTMLProps & { type?: string };
      'rds-accordion': HTMLProps & { 'single-selection-mode'?: boolean | string };
      'rds-accordion-item': HTMLProps & { heading?: string; icon?: string };
      'rds-avatar': HTMLProps & { initials?: string; src?: string; alt?: string; size?: string; indicator?: string };
      'rds-chip': HTMLProps & { active?: boolean | string; closable?: boolean | string; disabled?: boolean | string; clickable?: boolean | string };
      'rds-divider': HTMLProps & { orientation?: string; spacing?: string };
      'rds-hero-icon': HTMLProps & { name?: string; size?: string; solid?: boolean | string };
      'rds-error-page': HTMLProps & { 'error-code'?: string };

      /* ── Drag & Drop ────────────────────────────────────────────── */
      'rds-drag-and-drop-container': HTMLProps & { direction?: string; group?: string };
    }
  }
}

export {};

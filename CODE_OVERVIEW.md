# Code Overview

This document provides a high level summary of the source code in this repository. It lists each source file and describes its purpose and the main exported elements. The goal is to give a broad picture of the current structure and how the pieces fit together.

## Root Files

- **package.json / package-lock.json** – standard Node configuration files for a Create React App project.
- **tsconfig.json** – TypeScript configuration enabling `react-scripts` compilation.
- **tailwind.config.js / postcss.config.js** – minimal configuration for Tailwind CSS.
- **server.log** – captured output from running the development server.
- **CLAUDE.md** – guidance notes for development (how to run dev server, technology stack, etc.).
- **README.md** – basic CRA README.

## `src/`

The `src` directory contains the React application written in TypeScript.

### Top level

- `index.tsx` – entry point that renders the `<App />` component using ReactDOM.
- `App.tsx` – wraps `FinancialDashboard` in `FinancialProvider` context and applies global styles.
- `App.css` and `index.css` – global CSS files.
- `logo.svg`, `reportWebVitals.ts`, `setupTests.ts` – standard CRA assets and setup files.
- `FinancialDashboard.tsx` – an older single file version of the dashboard kept for reference (not currently imported).

### `src/components`

Reusable UI pieces and main dashboard components.

#### `FinancialDashboard.tsx`
Main page component that consumes context values. Renders tabs (Dashboard, Settings, Clients, FOT, Upsell) and corresponding panels. Also includes charts (`RevenueChart`, `ClientsChart`, `KPIRadarChart`) and metric cards.

#### `components/common`
- `EditableCell.tsx` – numeric input used throughout editors. Accepts value, min/max, step and change handler.
- `InfoTooltip.tsx` – small tooltip component with optional positioning and color props.
- `MetricCard.tsx` – card displaying a single key metric value with optional trend icon and tooltip.
- `index.ts` – re-exports the above components.

#### `components/charts`
Visualization components using Recharts.
- `RevenueChart.tsx` – stacked area chart of revenue streams.
- `ClientsChart.tsx` – area chart showing client numbers per tier.
- `KPIRadarChart.tsx` – radar chart of KPIs for each month.
- `index.ts` – export helpers.

#### `components/panels`
Editor and display panels shown inside the main dashboard.
- `SettingsPanel.tsx` – allows editing tax mode, FOT mode, API cost, churn rate and other base parameters.
- `ClientsEditor.tsx` – table editing monthly new client numbers for each pricing tier.
- `FOTEditor.tsx` – table editing monthly payroll values (ФОТ).
- `KeyMetricsPanel.tsx` – collection of `MetricCard` components showing totals (revenue, profit etc.).
- `UpsellSettingsPanel.tsx` – editor for upsell related parameters (additional bots, features, integrations).
- `index.ts` – exports all panel components.

### `src/constants`
Defines default values and helper formatters.
- `DefaultValues.ts` – initial parameters for the financial model (tax rates, default client numbers, subscription prices, etc.).
- `FormatOptions.ts` – formatting options for currency and percentages.
- `Theme.ts` – color palette used across charts and components.
- `index.ts` – re-exports.

### `src/contexts`
Context providing global financial model state.
- `FinancialContext.tsx` – defines context types, holds state such as `monthlyData`, `totalData`, base params, client data and upsell settings. Exposes `calculateFinancialModel` function and `FinancialProvider` component.
- `index.ts` – export helper.

### `src/hooks`
Custom hooks used by components.
- `useFinancialModel.ts` – performs all financial calculations. Exposes `calculateFinancialModel`, `monthlyData` and `totalData` based on provided parameters and client settings.
- `useFormatting.ts` – memoized helpers for formatting currency, percentages and numbers.
- `index.ts` – re-exports hooks.

### `src/types`
TypeScript type definitions for the model.
- `FinancialTypes.ts` – defines interfaces such as `MonthlyData`, `ClientsData`, `UpsellSettings`, `FinancialModelParams` and enums like `TaxMode`, `FOTMode`.

### `src/__mocks__`
Mock implementations for Recharts used in Jest tests.
- `recharts.js` – replaces chart components with simple divs for easier testing.

### `src/tests`
Jest/React Testing Library test suites covering components and hooks.
- `App.test.tsx` – ensures the main App renders with mocked context.
- `EditableCell.test.tsx` – unit tests for the `EditableCell` component.
- `InfoTooltip.test.tsx` – unit tests for the tooltip component.
- `MetricCard.test.tsx` – tests rendering of metric cards.
- `SettingsGraphsInteraction.test.tsx` – integration test that changes settings and expects charts/metrics to update.
- `calculateFinancialModel.test.ts` – tests the `useFinancialModel` calculations using hooks.

## Backups

`backups/FinancialDashboard.tsx.bak` contains a previous large version of the dashboard kept for reference.

## Summary

The project is a React/TypeScript financial dashboard using context and custom hooks for state management. Tests are written with Jest and React Testing Library, using custom mocks for Recharts. The main calculation logic resides in `useFinancialModel.ts`, while presentation and editing components live under `src/components`.

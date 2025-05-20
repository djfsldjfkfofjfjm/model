# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Development
- `npm start` - Runs the development server at http://localhost:3000
- `npm test` - Runs tests in interactive watch mode
- `npm run build` - Builds the app for production

### TypeScript Compilation
The project has TypeScript error suppression enabled via environment variables:
- `ESLINT_NO_DEV_ERRORS=true`
- `TSC_COMPILE_ON_ERROR=true`

Warnings will still appear but won't prevent compilation. 

**ВАЖНО**: Не закрывайте запущенное приложение при внесении правок. TypeScript ошибки не мешают работе приложения из-за включенного флага `TSC_COMPILE_ON_ERROR=true`.

## Architecture Overview

### Tech Stack
- **React 19** with TypeScript
- **Create React App** (CRA) for project structure
- **Tailwind CSS v3** for styling via PostCSS
- **Recharts** for data visualization

### Project Structure

The application is a single-page financial dashboard with:

- Main component: `src/FinancialDashboard.tsx` - contains all business logic and state management
- Entry point: `src/index.tsx` - renders the App component
- Minimal component architecture (currently single-file application)

### Key Features

1. **Financial Modeling**
   - SaaS revenue forecasting
   - Client segmentation by subscription tiers ($75, $150, $250, $500, $1000)
   - Tax calculation (optimistic 9% PVT / pessimistic 35%)
   - Employee cost tracking (FOT - Fund of Labor)

2. **State Management**
   - All state managed in FinancialDashboard component using React hooks
   - No external state management library
   - Complex calculations in useCallback/useEffect hooks

3. **Data Visualization**
   - Multiple chart types: Line, Area, Bar, Pie, Radar
   - All charts use Recharts library
   - Real-time updates based on user input

4. **Interactive Features**
   - Editable cells for financial parameters
   - Mass editing tools for client numbers and FOT values
   - Multiple viewing tabs: dashboard, detailed monthly breakdown

### Planned Changes and Features
Refer to the `ПЛАН_ВНЕСЕНИЯ_ПРАВОК.md` file for a detailed roadmap of planned changes. Key features to be implemented include:

1. Parameter renaming and value range updates
2. Adding OpenAI API logic with automatic cost adjustments
3. Adding tooltips for metrics and inputs
4. Visual improvements to charts
5. Decomposition of Customer Acquisition Cost (CAC)
6. Changing from subscription model to message package model
7. Enhanced upsell tracking
8. Sales funnel visualization
9. Tax optimization options
10. Bulk editing features
11. Detailed monthly breakdown table
12. Data export functionality

### Tax Calculation

Important: Tax is calculated from total revenue (gross), not profit:
```typescript
const tax = totalRevenue > 0 ? totalRevenue * taxRate : 0;
```

### Known Issues
- Multiple TypeScript warnings for implicit 'any' types in Recharts components
- Missing useCallback dependencies 
- Unused imports (LineChart, Scatter)
- Most state setter functions are currently unused

## Development Notes

1. When modifying financial calculations, check the main calculation function around line 115-320 in FinancialDashboard.tsx

2. The application uses environment variables to suppress TypeScript errors during development

3. Tailwind CSS configuration is minimal with no custom theme extensions

4. The project follows a modular approach based on the change plan in `ПЛАН_ВНЕСЕНИЯ_ПРАВОК.md`, with each change being a self-contained task

5. After each modification, verify that all calculations remain correct by comparing the results with previous values
# EasyInvoice

EasyInvoice is a fast, minimal, single-page React web application that allows users to generate and download professional invoices as PDFs without authentication.

## Features

- **Real-Time Preview**: See the invoice update as you type.
- **Dynamic Items**: Add or remove line items easily.
- **Calculations**: Automatically computes subtotals, tax rates, and discounts.
- **PDF Export**: Export the live preview into a beautifully formatted PDF.
- **Dark Mode**: Supports both light and dark mode based on system preference and explicit toggle.
- **Auto-Save**: Form state is saved to `localStorage`, so you never lose your progress.
- **Minimal & Modern Design**: Uses Tailwind CSS and a customized shadcn-ui component layer.

## Project Structure

This project uses:
- React + Vite
- Tailwind CSS
- customized standard components (Button, Input, Card, Label)
- `date-fns` for date manipulation
- `html2canvas` and `jsPDF` for client-side PDF generation

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:5173` in your browser.

## Deploying to GitHub Pages

This app is configured to be deployed easily to GitHub Pages.

1. **Verify Base URL**: In `vite.config.ts`, ensure `base: "/EasyInvoice/"` matches your GitHub repository name. If your repository is named something else, update it accordingly. If you are deploying to a user site (e.g., `username.github.io`), change it to `base: "/"`.
2. **Commit and Push**: Push your code to your GitHub repository.
3. **GitHub Actions Deployment**:
   You can set up a GitHub Action to deploy automatically. Navigate to the **Settings** > **Pages** tab of your GitHub repository.
   Under **Build and deployment**, select **GitHub Actions** as the Source.
   Choose the **Static HTML** template or create a workflow using peace iris or standard Vite GitHub Pages templates.

Alternatively, use the `gh-pages` package:
1. `npm install -D gh-pages`
2. Add to `package.json` scripts: `"deploy": "npm run build && gh-pages -d dist"`
3. Run `npm run deploy`.

## Credits

Created by [JoeMighty](https://github.com/JoeMighty).

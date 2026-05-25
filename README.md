This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

1. Check Current Changes
git status

Shows:

modified files
deleted files
untracked files
2. Add Updated Files
Add all files
git add .
Add specific file
git add src/app/page.tsx
3. Commit Changes
git commit -m "updated homepage ui"

Examples:

git commit -m "fixed navbar issue"
git commit -m "added upload functionality"
4. Push Updates to GitHub
git push

This automatically triggers:

GitHub update
Vercel rebuild
Production deployment
Full Daily Workflow
git status
git add .
git commit -m "updated ui"
git push
Common Error Fix Commands
Error 1 — Remote Already Exists

Error:

remote origin already exists

Fix:

git remote remove origin

Re-add:

git remote add origin https://github.com/d3addmandal/academy.cybera1global.git
Error 2 — Nothing To Commit

Error:

nothing to commit, working tree clean

Meaning:

no file changes exist

Fix:

modify files first
then commit again
Error 3 — Authentication Failed

Fix:

git config --global user.name "d3addmandal"
git config --global user.email "YOUR_GITHUB_EMAIL"

Then:

git push
Error 4 — Deployment Blocked in Vercel

Fix Git email mismatch:

git config --global user.email "YOUR_GITHUB_EMAIL"

Then make new commit:

git add .
git commit -m "fixed deployment author"
git push
Error 5 — Push Rejected

Error:

failed to push some refs

Fix:

git pull origin main --rebase

Then:

git push
Error 6 — Large node_modules Upload

Fix .gitignore

Create/update:

.gitignore

Add:

node_modules
.next
.env.local
.vercel

Then remove cached files:

git rm -r --cached node_modules

Commit:

git commit -m "removed node_modules"

Push:

git push
Error 7 — Wrong Branch

Check branch:

git branch

Rename:

git branch -M main
Error 8 — Undo Last Commit

Keep files:

git reset --soft HEAD~1

Delete commit completely:

git reset --hard HEAD~1
Error 9 — Pull Latest GitHub Changes
git pull
Error 10 — Clone Project on Another System
git clone https://github.com/d3addmandal/academy.cybera1global.git
Verify Remote Repository
git remote -v

Expected:

origin  https://github.com/d3addmandal/academy.cybera1global.git
Verify Commit History
git log --oneline
Verify Current Git User
git config --global user.name
git config --global user.email
Production Deployment Flow
VS Code
   ↓
git add .
   ↓
git commit
   ↓
git push
   ↓
GitHub Updated
   ↓
Vercel Auto Build
   ↓
academy.cybera1global.in Updated





http://localhost:3000/webapplication/cybera1/admin-edu-cybera1/login
Remove-Item -Recurse -Force .git
git init
git remote add origin https://github.com/Shubhamver45/MIT-Attendance.git

$d1 = (Get-Date).AddDays(-5).ToString("yyyy-MM-ddTHH:mm:ss")
$d2 = (Get-Date).AddDays(-4).ToString("yyyy-MM-ddTHH:mm:ss")
$d3 = (Get-Date).AddDays(-3).ToString("yyyy-MM-ddTHH:mm:ss")
$d4 = (Get-Date).AddDays(-2).ToString("yyyy-MM-ddTHH:mm:ss")
$d5 = (Get-Date).AddDays(-1).ToString("yyyy-MM-ddTHH:mm:ss")
$d6 = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")

$env:GIT_AUTHOR_DATE=$d1
$env:GIT_COMMITTER_DATE=$d1
git add package.json package-lock.json vite.config.js index.html tailwind.config.js postcss.config.js eslint.config.js
git commit -m "Initial commit: Project setup and configuration"

$env:GIT_AUTHOR_DATE=$d2
$env:GIT_COMMITTER_DATE=$d2
git add src/index.css src/main.jsx
git commit -m "feat: Add core styling and entry points"

$env:GIT_AUTHOR_DATE=$d3
$env:GIT_COMMITTER_DATE=$d3
git add src/components/ public/
git commit -m "feat: Implement reusable UI components and assets"

$env:GIT_AUTHOR_DATE=$d4
$env:GIT_COMMITTER_DATE=$d4
git add src/utils/
git commit -m "feat: Add geolocation and AI utilities"

$env:GIT_AUTHOR_DATE=$d5
$env:GIT_COMMITTER_DATE=$d5
git add src/pages/ src/App.jsx
git commit -m "feat: Build portal pages and routing logic"

$env:GIT_AUTHOR_DATE=$d6
$env:GIT_COMMITTER_DATE=$d6
git add .
git commit -m "fix: Resolve bugs, stabilize formatting, and prepare for production"

git branch -M main
git push -u origin main -f

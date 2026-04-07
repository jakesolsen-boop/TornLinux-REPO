#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="/home/jakesolsen/Documents/TornLinux-Project/TornLinux-REPO-Workspace"
REPO_NAME="TornLinux-REPO"
DEFAULT_VISIBILITY="public"

echo "== TornLinux GitHub setup script =="
echo

for cmd in git gh; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Error: required command '$cmd' is not installed."
    exit 1
  fi
done

if [ ! -d "$PROJECT_DIR" ]; then
  echo "Error: project directory does not exist:"
  echo "  $PROJECT_DIR"
  exit 1
fi

cd "$PROJECT_DIR"

echo "Working in: $(pwd)"
echo

echo "Checking GitHub authentication..."
gh auth status || {
  echo
  echo "GitHub CLI is not authenticated."
  echo "Run: gh auth login"
  exit 1
}
echo

GIT_NAME="$(git config --global user.name || true)"
GIT_EMAIL="$(git config --global user.email || true)"

if [ -z "${GIT_NAME}" ] || [ -z "${GIT_EMAIL}" ]; then
  echo "Git global name/email not set."
  echo "Set them with:"
  echo '  git config --global user.name "Jake Olsen"'
  echo '  git config --global user.email "your-email@example.com"'
  exit 1
fi

echo "Git identity:"
echo "  Name : $GIT_NAME"
echo "  Email: $GIT_EMAIL"
echo

if [ ! -f ".gitignore" ]; then
  echo "Creating .gitignore..."
  cat > .gitignore <<'EOG'
# Logs
*.log

# Temp and swap files
*.tmp
*.swp
*~

# OS/editor junk
.DS_Store
Thumbs.db

# Node
node_modules/
dist/
build/

# Python
__pycache__/
*.pyc

# Environment files
.env
.env.*

# Archives
*.zip
*.tar
*.gz
*.bz2
*.xz
*.7z

# Disk/build artifacts
*.iso
*.img
*.qcow2
*.vmdk
*.vdi
EOG
else
  echo ".gitignore already exists. Leaving it untouched."
fi
echo

if [ ! -d ".git" ]; then
  echo "Initializing git repository..."
  git init
else
  echo "Git repository already initialized."
fi
echo

echo "Current git status:"
git status --short || true
echo

echo "Staging files..."
git add .
echo

if git diff --cached --quiet; then
  echo "Nothing staged for commit."
else
  echo "Creating initial commit..."
  git commit -m "Initial commit"
fi
echo

CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [ "$CURRENT_BRANCH" != "main" ]; then
  echo "Setting default branch to main..."
  git branch -M main
else
  echo "Already on branch main."
fi
echo

if git remote get-url origin >/dev/null 2>&1; then
  echo "Remote 'origin' already exists:"
  git remote get-url origin
else
  echo "Creating GitHub repository '$REPO_NAME'..."
  gh repo create "$REPO_NAME" --"$DEFAULT_VISIBILITY" --source=. --remote=origin
fi
echo

echo "Pushing main branch..."
git push -u origin main
echo

if git show-ref --verify --quiet refs/heads/dev; then
  echo "Local branch 'dev' already exists."
  git checkout dev
else
  echo "Creating dev branch..."
  git checkout -b dev
fi
echo

echo "Pushing dev branch..."
git push -u origin dev
echo

echo "== Setup complete =="
echo "Repository: $REPO_NAME"
echo "Project dir: $PROJECT_DIR"
echo
echo "Normal workflow from now on:"
echo "  cd $PROJECT_DIR"
echo "  git checkout dev"
echo "  git pull"
echo "  git add ."
echo '  git commit -m "Describe what changed"'
echo "  git push"

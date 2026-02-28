#!/bin/bash

# Configuration
REPO_NAME="mr_popo"

echo "🚀 Initializing GitHub Repository pushing to aspauldingcode/mr_popo"

# Git Init
git init
git add .
git commit -m "Initial commit: Mr. Popo Bot System with Dashboard and Tests"
git branch -M main

# Add Remote and Push
git remote add origin git@github.com:aspauldingcode/mr_popo.git
git push -u origin main

echo "✅ Repository initialized and pushed to GitHub!"


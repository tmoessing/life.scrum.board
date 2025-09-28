#!/bin/bash

# Initialize Git repository
git init

# Add all files
git add .

# Make initial commit
git commit -m "Initial commit: Life Scrum Board app"

# Add remote origin (replace with your GitHub repository URL)
echo "Please run the following commands:"
echo "1. Create a new repository on GitHub"
echo "2. Copy the repository URL"
echo "3. Run: git remote add origin YOUR_REPOSITORY_URL"
echo "4. Run: git branch -M main"
echo "5. Run: git push -u origin main"
echo ""
echo "Example:"
echo "git remote add origin https://github.com/yourusername/life-scrum-board.git"
echo "git branch -M main"
echo "git push -u origin main"

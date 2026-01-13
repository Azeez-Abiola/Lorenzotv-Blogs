# Lorenzo TV Blog - GitHub Push Setup

# Step 1: Initialize Git (if not already done)
git init

# Step 2: Add all files
git add .

# Step 3: Commit changes
git commit -m "Initial commit: Lorenzo TV Blog with admin panel, comments, and analytics"

# Step 4: Add remote repository
git remote add origin https://github.com/Azeez-Abiola/Lorenzotv-Blogs.git

# Step 5: Set main branch
git branch -M main

# Step 6: Push to GitHub
git push -u origin main

# If push fails due to existing content on GitHub, use force push (USE WITH CAUTION):
# git push -u origin main --force

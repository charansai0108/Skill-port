#!/bin/bash

# Script to replace Tailwind CDN with local CSS in all HTML files

echo "🔄 Updating Tailwind CSS references..."

# Find all HTML files and replace CDN with local CSS
find . -name "*.html" -type f -exec sed -i '' 's|<script src="https://cdn.tailwindcss.com"></script>|<link href="../../css/tailwind.min.css" rel="stylesheet">|g' {} \;

# For files in root directory, use different path
find . -maxdepth 1 -name "*.html" -type f -exec sed -i '' 's|<link href="../../css/tailwind.min.css" rel="stylesheet">|<link href="./css/tailwind.min.css" rel="stylesheet">|g' {} \;

# For files in pages directory, use different path
find ./pages -name "*.html" -type f -exec sed -i '' 's|<link href="../../css/tailwind.min.css" rel="stylesheet">|<link href="../../css/tailwind.min.css" rel="stylesheet">|g' {} \;

echo "✅ Tailwind CSS references updated!"
echo "📁 Local CSS file: ./css/tailwind.min.css"
echo "🎨 All HTML files now use local Tailwind CSS"

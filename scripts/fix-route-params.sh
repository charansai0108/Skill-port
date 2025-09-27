#!/bin/bash

# Fix Next.js 15 route parameter usage in all route files
echo "Fixing Next.js 15 route parameter usage..."

# Find all route files and fix parameter usage
find apps/web/app/api -name "route.ts" -exec grep -l "const { id } = params" {} \; | while read -r file; do
    echo "Fixing $file"
    
    # Replace direct params access with awaited params
    sed -i.bak 's/const { id } = params/const { id } = await params/g' "$file"
    
    # Clean up backup files
    rm -f "$file.bak"
done

echo "Route parameter usage fixed!"

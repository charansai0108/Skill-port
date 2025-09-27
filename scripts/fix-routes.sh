#!/bin/bash

# Fix Next.js 15 route parameter types
echo "Fixing Next.js 15 route parameter types..."

# Find all route files with the old parameter format
find apps/web/app/api -name "route.ts" -exec grep -l "params: { id: string }" {} \; | while read -r file; do
    echo "Fixing $file"
    
    # Replace the old parameter format with the new one
    sed -i.bak 's/{ params }: { params: { id: string } }/{ params }: { params: Promise<{ id: string }> }/g' "$file"
    
    # Update the parameter usage
    sed -i.bak 's/const contestId = params\.id/const { id: contestId } = await params/g' "$file"
    sed -i.bak 's/const userId = params\.id/const { id: userId } = await params/g' "$file"
    sed -i.bak 's/const mentorId = params\.id/const { id: mentorId } = await params/g' "$file"
    sed -i.bak 's/const batchId = params\.id/const { id: batchId } = await params/g' "$file"
    sed -i.bak 's/const projectId = params\.id/const { id: projectId } = await params/g' "$file"
    sed -i.bak 's/const communityId = params\.id/const { id: communityId } = await params/g' "$file"
    sed -i.bak 's/const taskId = params\.id/const { id: taskId } = await params/g' "$file"
    sed -i.bak 's/const feedbackId = params\.id/const { id: feedbackId } = await params/g' "$file"
    
    # Clean up backup files
    rm -f "$file.bak"
done

echo "Route parameter types fixed!"

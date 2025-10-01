#!/bin/bash

# Script to update all community pages with dynamic routing

echo "🔄 Updating community pages for multi-tenant support..."

# Function to update a page
update_page() {
    local page_path=$1
    local page_name=$2
    
    echo "📝 Updating $page_name..."
    
    # Add useParams import
    sed -i '' 's/import Link from '\''next\/link'\''/import Link from '\''next\/link'\''\nimport { useParams } from '\''next\/navigation'\''/' "$page_path"
    
    # Add communitySlug extraction
    sed -i '' 's/export default function.*Page() {/export default function Community'$page_name'Page() {\n  const params = useParams()\n  const communitySlug = params.communitySlug as string/' "$page_path"
    
    # Update all admin links to community links
    sed -i '' 's|href="/admin/dashboard"|href={`/community/${communitySlug}/dashboard`}|g' "$page_path"
    sed -i '' 's|href="/admin/users"|href={`/community/${communitySlug}/students`}|g' "$page_path"
    sed -i '' 's|href="/admin/mentors"|href={`/community/${communitySlug}/mentors`}|g' "$page_path"
    sed -i '' 's|href="/admin/contests"|href={`/community/${communitySlug}/contests`}|g' "$page_path"
    sed -i '' 's|href="/admin/analytics"|href={`/community/${communitySlug}/analytics`}|g' "$page_path"
    sed -i '' 's|href="/admin/leaderboard"|href={`/community/${communitySlug}/leaderboard`}|g' "$page_path"
    sed -i '' 's|href="/admin/profile"|href={`/community/${communitySlug}/profile`}|g' "$page_path"
    
    echo "✅ $page_name updated"
}

# Update each page
update_page "apps/web/app/community/[communitySlug]/mentors/page.tsx" "Mentors"
update_page "apps/web/app/community/[communitySlug]/contests/page.tsx" "Contests"
update_page "apps/web/app/community/[communitySlug]/analytics/page.tsx" "Analytics"
update_page "apps/web/app/community/[communitySlug]/leaderboard/page.tsx" "Leaderboard"
update_page "apps/web/app/community/[communitySlug]/profile/page.tsx" "Profile"

echo "🎉 All community pages updated successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Test registration to create a community with slug"
echo "2. Test login to redirect to /community/{slug}/dashboard"
echo "3. Test navigation between community pages"
echo "4. Verify data isolation between communities"

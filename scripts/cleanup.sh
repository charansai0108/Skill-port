#!/bin/bash

# SkillPort Community Project Cleanup Script
# This script provides easy access to the cleanup tools

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}🧹 SkillPort Community Project Cleanup${NC}"
echo -e "${BLUE}====================================${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "$PROJECT_ROOT/package.json" ]; then
    echo -e "${RED}❌ Error: Not in SkillPort project root directory${NC}"
    echo "Please run this script from the project root directory."
    exit 1
fi

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  report     Generate cleanup report only (safe)"
    echo "  clean      Execute cleanup (requires confirmation)"
    echo "  smart      Run smart cleanup with advanced analysis"
    echo "  help       Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 report    # Generate report to see what will be deleted"
    echo "  $0 clean     # Execute cleanup after reviewing report"
    echo "  $0 smart     # Run advanced cleanup with smart analysis"
    echo ""
    echo "The cleanup will:"
    echo "  - Remove .md, .log, .tmp files (except essential docs)"
    echo "  - Remove empty directories"
    echo "  - Identify unused JS/CSS/images"
    echo "  - Preserve all essential files and referenced assets"
}

# Function to run basic cleanup
run_basic_cleanup() {
    echo -e "${YELLOW}📋 Running basic cleanup analysis...${NC}"
    cd "$PROJECT_ROOT"
    node scripts/cleanup-project.js
}

# Function to run smart cleanup
run_smart_cleanup() {
    echo -e "${YELLOW}🧠 Running smart cleanup analysis...${NC}"
    cd "$PROJECT_ROOT"
    node scripts/smart-cleanup.js
}

# Function to execute cleanup
execute_cleanup() {
    echo -e "${YELLOW}⚠️  This will permanently delete files!${NC}"
    echo -e "${YELLOW}Make sure you have reviewed the report first.${NC}"
    echo ""
    read -p "Are you sure you want to proceed? (yes/no): " confirm
    
    if [ "$confirm" = "yes" ] || [ "$confirm" = "y" ]; then
        echo -e "${GREEN}✅ Proceeding with cleanup...${NC}"
        cd "$PROJECT_ROOT"
        node scripts/cleanup-project.js --confirm
    else
        echo -e "${RED}❌ Cleanup cancelled${NC}"
        exit 0
    fi
}

# Function to execute smart cleanup
execute_smart_cleanup() {
    echo -e "${YELLOW}⚠️  This will permanently delete files!${NC}"
    echo -e "${YELLOW}Make sure you have reviewed the report first.${NC}"
    echo ""
    read -p "Are you sure you want to proceed? (yes/no): " confirm
    
    if [ "$confirm" = "yes" ] || [ "$confirm" = "y" ]; then
        echo -e "${GREEN}✅ Proceeding with smart cleanup...${NC}"
        cd "$PROJECT_ROOT"
        node scripts/smart-cleanup.js --confirm
    else
        echo -e "${RED}❌ Cleanup cancelled${NC}"
        exit 0
    fi
}

# Main script logic
case "${1:-help}" in
    "report")
        run_basic_cleanup
        ;;
    "clean")
        execute_cleanup
        ;;
    "smart")
        run_smart_cleanup
        ;;
    "smart-clean")
        execute_smart_cleanup
        ;;
    "help"|"--help"|"-h")
        show_usage
        ;;
    *)
        echo -e "${RED}❌ Unknown option: $1${NC}"
        echo ""
        show_usage
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}✨ Cleanup operation completed!${NC}"

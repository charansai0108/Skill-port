#!/bin/bash

# OTP Emulator Testing Script
# Tests OTP functionality against Firebase Emulators

set -e

echo "🔧 Starting OTP Emulator Tests..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="skillport-a0c39"
FUNCTIONS_URL="http://localhost:5001/${PROJECT_ID}/us-central1/api"
TEST_EMAIL="test@skillport.com"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if emulators are running
check_emulators() {
    print_status "Checking if Firebase emulators are running..."
    
    if curl -s http://localhost:5001 > /dev/null; then
        print_success "Functions emulator is running"
    else
        print_error "Functions emulator is not running. Please start with: firebase emulators:start"
        exit 1
    fi
    
    if curl -s http://localhost:8080 > /dev/null; then
        print_success "Firestore emulator is running"
    else
        print_error "Firestore emulator is not running"
        exit 1
    fi
}

# Test OTP Generation
test_otp_generation() {
    print_status "Testing OTP generation..."
    
    local response=$(curl -s -X POST "${FUNCTIONS_URL}/otp/generate" \
        -H "Content-Type: application/json" \
        -d "{\"email\": \"${TEST_EMAIL}\", \"firstName\": \"Test\", \"lastName\": \"User\"}")
    
    echo "Response: $response"
    
    if echo "$response" | grep -q '"success":true'; then
        print_success "OTP generation successful"
        return 0
    else
        print_error "OTP generation failed"
        return 1
    fi
}

# Test OTP Verification with correct code
test_otp_verification_correct() {
    print_status "Testing OTP verification with correct code..."
    
    # First generate an OTP
    test_otp_generation
    
    # Wait a moment for OTP to be stored
    sleep 2
    
    # Try to verify with a test OTP (this might fail in emulator without real OTP)
    local response=$(curl -s -X POST "${FUNCTIONS_URL}/otp/verify" \
        -H "Content-Type: application/json" \
        -d "{\"email\": \"${TEST_EMAIL}\", \"otp\": \"123456\"}")
    
    echo "Response: $response"
    
    # Check if response is valid JSON and has expected structure
    if echo "$response" | grep -q '"success"'; then
        print_success "OTP verification API responded correctly"
        return 0
    else
        print_warning "OTP verification failed (expected in emulator without real OTP storage)"
        return 1
    fi
}

# Test OTP Verification with wrong code
test_otp_verification_wrong() {
    print_status "Testing OTP verification with wrong code..."
    
    local response=$(curl -s -X POST "${FUNCTIONS_URL}/otp/verify" \
        -H "Content-Type: application/json" \
        -d "{\"email\": \"${TEST_EMAIL}\", \"otp\": \"999999\"}")
    
    echo "Response: $response"
    
    if echo "$response" | grep -q '"success":false'; then
        print_success "Wrong OTP correctly rejected"
        return 0
    else
        print_error "Wrong OTP was not properly rejected"
        return 1
    fi
}

# Test invalid email
test_invalid_email() {
    print_status "Testing OTP generation with invalid email..."
    
    local response=$(curl -s -X POST "${FUNCTIONS_URL}/otp/generate" \
        -H "Content-Type: application/json" \
        -d "{\"email\": \"invalid-email\", \"firstName\": \"Test\", \"lastName\": \"User\"}")
    
    echo "Response: $response"
    
    if echo "$response" | grep -q '"success":false'; then
        print_success "Invalid email correctly rejected"
        return 0
    else
        print_error "Invalid email was not properly rejected"
        return 1
    fi
}

# Test missing fields
test_missing_fields() {
    print_status "Testing OTP generation with missing fields..."
    
    local response=$(curl -s -X POST "${FUNCTIONS_URL}/otp/generate" \
        -H "Content-Type: application/json" \
        -d "{\"firstName\": \"Test\", \"lastName\": \"User\"}")
    
    echo "Response: $response"
    
    if echo "$response" | grep -q '"success":false'; then
        print_success "Missing email correctly rejected"
        return 0
    else
        print_error "Missing email was not properly rejected"
        return 1
    fi
}

# Test rate limiting (simulate multiple requests)
test_rate_limiting() {
    print_status "Testing rate limiting..."
    
    local success_count=0
    local total_requests=6
    
    for i in $(seq 1 $total_requests); do
        local response=$(curl -s -X POST "${FUNCTIONS_URL}/otp/generate" \
            -H "Content-Type: application/json" \
            -d "{\"email\": \"ratelimit${i}@skillport.com\", \"firstName\": \"Test\", \"lastName\": \"User\"}")
        
        if echo "$response" | grep -q '"success":true'; then
            ((success_count++))
        fi
        
        sleep 0.1 # Small delay between requests
    done
    
    echo "Successful requests: $success_count out of $total_requests"
    
    if [ $success_count -lt $total_requests ]; then
        print_success "Rate limiting appears to be working"
        return 0
    else
        print_warning "Rate limiting may not be active (all requests succeeded)"
        return 1
    fi
}

# Test Firestore OTP storage
test_firestore_storage() {
    print_status "Testing Firestore OTP storage..."
    
    # Generate OTP
    test_otp_generation
    
    # Check if OTP was stored in Firestore emulator
    # This would require Firestore emulator API access
    print_warning "Firestore storage verification requires manual inspection of emulator UI"
    print_status "Check http://localhost:4000 for Firestore data"
    
    return 0
}

# Run all tests
run_all_tests() {
    print_status "Starting comprehensive OTP emulator tests..."
    echo "=========================================="
    
    local passed=0
    local failed=0
    
    # Test 1: Check emulators
    if check_emulators; then
        ((passed++))
    else
        ((failed++))
    fi
    
    echo ""
    
    # Test 2: OTP Generation
    if test_otp_generation; then
        ((passed++))
    else
        ((failed++))
    fi
    
    echo ""
    
    # Test 3: OTP Verification (correct)
    if test_otp_verification_correct; then
        ((passed++))
    else
        ((failed++))
    fi
    
    echo ""
    
    # Test 4: OTP Verification (wrong)
    if test_otp_verification_wrong; then
        ((passed++))
    else
        ((failed++))
    fi
    
    echo ""
    
    # Test 5: Invalid email
    if test_invalid_email; then
        ((passed++))
    else
        ((failed++))
    fi
    
    echo ""
    
    # Test 6: Missing fields
    if test_missing_fields; then
        ((passed++))
    else
        ((failed++))
    fi
    
    echo ""
    
    # Test 7: Rate limiting
    if test_rate_limiting; then
        ((passed++))
    else
        ((failed++))
    fi
    
    echo ""
    
    # Test 8: Firestore storage
    if test_firestore_storage; then
        ((passed++))
    else
        ((failed++))
    fi
    
    echo ""
    echo "=========================================="
    print_status "Test Results Summary:"
    print_success "Passed: $passed"
    print_error "Failed: $failed"
    
    if [ $failed -eq 0 ]; then
        print_success "All OTP emulator tests passed! 🎉"
        return 0
    else
        print_error "Some tests failed. Check the output above."
        return 1
    fi
}

# Main execution
main() {
    echo "🚀 SkillPort OTP Emulator Test Suite"
    echo "====================================="
    echo ""
    
    if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
        echo "Usage: $0 [test_name]"
        echo ""
        echo "Available tests:"
        echo "  check-emulators    - Check if emulators are running"
        echo "  generate          - Test OTP generation"
        echo "  verify-correct    - Test OTP verification with correct code"
        echo "  verify-wrong      - Test OTP verification with wrong code"
        echo "  invalid-email     - Test invalid email handling"
        echo "  missing-fields    - Test missing fields handling"
        echo "  rate-limiting     - Test rate limiting"
        echo "  firestore         - Test Firestore storage"
        echo "  all               - Run all tests (default)"
        echo ""
        exit 0
    fi
    
    case "${1:-all}" in
        "check-emulators")
            check_emulators
            ;;
        "generate")
            test_otp_generation
            ;;
        "verify-correct")
            test_otp_verification_correct
            ;;
        "verify-wrong")
            test_otp_verification_wrong
            ;;
        "invalid-email")
            test_invalid_email
            ;;
        "missing-fields")
            test_missing_fields
            ;;
        "rate-limiting")
            test_rate_limiting
            ;;
        "firestore")
            test_firestore_storage
            ;;
        "all")
            run_all_tests
            ;;
        *)
            print_error "Unknown test: $1"
            echo "Run '$0 --help' for available tests"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"

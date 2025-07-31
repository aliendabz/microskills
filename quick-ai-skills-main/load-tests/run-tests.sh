#!/bin/bash

# Load Testing Runner Script
# This script provides an easy way to run different load test scenarios

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
BASE_URL=${BASE_URL:-"http://localhost:4000"}
GRAPHQL_URL=${GRAPHQL_URL:-"http://localhost:4000/graphql"}
ENABLE_GRAPHQL=${ENABLE_GRAPHQL:-"true"}
OUTPUT_DIR=${OUTPUT_DIR:-"results"}

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if k6 is installed
check_k6() {
    if ! command -v k6 &> /dev/null; then
        print_error "k6 is not installed. Please install k6 first."
        echo "Visit: https://k6.io/docs/getting-started/installation/"
        exit 1
    fi
    print_success "k6 is installed: $(k6 version)"
}

# Function to check if backend is running
check_backend() {
    print_status "Checking if backend is running at $BASE_URL..."
    
    if curl -s "$BASE_URL/health" > /dev/null 2>&1; then
        print_success "Backend is running"
    else
        print_warning "Backend health check failed. Make sure your backend is running at $BASE_URL"
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# Function to create output directory
create_output_dir() {
    if [ ! -d "$OUTPUT_DIR" ]; then
        mkdir -p "$OUTPUT_DIR"
        print_status "Created output directory: $OUTPUT_DIR"
    fi
}

# Function to run a test scenario
run_test() {
    local scenario=$1
    local description=$2
    local duration=$3
    
    print_status "Running $description..."
    print_status "Duration: $duration"
    
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local output_file="$OUTPUT_DIR/${scenario}_${timestamp}.json"
    
    k6 run \
        --config k6.config.js \
        --env BASE_URL="$BASE_URL" \
        --env GRAPHQL_URL="$GRAPHQL_URL" \
        --env ENABLE_GRAPHQL="$ENABLE_GRAPHQL" \
        --scenario "$scenario" \
        --out json="$output_file" \
        load-tests/main.js
    
    print_success "$description completed. Results saved to: $output_file"
}

# Function to run GraphQL tests
run_graphql_test() {
    local scenario=$1
    local description=$2
    
    print_status "Running GraphQL $description..."
    
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local output_file="$OUTPUT_DIR/graphql_${scenario}_${timestamp}.json"
    
    k6 run \
        --config k6.config.js \
        --env BASE_URL="$BASE_URL" \
        --env GRAPHQL_URL="$GRAPHQL_URL" \
        --env ENABLE_GRAPHQL="$ENABLE_GRAPHQL" \
        --scenario "$scenario" \
        --out json="$output_file" \
        load-tests/graphql.js
    
    print_success "GraphQL $description completed. Results saved to: $output_file"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS] COMMAND"
    echo ""
    echo "Commands:"
    echo "  smoke       Run smoke test (1 minute, 1 user)"
    echo "  load        Run load test (9 minutes, up to 10 users)"
    echo "  stress      Run stress test (9 minutes, up to 20 users)"
    echo "  spike       Run spike test (5 minutes, up to 50 users)"
    echo "  soak        Run soak test (30 minutes, 5 users)"
    echo "  all         Run all tests sequentially"
    echo "  graphql     Run GraphQL tests"
    echo "  quick       Run quick test suite (smoke + load)"
    echo ""
    echo "Options:"
    echo "  -h, --help          Show this help message"
    echo "  -u, --url URL       Set base URL (default: http://localhost:4000)"
    echo "  -g, --graphql URL   Set GraphQL URL (default: http://localhost:4000/graphql)"
    echo "  -o, --output DIR    Set output directory (default: results)"
    echo "  --no-graphql        Disable GraphQL tests"
    echo ""
    echo "Environment Variables:"
    echo "  BASE_URL            API base URL"
    echo "  GRAPHQL_URL         GraphQL endpoint"
    echo "  ENABLE_GRAPHQL      Enable GraphQL tests (true/false)"
    echo "  OUTPUT_DIR          Output directory for results"
    echo ""
    echo "Examples:"
    echo "  $0 smoke                    # Run smoke test"
    echo "  $0 load                     # Run load test"
    echo "  $0 all                      # Run all tests"
    echo "  $0 -u https://api.example.com smoke  # Run smoke test against custom URL"
    echo "  $0 --output ./my-results load        # Save results to custom directory"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_usage
            exit 0
            ;;
        -u|--url)
            BASE_URL="$2"
            shift 2
            ;;
        -g|--graphql)
            GRAPHQL_URL="$2"
            shift 2
            ;;
        -o|--output)
            OUTPUT_DIR="$2"
            shift 2
            ;;
        --no-graphql)
            ENABLE_GRAPHQL="false"
            shift
            ;;
        smoke|load|stress|spike|soak|all|graphql|quick)
            COMMAND="$1"
            shift
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Check if command is provided
if [ -z "$COMMAND" ]; then
    print_error "No command specified"
    show_usage
    exit 1
fi

# Main execution
main() {
    print_status "Starting load test runner..."
    print_status "Base URL: $BASE_URL"
    print_status "GraphQL URL: $GRAPHQL_URL"
    print_status "Enable GraphQL: $ENABLE_GRAPHQL"
    print_status "Output directory: $OUTPUT_DIR"
    
    # Check prerequisites
    check_k6
    check_backend
    create_output_dir
    
    # Run the specified command
    case $COMMAND in
        smoke)
            run_test "smoke" "Smoke Test" "1 minute"
            ;;
        load)
            run_test "load" "Load Test" "9 minutes"
            ;;
        stress)
            run_test "stress" "Stress Test" "9 minutes"
            ;;
        spike)
            run_test "spike" "Spike Test" "5 minutes"
            ;;
        soak)
            run_test "soak" "Soak Test" "30 minutes"
            ;;
        all)
            print_status "Running all tests sequentially..."
            run_test "smoke" "Smoke Test" "1 minute"
            run_test "load" "Load Test" "9 minutes"
            run_test "stress" "Stress Test" "9 minutes"
            run_test "spike" "Spike Test" "5 minutes"
            run_test "soak" "Soak Test" "30 minutes"
            print_success "All tests completed!"
            ;;
        graphql)
            if [ "$ENABLE_GRAPHQL" = "true" ]; then
                print_status "Running GraphQL tests..."
                run_graphql_test "graphqlSmoke" "Smoke Test"
                run_graphql_test "graphqlLoad" "Load Test"
                run_graphql_test "graphqlStress" "Stress Test"
                run_graphql_test "graphqlSpike" "Spike Test"
                run_graphql_test "graphqlSoak" "Soak Test"
                print_success "All GraphQL tests completed!"
            else
                print_error "GraphQL tests are disabled"
                exit 1
            fi
            ;;
        quick)
            print_status "Running quick test suite..."
            run_test "smoke" "Smoke Test" "1 minute"
            run_test "load" "Load Test" "9 minutes"
            print_success "Quick test suite completed!"
            ;;
        *)
            print_error "Unknown command: $COMMAND"
            show_usage
            exit 1
            ;;
    esac
    
    print_success "Load testing completed successfully!"
}

# Run main function
main "$@" 
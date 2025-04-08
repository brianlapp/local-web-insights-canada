
#!/bin/bash
set -e

# Docker entrypoint script for production container
echo "Starting scraper service in $NODE_ENV mode"

# Check for test mode
if [ "$RUN_TESTS" = "true" ]; then
  echo "🧪 Running production build tests..."
  export SERVICE_URL=${SERVICE_URL:-http://localhost:3000}
  
  # Start the service in the background
  node dist/index.js &
  SERVICE_PID=$!
  
  # Wait for service to start
  echo "Waiting for service to start..."
  sleep 5
  
  # Run the tests
  echo "Running tests against $SERVICE_URL"
  node dist/scripts/test-production-build.js
  TEST_EXIT_CODE=$?
  
  # Kill the service
  kill $SERVICE_PID
  
  # Exit with the test result code
  exit $TEST_EXIT_CODE
else
  # Start the service normally
  exec "$@"
fi

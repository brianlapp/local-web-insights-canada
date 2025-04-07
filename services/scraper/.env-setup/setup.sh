#!/bin/bash

# Local Web Insights Environment Setup Script
# This script helps set up the environment files for all services

# Define colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print header
echo -e "${BLUE}=============================================${NC}"
echo -e "${BLUE}  Local Web Insights - Environment Setup    ${NC}"
echo -e "${BLUE}=============================================${NC}"
echo ""

# Check if necessary tools are installed
command -v openssl >/dev/null 2>&1 || { echo -e "${RED}Error: openssl is required but not installed. Aborting.${NC}" >&2; exit 1; }

# Function to create .env files
create_env_files() {
  echo -e "${YELLOW}Creating environment files...${NC}"
  
  # Create .env file for scraper service
  if [ -f "../.env" ]; then
    echo -e "${YELLOW}Scraper .env file already exists. Skipping...${NC}"
  else
    echo -e "${GREEN}Creating scraper .env file...${NC}"
    cp scraper.env ../.env
    echo -e "${GREEN}✓ Done${NC}"
  fi
  
  # Create .env file for API service
  if [ -f "../../api/.env" ]; then
    echo -e "${YELLOW}API .env file already exists. Skipping...${NC}"
  else
    echo -e "${GREEN}Creating API .env file...${NC}"
    # Create the directory if it doesn't exist
    mkdir -p ../../api
    cp api.env ../../api/.env
    echo -e "${GREEN}✓ Done${NC}"
  fi
  
  # Create .env file for analysis service
  if [ -f "../../analysis/.env" ]; then
    echo -e "${YELLOW}Analysis .env file already exists. Skipping...${NC}"
  else
    echo -e "${GREEN}Creating analysis .env file...${NC}"
    # Create the directory if it doesn't exist
    mkdir -p ../../analysis
    cp analysis.env ../../analysis/.env
    echo -e "${GREEN}✓ Done${NC}"
  fi
}

# Function to generate random API keys
generate_api_keys() {
  echo -e "${YELLOW}Generating API keys...${NC}"
  
  # Generate a random API secret
  API_SECRET=$(openssl rand -base64 32)
  echo -e "${GREEN}Generated API secret${NC}"
  
  # Generate internal service API keys
  SCRAPER_API_KEY=$(openssl rand -base64 24)
  ANALYSIS_API_KEY=$(openssl rand -base64 24)
  echo -e "${GREEN}Generated internal service API keys${NC}"
  
  # Replace placeholders in .env files
  if [ -f "../.env" ]; then
    echo -e "${GREEN}Updating scraper .env with API keys...${NC}"
    sed -i '' "s/your_internal_scraper_api_key_here/$SCRAPER_API_KEY/g" ../.env 2>/dev/null || sed -i "s/your_internal_scraper_api_key_here/$SCRAPER_API_KEY/g" ../.env
    echo -e "${GREEN}✓ Done${NC}"
  fi
  
  if [ -f "../../api/.env" ]; then
    echo -e "${GREEN}Updating API .env with API keys...${NC}"
    sed -i '' "s/your_strong_random_secret_here/$API_SECRET/g" ../../api/.env 2>/dev/null || sed -i "s/your_strong_random_secret_here/$API_SECRET/g" ../../api/.env
    sed -i '' "s/your_internal_scraper_api_key_here/$SCRAPER_API_KEY/g" ../../api/.env 2>/dev/null || sed -i "s/your_internal_scraper_api_key_here/$SCRAPER_API_KEY/g" ../../api/.env
    sed -i '' "s/your_internal_analysis_api_key_here/$ANALYSIS_API_KEY/g" ../../api/.env 2>/dev/null || sed -i "s/your_internal_analysis_api_key_here/$ANALYSIS_API_KEY/g" ../../api/.env
    echo -e "${GREEN}✓ Done${NC}"
  fi
  
  if [ -f "../../analysis/.env" ]; then
    echo -e "${GREEN}Updating analysis .env with API keys...${NC}"
    sed -i '' "s/your_internal_scraper_api_key_here/$SCRAPER_API_KEY/g" ../../analysis/.env 2>/dev/null || sed -i "s/your_internal_scraper_api_key_here/$SCRAPER_API_KEY/g" ../../analysis/.env
    sed -i '' "s/your_internal_api_service_key_here/$ANALYSIS_API_KEY/g" ../../analysis/.env 2>/dev/null || sed -i "s/your_internal_api_service_key_here/$ANALYSIS_API_KEY/g" ../../analysis/.env
    echo -e "${GREEN}✓ Done${NC}"
  fi
}

# Function to prompt for Supabase credentials
configure_supabase() {
  echo -e "${YELLOW}Configuring Supabase credentials...${NC}"
  
  # Prompt for Supabase URL
  echo -e "${BLUE}Enter your Supabase URL (e.g., https://abcdefg.supabase.co):${NC}"
  read -r SUPABASE_URL
  
  # Prompt for Supabase service key
  echo -e "${BLUE}Enter your Supabase service key:${NC}"
  read -r SUPABASE_SERVICE_KEY
  
  # Prompt for Supabase anon key (for API service)
  echo -e "${BLUE}Enter your Supabase anon key:${NC}"
  read -r SUPABASE_ANON_KEY
  
  # Update .env files with Supabase credentials
  if [ -f "../.env" ]; then
    echo -e "${GREEN}Updating scraper .env with Supabase credentials...${NC}"
    sed -i '' "s|https://your-project-id.supabase.co|$SUPABASE_URL|g" ../.env 2>/dev/null || sed -i "s|https://your-project-id.supabase.co|$SUPABASE_URL|g" ../.env
    sed -i '' "s/your_supabase_service_key_here/$SUPABASE_SERVICE_KEY/g" ../.env 2>/dev/null || sed -i "s/your_supabase_service_key_here/$SUPABASE_SERVICE_KEY/g" ../.env
    echo -e "${GREEN}✓ Done${NC}"
  fi
  
  if [ -f "../../api/.env" ]; then
    echo -e "${GREEN}Updating API .env with Supabase credentials...${NC}"
    sed -i '' "s|https://your-project-id.supabase.co|$SUPABASE_URL|g" ../../api/.env 2>/dev/null || sed -i "s|https://your-project-id.supabase.co|$SUPABASE_URL|g" ../../api/.env
    sed -i '' "s/your_supabase_service_key_here/$SUPABASE_SERVICE_KEY/g" ../../api/.env 2>/dev/null || sed -i "s/your_supabase_service_key_here/$SUPABASE_SERVICE_KEY/g" ../../api/.env
    sed -i '' "s/your_supabase_anon_key_here/$SUPABASE_ANON_KEY/g" ../../api/.env 2>/dev/null || sed -i "s/your_supabase_anon_key_here/$SUPABASE_ANON_KEY/g" ../../api/.env
    echo -e "${GREEN}✓ Done${NC}"
  fi
  
  if [ -f "../../analysis/.env" ]; then
    echo -e "${GREEN}Updating analysis .env with Supabase credentials...${NC}"
    sed -i '' "s|https://your-project-id.supabase.co|$SUPABASE_URL|g" ../../analysis/.env 2>/dev/null || sed -i "s|https://your-project-id.supabase.co|$SUPABASE_URL|g" ../../analysis/.env
    sed -i '' "s/your_supabase_service_key_here/$SUPABASE_SERVICE_KEY/g" ../../analysis/.env 2>/dev/null || sed -i "s/your_supabase_service_key_here/$SUPABASE_SERVICE_KEY/g" ../../analysis/.env
    echo -e "${GREEN}✓ Done${NC}"
  fi
}

# Function to configure Google Places API
configure_google_api() {
  echo -e "${YELLOW}Configuring Google Places API...${NC}"
  
  # Prompt for API key type
  echo -e "${BLUE}Do you want to use a single API key or multiple API keys? (single/multiple):${NC}"
  read -r API_KEY_TYPE
  
  if [ "$API_KEY_TYPE" = "single" ]; then
    # Single API key
    echo -e "${BLUE}Enter your Google Places API key:${NC}"
    read -r GOOGLE_MAPS_API_KEY
    
    if [ -f "../.env" ]; then
      echo -e "${GREEN}Updating scraper .env with Google API key...${NC}"
      sed -i '' "s/your_google_maps_api_key_here/$GOOGLE_MAPS_API_KEY/g" ../.env 2>/dev/null || sed -i "s/your_google_maps_api_key_here/$GOOGLE_MAPS_API_KEY/g" ../.env
      echo -e "${GREEN}✓ Done${NC}"
    fi
  else
    # Multiple API keys
    echo -e "${BLUE}How many API keys do you want to add?${NC}"
    read -r NUM_KEYS
    
    API_KEYS=""
    for ((i=1; i<=NUM_KEYS; i++)); do
      echo -e "${BLUE}Enter API key $i:${NC}"
      read -r KEY
      echo -e "${BLUE}Enter daily quota for API key $i:${NC}"
      read -r QUOTA
      
      if [ "$i" -eq 1 ]; then
        API_KEYS="$KEY:$QUOTA"
      else
        API_KEYS="$API_KEYS,$KEY:$QUOTA"
      fi
    done
    
    if [ -f "../.env" ]; then
      echo -e "${GREEN}Updating scraper .env with Google API keys...${NC}"
      sed -i '' "s/key1:1000,key2:1000/$API_KEYS/g" ../.env 2>/dev/null || sed -i "s/key1:1000,key2:1000/$API_KEYS/g" ../.env
      echo -e "${GREEN}✓ Done${NC}"
    fi
  fi
}

# Function to check Redis
check_redis() {
  echo -e "${YELLOW}Checking Redis connection...${NC}"
  
  # Check if redis-cli is installed
  if command -v redis-cli >/dev/null 2>&1; then
    # Check if Redis is running
    if redis-cli ping | grep -q "PONG"; then
      echo -e "${GREEN}✓ Redis is running${NC}"
    else
      echo -e "${RED}Error: Redis is not running. Please start Redis before proceeding.${NC}"
      echo -e "${YELLOW}You can start Redis with:${NC}"
      echo -e "${BLUE}    brew services start redis${NC} (MacOS)"
      echo -e "${BLUE}    sudo systemctl start redis${NC} (Linux)"
    fi
  else
    echo -e "${YELLOW}Warning: redis-cli not found. Cannot verify Redis status.${NC}"
    echo -e "${YELLOW}Please ensure Redis is installed and running.${NC}"
  fi
}

# Main setup process
main() {
  create_env_files
  generate_api_keys
  
  echo ""
  echo -e "${YELLOW}Do you want to configure Supabase credentials now? (y/n)${NC}"
  read -r CONFIGURE_SUPABASE
  
  if [ "$CONFIGURE_SUPABASE" = "y" ] || [ "$CONFIGURE_SUPABASE" = "Y" ]; then
    configure_supabase
  else
    echo -e "${YELLOW}Skipping Supabase configuration. You'll need to manually update the credentials in the .env files.${NC}"
  fi
  
  echo ""
  echo -e "${YELLOW}Do you want to configure Google Places API keys now? (y/n)${NC}"
  read -r CONFIGURE_GOOGLE
  
  if [ "$CONFIGURE_GOOGLE" = "y" ] || [ "$CONFIGURE_GOOGLE" = "Y" ]; then
    configure_google_api
  else
    echo -e "${YELLOW}Skipping Google Places API configuration. You'll need to manually update the API keys in the scraper .env file.${NC}"
  fi
  
  echo ""
  echo -e "${YELLOW}Do you want to check Redis connection? (y/n)${NC}"
  read -r CHECK_REDIS
  
  if [ "$CHECK_REDIS" = "y" ] || [ "$CHECK_REDIS" = "Y" ]; then
    check_redis
  else
    echo -e "${YELLOW}Skipping Redis check. Make sure Redis is running before starting the services.${NC}"
  fi
  
  echo ""
  echo -e "${GREEN}Environment setup completed!${NC}"
  echo -e "${YELLOW}Next steps:${NC}"
  echo -e "${BLUE}1. Review the .env files and fill in any missing information${NC}"
  echo -e "${BLUE}2. Start the services:${NC}"
  echo -e "${BLUE}   - cd ../scraper && npm run dev${NC}"
  echo -e "${BLUE}   - cd ../../api && npm run dev${NC}"
  echo -e "${BLUE}   - cd ../../analysis && npm run dev${NC}"
  echo ""
  echo -e "${BLUE}=============================================${NC}"
}

# Run the main function
main 
#!/bin/bash

# Install production dependencies
npm install bull@4.12.2 \
  @googlemaps/google-maps-services-js@3.3.42 \
  @supabase/supabase-js@2.39.7 \
  puppeteer@22.4.1 \
  lighthouse@11.6.0 \
  express@4.18.3 \
  dotenv@16.4.5 \
  winston@3.12.0

# Install development dependencies
npm install --save-dev \
  typescript@5.3.3 \
  @types/bull@4.10.0 \
  @types/express@4.17.21 \
  @types/node@20.11.24 \
  ts-node@10.9.2 \
  ts-node-dev@2.0.0 
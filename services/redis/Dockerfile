FROM redis:7-alpine

# Copy custom Redis configuration if needed
COPY redis.conf /usr/local/etc/redis/redis.conf

# Expose Redis port
EXPOSE 6379

# Start Redis with the custom config
CMD ["redis-server", "/usr/local/etc/redis/redis.conf"] 
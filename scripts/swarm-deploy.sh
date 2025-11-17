#!/bin/bash
# Ortho+ Docker Swarm Deploy Script

set -e

STACK_NAME="orthoplus"
VERSION="${VERSION:-latest}"

echo "🚀 Deploying Ortho+ Stack to Docker Swarm..."
echo "Stack: $STACK_NAME"
echo "Version: $VERSION"

# Build images
echo "🔨 Building Docker images..."
docker build -t orthoplus-frontend:$VERSION .
docker build -t orthoplus-backend:$VERSION ./backend

# Deploy stack
echo "📦 Deploying stack..."
VERSION=$VERSION docker stack deploy -c docker-stack.yml $STACK_NAME

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 10

# Show service status
echo ""
echo "📊 Service Status:"
docker service ls --filter label=com.docker.stack.namespace=$STACK_NAME

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Useful commands:"
echo "- View services: docker service ls"
echo "- View logs: docker service logs ${STACK_NAME}_backend -f"
echo "- Scale backend: docker service scale ${STACK_NAME}_backend=5"
echo "- Update backend: docker service update --image orthoplus-backend:new-version ${STACK_NAME}_backend"
echo "- Remove stack: docker stack rm $STACK_NAME"

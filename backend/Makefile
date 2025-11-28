.PHONY: help build run test clean docker-up docker-down migrate

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

build: ## Build the application
	go build -o bin/server cmd/server/main.go

run: ## Run the application
	go run cmd/server/main.go

test: ## Run tests
	go test -v ./...

clean: ## Clean build artifacts
	rm -rf bin/

deps: ## Download dependencies
	go mod download
	go mod tidy

docker-up: ## Start PostgreSQL and Redis
	docker-compose up -d

docker-down: ## Stop PostgreSQL and Redis
	docker-compose down

docker-logs: ## Show docker logs
	docker-compose logs -f

dev: docker-up ## Start development environment
	@echo "Waiting for database to be ready..."
	@sleep 3
	@make run

.DEFAULT_GOAL := help

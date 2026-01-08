setup:
	@make build
	@make up

build:
	@docker compose -f docker/production/docker-compose.yml build
up:
	@docker compose -f docker/production/docker-compose.yml up -d
down:
	@docker compose -f docker/production/docker-compose.yml down
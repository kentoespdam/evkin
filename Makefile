setup:
	@make build
	@make up

build:
	@docker compose -f docker/franken/docker-compose.yaml build
up:
	@docker compose -f docker/franken/docker-compose.yaml up -d
down:
	@docker compose -f docker/franken/docker-compose.yaml down
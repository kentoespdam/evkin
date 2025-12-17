setup:
	@make build
	@make up 
	@make composer-update
	
build:
	docker compose -f docker/staging/docker-compose.yaml build
stop:
	docker compose -f docker/staging/docker-compose.yaml stop
up:
	docker compose -f docker/staging/docker-compose.yaml up -d
composer-update:
	docker exec evkin-app bash -c "composer update"
data:
	docker exec evkin-app bash -c "php artisan migrate"
	docker exec evkin-app bash -c "php artisan db:seed"
down:
	docker compose -f docker/staging/docker-compose.yaml down
logs:
	docker compose -f docker/staging/docker-compose.yaml logs -f
shell:
	docker exec -it evkin-app sh

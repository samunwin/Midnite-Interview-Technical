

build:
	docker build -t midniteactivitymonitor:latest --no-cache -f ./docker/Dockerfile .

build-dev:
	docker compose -f docker-compose-dev.yml up -d

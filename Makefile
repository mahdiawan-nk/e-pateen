# =====================
# CONFIG
# =====================
DC=docker compose
APP=app
NODE=node
MYSQL=mysql
WEB=webserver
PHPMYADMIN=phpmyadmin

# =====================
# DOCKER BASIC
# =====================
# Start all containers
up:
	$(DC) up -d
# start
start:
	$(DC) start
# Build & start containers
build:
	$(DC) up -d --build

# Stop all containers
down:
	$(DC) down

# Restart all containers
restart:
	$(DC) restart

# Stop all containers
stop:
	$(DC) stop

# Restart Laravel container
restart-app:
	$(DC) restart $(APP)

# Restart Node container
restart-node:
	$(DC) restart $(NODE)

# Restart Nginx container
restart-web:
	$(DC) restart $(WEB)

# Follow logs
logs:
	$(DC) logs -f

# List containers
ps:
	$(DC) ps

# =====================
# APP (Laravel) COMMANDS
# =====================
# Open bash in Laravel container
bash:
	$(DC) exec $(APP) bash

# Run artisan command
artisan:
	$(DC) exec $(APP) php artisan

# Run migrations
migrate:
	$(DC) exec $(APP) php artisan migrate

# Fresh migrations
migrate-fresh:
	$(DC) exec $(APP) php artisan migrate:fresh

# Seed database
seed:
	$(DC) exec $(APP) php artisan db:seed

# Optimize Laravel
optimize:
	$(DC) exec $(APP) php artisan optimize

# Fresh migrate + seed
fresh:
	$(DC) exec $(APP) php artisan migrate:fresh --seed

# =====================
# FRONTEND (Node) COMMANDS
# =====================
# Open bash in Node container
node-bash:
	$(DC) exec $(NODE) bash || $(DC) exec $(NODE) sh

# NPM install
npm-install:
	$(DC) exec $(NODE) npm install

# Run npm dev server
npm-dev:
	$(DC) exec $(NODE) npm run dev

# Build npm production
npm-build:
	$(DC) exec $(NODE) npm run build

# =====================
# DATABASE COMMANDS
# =====================
# Open bash in MySQL container
mysql-bash:
	$(DC) exec $(MYSQL) bash || $(DC) exec $(MYSQL) sh

# MySQL CLI client
mysql-client:
	$(DC) exec $(MYSQL) mysql -u root -p

# phpMyAdmin link
phpmyadmin:
	@echo "Open phpMyAdmin at http://localhost:8080"

# =====================
# WEB / NGINX COMMANDS
# =====================
# Open bash in Nginx container
web-bash:
	$(DC) exec $(WEB) bash || $(DC) exec $(WEB) sh

# =====================
# UTILITIES
# =====================
# Show available commands with description
# =====================
# UTILITIES
# =====================
# Show available commands with description
help:
	@echo ""
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:' Makefile | while read line; do \
		cmd=$${line%%:*}; \
		desc=$$(grep -B1 "^$$cmd:" Makefile | head -n1 | sed 's/^# //'); \
		printf "%-20s : %s\n" "$$cmd" "$$desc"; \
	done


DOCKER=docker
DOCKERCOMPOSE=docker-compose
BUFFALO=buffalo

db-up: 
	@echo "Make sure you've run 'make db-setup' before this"
	$(DOCKER) run --name=testbuffalo_db -d -p 5432:5432 -e POSTGRES_DB=testbuffalo_development postgres

db-setup: 
	$(DOCKERCOMPOSE) build
	$(DOCKER) run --name=testbuffalo_db -d -p 5432:5432 -e POSTGRES_DB=testbuffalo_development postgres
	sleep 6
	$(BUFFALO) db create -a
	$(BUFFALO) db migrate up
	$(DOCKER) ps | grep testbuffalo_db

db-down: 
	$(DOCKER) stop testbuffalo_db
	$(DOCKER) rm testbuffalo_db 

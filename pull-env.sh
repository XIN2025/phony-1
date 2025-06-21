ENV=$1

# if env=dev else
if [ "$ENV" = "dev" ]; then
    echo "Pulling dev environment"
    cd server
    npx dotenv-vault pull staging
    cp .env.staging .env
    cd ../web
    npx dotenv-vault pull staging
    cp .env.staging .env
    cd ../
    git restore server/.dockerignore server/.env.vault web/.env.vault web/.dockerignore
else
    echo "Pulling prod environment"
    cd server
    npx dotenv-vault pull production
    cp .env.production .env
    cd ../web
    npx dotenv-vault pull production
    cp .env.production .env
    cd ../
    git restore server/.dockerignore server/.env.vault web/.env.vault web/.dockerignore
fi


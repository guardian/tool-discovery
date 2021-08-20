#!/usr/bin/env bash

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR=${DIR}/..

LAMDBA_DIR="$ROOT_DIR/src"
LAMBDA_BUCKET_NAME=tool-discovery-data

function setupToolDiscoveryLambda {
  cd $LAMDBA_DIR
  docker-compose up -d
  # Ensure localstack is up, and relevant resources have been created
  for attempt in {1..5}
  do
    AWS_ACCESS_KEY_ID=local AWS_SECRET_ACCESS_KEY=local aws s3 ls $LAMBDA_BUCKET_NAME --endpoint-url http://localhost:4566 \
      && break
    sleep 5
  done
  npm i
  npm run test
  npm run build
  npm run deploy
}

function teardownToolDiscoveryLambda {
  cd $LAMDBA_DIR
  docker-compose down
}

function setup {
  setupToolDiscoveryLambda
}

function teardown {
  teardownToolDiscoveryLambda
}

trap teardown EXIT

setup
teardown

#!/bin/sh
set -e

if [ "$NODE_ENV" = "production" ]; then
    exec npm run prod
else
    exec npm run dev
fi
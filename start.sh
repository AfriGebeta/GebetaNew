#!/bin/bash

cd ./gebeta-remade/current || exit 1
pnpm install --config.dangerouslyAllowAllBuilds=true
pnpm start

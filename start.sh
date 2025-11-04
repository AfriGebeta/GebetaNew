#!/bin/bash

cd ./gebeta-remade/current || exit 1
pnpm install --frozen-lockfile
pnpm start

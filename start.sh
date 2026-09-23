#!/bin/bash

cd ./gebeta-remade/current || exit 1
pnpm install
pnpm approve-builds
pnpm start

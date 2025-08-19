#!/bin/bash

cd ./gebeta-remade/current || exit 1
npm install -g pnpm
pnpm install
pnpm start

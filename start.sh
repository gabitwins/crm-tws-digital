#!/bin/bash
cd apps/backend
npx prisma migrate deploy
node dist/index.js

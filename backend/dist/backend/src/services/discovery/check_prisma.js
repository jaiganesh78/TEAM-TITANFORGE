"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../../database/prisma");
console.log('Keys on Prisma Client:');
console.log(Object.keys(prisma_1.prisma).filter(k => !k.startsWith('_') && !k.startsWith('$')));
process.exit(0);

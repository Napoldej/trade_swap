import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { prisma } from '../lib/prisma';


@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {

    private static instance: DatabaseService
    public readonly client = prisma;

    constructor() {
        if (DatabaseService.instance) {
            return DatabaseService.instance;
        }
        this.client = prisma;
        DatabaseService.instance = this;
    }

    async onModuleInit() {
        await this.client.$connect();
        console.log('Database connected');
    }

    async onModuleDestroy() {
        await this.client.$disconnect();
        console.log('Database disconnected');
    }

}
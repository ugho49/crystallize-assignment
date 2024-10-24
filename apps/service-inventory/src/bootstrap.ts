import { bootstrapApp } from '@crystallize/core';
import { AppModule } from './app.module';

export const bootstrap = () => bootstrapApp(AppModule, 'inventory-api');

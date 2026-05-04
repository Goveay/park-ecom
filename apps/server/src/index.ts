import { bootstrap, runMigrations } from '@vendure/core';
import { config } from './vendure-config';

runMigrations(config)
    .then(() => bootstrap(config))
    .then(async app => {
        // One-time password reset for the imported superadmin to ensure access
        const { AdministratorService, RequestContextService } = await import('@vendure/core');
        const adminService = app.get(AdministratorService);
        const ctxService = app.get(RequestContextService);
        const ctx = await ctxService.create({ apiType: 'admin' });
        const administrators = await adminService.findAll(ctx);
        const superadmin = administrators.items.find((a: any) => a.user.identifier === 'superadmin');
        if (superadmin) {
            await adminService.update(ctx, { id: superadmin.id, password: 'ParkPicassoAdmin2024!' });
            console.log('--- PASSWORD RESET SUCCESSFUL ---');
        }
    })
    .catch(err => {
        console.log(err);
    });

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const environment_1 = require("./config/environment");
const common_1 = require("@nestjs/common");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    await app.listen(process.env.PORT ?? 3000);
    const PORT = environment_1.environment.PORT;
    const HOST = environment_1.environment.HOST;
    console.log(`Server listening on http://${HOST}:${PORT}/`);
}
bootstrap();
//# sourceMappingURL=main.js.map
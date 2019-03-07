import {NestFactory} from "@nestjs/core";
import {ApplicationModule} from "./app.module";
import {NestApplicationOptions} from "@nestjs/common/interfaces/nest-application-options.interface";
import {CorsOptions} from "@nestjs/common/interfaces/external/cors-options.interface";

async function bootstrap() {
    const corsOptions: CorsOptions = {
        // TODO: Auf Server ausprobieren
        origin: 'http://localhost:4200'
    };
    const appOptions: NestApplicationOptions = {
        cors: corsOptions
    };

    const app = await NestFactory.create(ApplicationModule, appOptions);
    app.setGlobalPrefix('api');

    await app.listen(3000);
}

bootstrap();
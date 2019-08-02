import {NestFactory} from "@nestjs/core";
import {ApplicationModule} from "./app.module";
import {NestApplicationOptions} from "@nestjs/common/interfaces/nest-application-options.interface";
import {CorsOptions} from "@nestjs/common/interfaces/external/cors-options.interface";

async function bootstrap() {
    const corsOptions: CorsOptions = {
        origin: 'https://list.lenoxy.net'
    };
    const appOptions: NestApplicationOptions = {
        cors: corsOptions
    };

    const app = await NestFactory.create(ApplicationModule, appOptions);
    app.setGlobalPrefix('api');

    //Heroku Port binding

    const PORT = process.env.PORT || 3000;

    await app.listen(PORT);
}

bootstrap();

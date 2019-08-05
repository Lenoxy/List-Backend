import {NestFactory} from "@nestjs/core";
import {ApplicationModule} from "./app.module";
import {NestApplicationOptions} from "@nestjs/common/interfaces/nest-application-options.interface";
import {CorsOptions} from "@nestjs/common/interfaces/external/cors-options.interface";

async function bootstrap() {
    //Origin has to be changed manually for PROD build to: https://list.lenoxy.net or: http://localhost:4200
    const corsOptions: CorsOptions = {
        origin: 'http://localhost:4200'
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

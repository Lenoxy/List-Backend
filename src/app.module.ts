import {ListModule} from "./list/list.module";
import {Module} from "@nestjs/common";
import {AppController} from "./app.controller";

@Module({
    imports: [ListModule],
    controllers: [AppController],
    providers: []
})
export class ApplicationModule {
}
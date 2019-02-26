import {Module} from '@nestjs/common';
import {ListService} from "./list.service";

@Module({
    providers: [ListService],
})
export class ListModule {
}
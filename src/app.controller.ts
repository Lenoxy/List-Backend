import {Body, Controller, Post} from "@nestjs/common";
import {ListService} from "./list/list.service";
import {userLogin} from "./entity/user-login";

@Controller('')
export class AppController {
    private listService: ListService;

    constructor() {
        this.listService = new ListService();
        this.listService.connectDatabase();
    }

    @Post('/login')
    async login(@Body() body: userLogin) {
        return await JSON.stringify(this.listService.login(body.email, body.password));
    }
}
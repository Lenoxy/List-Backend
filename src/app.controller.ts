import {Controller, Post} from "@nestjs/common";
import {ListService} from "./list/list.service";

@Controller('')
export class AppController {
    private listService: ListService;

    constructor() {
        this.listService = new ListService();
        this.listService.connectDatabase();
    }

    @Post('/login')
    async login(email: String, password: String) {
        email = "lenoxy@gmx.ch";
        const loginStatus = await this.listService.login(email, password);

        return loginStatus;
    }
}
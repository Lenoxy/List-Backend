import {Body, Controller, Post} from "@nestjs/common";
import {ListService} from "./list/list.service";
import {userLogin} from "./interface/user-login";
import {userRegister} from "./interface/user-register";

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

    @Post('/register')
    async register(@Body() body: userRegister) {
        return this.listService.register(body.email, body.username, body.password, body.repeatPassword);
    }
}
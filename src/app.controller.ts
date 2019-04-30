import {Body, Controller, Post} from "@nestjs/common";
import {ListService} from "./list/list.service";
import {UserLogin, UserRegister, UserToken} from "./interface/interfaces";
import {Answer} from "./interface/answer";

@Controller('')
export class AppController {
    private listService: ListService;

    constructor() {
        this.listService = new ListService();
        this.listService.connectDatabase();
    }

    @Post('/login')
    async login(@Body() body: UserLogin): Promise<Answer> {
        return await this.listService.login(body.email, body.password);
    }

    @Post('/register')
    async register(@Body() body: UserRegister): Promise<Answer> {
        return this.listService.register(body.email, body.username, body.password, body.repeatPassword);
    }

    @Post('/lists/get')
    async getLists(@Body() body: UserToken): Promise<string[]> {
        return this.listService.getLists(body.token);
    }
}

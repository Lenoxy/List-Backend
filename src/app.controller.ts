import {Body, Controller, Post} from "@nestjs/common";
import {ListService} from "./list/list.service";
import {
    UserAddList,
    UserDeleteList,
    UserLogin,
    UserRegister,
    UserRenameList,
    UserShowItems,
    UserShowLists
} from "./interface/interfaces";
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
    async getLists(@Body() body: UserShowLists): Promise<string[]> {
        return this.listService.getLists(body.token);
    }

    @Post('/lists/add')
    async addList(@Body() body: UserAddList): Promise<string> {
        return this.listService.addList(body.name, body.token);
    }

    @Post('/lists/del')
    async delList(@Body() body: UserDeleteList): Promise<boolean> {
        return this.listService.deleteList(body.name, body.token);
    }

    @Post('/lists/rename')
    async renameList(@Body() body: UserRenameList): Promise<string> {
        return this.listService.renameList(body.oldName, body.newName, body.token);
    }

    @Post('/items/get')
    async getItems(@Body() body: UserShowItems): Promise<string[]> {
        return this.listService.getItems(body.token, body.listName);

    }

}

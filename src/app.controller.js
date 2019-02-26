"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
exports.__esModule = true;
var common_1 = require("@nestjs/common");
var AppController = /** @class */ (function () {
    function AppController(listService) {
        this.listService = listService;
    }
    AppController.prototype.login = function (user, password) {
        return 'Post request recieved. ' + user + ' ' + password;
    };
    AppController.prototype.getList = function (id) {
        // TODO
        return id;
    };
    AppController.prototype.get = function (id) {
        // TODO
        return id;
    };
    __decorate([
        common_1.Post('/login')
    ], AppController.prototype, "login");
    __decorate([
        common_1.Get('/list/:id'),
        __param(0, common_1.Param('id'))
    ], AppController.prototype, "getList");
    __decorate([
        common_1.Get('/list/:id'),
        __param(0, common_1.Param('id'))
    ], AppController.prototype, "get");
    AppController = __decorate([
        common_1.Controller('/')
    ], AppController);
    return AppController;
}());
exports.AppController = AppController;

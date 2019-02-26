"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts_token_generator_1 = require("ts-token-generator");
class ListService {
    tokenGenerator() {
        const tokgen = new ts_token_generator_1.TokenGenerator();
        return tokgen.generate();
    }
    login(user, password) {
        return this.tokenGenerator();
    }
}
exports.ListService = ListService;
//# sourceMappingURL=list.service.js.map
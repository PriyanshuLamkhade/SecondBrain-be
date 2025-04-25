"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requiredBody = void 0;
const zod_1 = __importDefault(require("zod"));
exports.requiredBody = zod_1.default.object({
    username: zod_1.default.string().min(2, "User Name is too short").max(30, "User Name is too Big"),
    password: zod_1.default.string().min(4).max(50).refine(value => {
        const hasUpperCase = /[A-Z]/.test(value);
        const hasLowerCase = /[a-z]/.test(value);
        const hasNumber = /[0-9]/.test(value);
        const hasSpecialCharacter = /[!@#$%^&*()_+<>?:"{}|]/.test(value);
        return hasUpperCase && hasLowerCase && hasNumber && hasSpecialCharacter;
    }, {
        message: "String must contain at least one lowercase letter, one uppercase letter, one number and one special character."
    })
});

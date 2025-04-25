"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentsModel = exports.LinksModel = exports.TagsModel = exports.UsersModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const ObjectID = mongoose_1.default.Types.ObjectId;
// Define content types (youtube, tweet, reddit, other)
const contentTypes = ['youtube', 'tweet', 'reddit', 'other'];
// User Schema
const userSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
// Create User Model
exports.UsersModel = mongoose_1.default.model('Users', userSchema);
// Tags Schema
const tagsSchema = new Schema({
    title: { type: String, required: true, unique: true }
});
// Create Tags Model
exports.TagsModel = mongoose_1.default.model('Tags', tagsSchema);
// Links Schema
const linksSchema = new Schema({
    hash: { type: String, required: true, unique: true },
    userId: { type: ObjectID, ref: "Users", required: true }
});
// Create Links Model
exports.LinksModel = mongoose_1.default.model('Links', linksSchema);
// Contents Schema
const contentsSchema = new Schema({
    links: { type: String, required: true },
    types: { type: String, enum: contentTypes, required: true }, // Ensures only valid content types
    title: { type: String, required: true },
    tags: [{ type: ObjectID, ref: "Tags" }],
    userId: {
        type: ObjectID,
        ref: "Users",
        required: true,
        validate: function (value) {
            return __awaiter(this, void 0, void 0, function* () {
                const user = yield exports.UsersModel.findById(value);
                if (!user) {
                    throw new Error("User Does not Exist");
                }
            });
        }
    }
});
// Pre-save hook to validate if the user exists before saving content
contentsSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield exports.UsersModel.findById(this.userId);
        if (!user) {
            throw new Error('User does not exist');
        }
        next();
    });
});
// Create Contents Model
exports.ContentsModel = mongoose_1.default.model('Contents', contentsSchema);

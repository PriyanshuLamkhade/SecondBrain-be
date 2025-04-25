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
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("./zod");
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = require("./db");
const mongoose_1 = __importDefault(require("mongoose"));
const middleware_1 = require("./middleware");
const config_1 = require("./config");
const utils_1 = require("./utils");
mongoose_1.default.connect("mongodb+srv://admin:WOhCqU5HVHdQi5OP@cluster0.bxpgb.mongodb.net/Second-Brain");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.post("/api/v1/signup", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const username = req.body.username;
        const password = req.body.password;
        const parsedData = zod_1.requiredBody.safeParse(req.body);
        if (!parsedData.success) {
            res.json({
                message: "Incorrect Format",
                error: parsedData.error
            });
            return;
        }
        try {
            const userExists = yield db_1.UsersModel.findOne({ username: username });
            if (userExists) {
                res.status(400).json({ message: "User already exists" });
            }
            const hashedPassword = yield bcrypt_1.default.hash(password, 5);
            yield db_1.UsersModel.create({
                username: username,
                password: hashedPassword
            });
            res.status(201).json({
                message: "User Created"
            });
        }
        catch (e) {
            res.status(500).json({ message: "Error creating user", error: e.message });
        }
    });
});
app.post("/api/v1/signin", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const username = req.body.username;
        const password = req.body.password;
        const user = yield db_1.UsersModel.findOne({
            username: username
        });
        if (!user) {
            res.status(404).json({
                message: "User doesnot exists"
            });
            return;
        }
        const comparedPassword = yield bcrypt_1.default.compare(password, user.password);
        if (comparedPassword) {
            const token = jsonwebtoken_1.default.sign({ id: user._id }, config_1.JWT_SECRETE);
            res.json({
                token
            });
        }
        else {
            res.status(400).json({ message: "Incorrect Credentials" });
        }
    });
});
app.post("/api/v1/content", middleware_1.authMiddleWare, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { links, types, title } = req.body;
        const userId = req.userId;
        try {
            yield db_1.ContentsModel.create({
                links: links,
                types: types,
                title: title,
                tags: [],
                userId: userId
            });
            res.status(201).json({ message: "Content Is Added" });
        }
        catch (e) {
            res.status(500).json({ message: "Error adding content", error: e.message });
        }
    });
});
app.get("/api/v1/content", middleware_1.authMiddleWare, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const userId = req.userId;
        try {
            const content = yield db_1.ContentsModel.find({
                userId: userId
            }).populate("userId", "username");
            res.json({ content });
        }
        catch (e) {
            res.status(500).json({ message: "Error fetching content", error: e.message });
        }
    });
});
app.delete("/api/v1/content", middleware_1.authMiddleWare, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const userId = req.userId;
        const contentId = req.query.contentId;
        try {
            const contentToDelete = yield db_1.ContentsModel.findOneAndDelete({
                _id: contentId,
                userId: userId
            });
            if (!contentToDelete) {
                res.status(404).json({ message: "Incorrect Content Id" });
            }
            res.json({ message: "Content Deleted" });
        }
        catch (e) {
            res.status(500).json({ message: "Error deleting content", error: e.message });
        }
    });
});
app.get("/api/v1/allyoutube", middleware_1.authMiddleWare, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const userId = req.userId;
        try {
            const content = yield db_1.ContentsModel.find({
                userId: userId,
                types: 'youtube'
            }).populate("userId", "username");
            res.json({ content });
        }
        catch (e) {
            res.status(500).json({ message: "Error fetching content", error: e.message });
        }
    });
});
app.get("/api/v1/allx", middleware_1.authMiddleWare, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const userId = req.userId;
        try {
            const content = yield db_1.ContentsModel.find({
                userId: userId,
                types: 'tweet'
            }).populate("userId", "username");
            res.json({ content });
        }
        catch (e) {
            res.status(500).json({ message: "Error fetching content", error: e.message });
        }
    });
});
app.get("/api/v1/allreddit", middleware_1.authMiddleWare, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const userId = req.userId;
        try {
            const content = yield db_1.ContentsModel.find({
                userId: userId,
                types: 'reddit'
            }).populate("userId", "username");
            res.json({ content });
        }
        catch (e) {
            res.status(500).json({ message: "Error fetching content", error: e.message });
        }
    });
});
app.get("/api/v1/allother", middleware_1.authMiddleWare, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const userId = req.userId;
        try {
            const content = yield db_1.ContentsModel.find({
                userId: userId,
                types: 'other'
            }).populate("userId", "username");
            res.json({ content });
        }
        catch (e) {
            res.status(500).json({ message: "Error fetching content", error: e.message });
        }
    });
});
app.post("/api/v1/brain/share", middleware_1.authMiddleWare, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const share = req.body.share;
        if (share) {
            const existingLink = yield db_1.LinksModel.findOne({
                userId: req.userId
            });
            if (existingLink) {
                res.json({
                    hash: existingLink.hash
                });
            }
            const hash = (0, utils_1.random)(10);
            yield db_1.LinksModel.create({
                userId: req.userId,
                hash: hash
            });
            res.json({
                message: "Updated Shareable Link",
                link: hash
            });
        }
        else {
            yield db_1.LinksModel.deleteOne({ userId: req.userId });
            res.json({
                message: "Removed  Link"
            });
        }
    });
});
app.get("/api/v1/brain/:shareLink", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const hash = req.params.shareLink;
        try {
            const link = yield db_1.LinksModel.findOne({
                hash: hash
            });
            if (!link) {
                res.status(411).json({
                    message: "Sorry incorrect input"
                });
                return;
            }
            const content = yield db_1.ContentsModel.find({
                userId: link.userId
            });
            const user = yield db_1.UsersModel.findOne({
                _id: link.userId
            });
            res.json({
                username: user === null || user === void 0 ? void 0 : user.username,
                content: content
            });
        }
        catch (e) {
            res.json(e);
        }
    });
});
app.listen(3000, () => {
    console.log("Listening on port 3000");
});

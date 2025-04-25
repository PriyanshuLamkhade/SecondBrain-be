"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleWare = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("./config");
const mongodb_1 = require("mongodb");
const authMiddleWare = (req, res, next) => {
    try {
        const header = req.headers["authorization"];
        if (!header) {
            res.json({ message: "Header is missing" });
        }
        if (header !== undefined) {
            const token = header;
            const decoded = jsonwebtoken_1.default.verify(token, config_1.JWT_SECRETE); // id is typically a string in JWT
            // Attach the userId to the request object
            req.userId = new mongodb_1.ObjectId(decoded.id);
            next();
        }
    }
    catch (e) {
        res.status(401).json({ message: 'Invalid or expired token', e });
    }
};
exports.authMiddleWare = authMiddleWare;

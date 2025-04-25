import express from 'express'
import jwt from "jsonwebtoken"
import { requiredBody } from './zod';
import bcrypt from "bcrypt"
import { ContentsModel, LinksModel, UsersModel } from './db';
import mongoose from 'mongoose';
import { authMiddleWare } from './middleware';
import { JWT_SECRETE } from './config';
import { random } from './utils';
mongoose.connect("mongodb+srv://admin:WOhCqU5HVHdQi5OP@cluster0.bxpgb.mongodb.net/Second-Brain")
import cors from 'cors'
const app = express();
app.use(express.json());

app.use(cors())



app.post("/api/v1/signup", async function (req, res) {
    const username = req.body.username
    const password = req.body.password



    const parsedData = requiredBody.safeParse(req.body)
    if (!parsedData.success) {
        res.json({
            message: "Incorrect Format",
            error: parsedData.error
        })
        return
    }

    try {
        const userExists = await UsersModel.findOne({ username: username })
        if (userExists) {
            res.status(400).json({ message: "User already exists" })
        }
        const hashedPassword = await bcrypt.hash(password, 5)


        await UsersModel.create({
            username: username,
            password: hashedPassword
        })
        res.status(201).json({
            message: "User Created"
        })
    } catch (e: any) {
        res.status(500).json({ message: "Error creating user", error: e.message });
    }
})
app.post("/api/v1/signin", async function (req, res) {
    const username = req.body.username
    const password = req.body.password

    const user = await UsersModel.findOne({
        username: username

    })
    if (!user) {
        res.status(404).json({
            message: "User doesnot exists"
        })
        return
    }

    const comparedPassword = await bcrypt.compare(password, user.password)
    if (comparedPassword) {
        const token = jwt.sign({ id: user._id }, JWT_SECRETE)
        res.json({
            token
        })
    } else {
        res.status(400).json({ message: "Incorrect Credentials" });
    }

})
app.post("/api/v1/content", authMiddleWare, async function (req, res) {
    const { links, types, title } = req.body
    const userId = req.userId
    try {
        await ContentsModel.create({
            links: links,
            types: types,
            title: title,
            tags: [],
            userId: userId
        })
        res.status(201).json({ message: "Content Is Added" })
    } catch (e: any) {
        res.status(500).json({ message: "Error adding content", error: e.message });
    }

})
app.get("/api/v1/content", authMiddleWare, async function (req, res) {
    const userId = req.userId;
    try {
        const content = await ContentsModel.find({
            userId: userId
        }).populate("userId", "username")

        res.json({ content })
    } catch (e: any) {
        res.status(500).json({ message: "Error fetching content", error: e.message });
    }

})
app.delete("/api/v1/content", authMiddleWare, async function (req, res) {
    const userId = req.userId;
    const contentId = req.query.contentId
    try {
        const contentToDelete = await ContentsModel.findOneAndDelete({
            _id: contentId,
            userId: userId
        })
        if (!contentToDelete) {
            res.status(404).json({ message: "Incorrect Content Id" });
        }
        res.json({ message: "Content Deleted" })
    } catch (e: any) {
        res.status(500).json({ message: "Error deleting content", error: e.message });
    }


})


app.get("/api/v1/allyoutube", authMiddleWare, async function (req, res){
    const userId = req.userId;
    try {
        const content = await ContentsModel.find({
            userId: userId,
            types:'youtube'
        }).populate("userId", "username")

        res.json({ content })
    } catch (e: any) {
        res.status(500).json({ message: "Error fetching content", error: e.message });
    }
})
app.get("/api/v1/allx", authMiddleWare, async function (req, res){
    const userId = req.userId;
    try {
        const content = await ContentsModel.find({
            userId: userId,
            types:'tweet'
        }).populate("userId", "username")

        res.json({ content })
    } catch (e: any) {
        res.status(500).json({ message: "Error fetching content", error: e.message });
    }
})
app.get("/api/v1/allreddit", authMiddleWare, async function (req, res){
    const userId = req.userId;
    try {
        const content = await ContentsModel.find({
            userId: userId,
            types:'reddit'
        }).populate("userId", "username")

        res.json({ content })
    } catch (e: any) {
        res.status(500).json({ message: "Error fetching content", error: e.message });
    }
})
app.get("/api/v1/allother", authMiddleWare, async function (req, res){
    const userId = req.userId;
    try {
        const content = await ContentsModel.find({
            userId: userId,
            types:'other'
        }).populate("userId", "username")

        res.json({ content })
    } catch (e: any) {
        res.status(500).json({ message: "Error fetching content", error: e.message });
    }
})


app.post("/api/v1/brain/share", authMiddleWare, async function (req, res) {
    const share = req.body.share
    if (share) {
        const existingLink = await LinksModel.findOne({
            userId : req.userId
        });
        if(existingLink){
            res.json({
                hash: existingLink.hash
            })
        }
        const hash =random(10)
        await LinksModel.create({
            userId: req.userId,
            hash: hash
        })
        res.json({
            message: "Updated Shareable Link",
            link:hash
        })

    } else {
        await LinksModel.deleteOne(
            { userId: req.userId }
        );
        res.json({
            message: "Removed  Link"
        })
    }
    
})
app.get("/api/v1/brain/:shareLink", async function (req, res) {
    const hash = req.params.shareLink;
    try {
        const link = await LinksModel.findOne({
            hash: hash
        })

        if (!link) {
            res.status(411).json({
                message: "Sorry incorrect input"
            })
            return
        }

        const content = await ContentsModel.find({
            userId: link.userId
        })
        const user = await UsersModel.findOne({
            _id: link.userId
        })
        res.json({
            username: user?.username,
            content: content
        })

    } catch (e) {
        res.json(e)
    }

})

app.listen(3000, () => {
    console.log("Listening on port 3000")
})
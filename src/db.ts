import mongoose, { ObjectId } from "mongoose";

const Schema = mongoose.Schema;
const ObjectID = mongoose.Types.ObjectId;

// Define content types (youtube, tweet, reddit, other)
const contentTypes = ['youtube', 'tweet', 'reddit', 'other'];

// User Schema
const userSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

// Create User Model
export const UsersModel = mongoose.model('Users', userSchema);

// Tags Schema
const tagsSchema = new Schema({
    title: { type: String, required: true, unique: true }
});

// Create Tags Model
export const TagsModel = mongoose.model('Tags', tagsSchema);

// Links Schema
const linksSchema = new Schema({
    hash: { type: String, required: true, unique: true },
    userId: { type: ObjectID, ref: "Users", required: true }
});

// Create Links Model
export const LinksModel = mongoose.model('Links', linksSchema);

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
        validate: async function (value: ObjectId) {
            const user = await UsersModel.findById(value);
            if (!user) {
                throw new Error("User Does not Exist");
            }
        }
    }
});

// Pre-save hook to validate if the user exists before saving content
contentsSchema.pre('save', async function (next) {
    const user = await UsersModel.findById(this.userId);
    if (!user) {
        throw new Error('User does not exist');
    }
    next();
});

// Create Contents Model
export const ContentsModel = mongoose.model('Contents', contentsSchema);

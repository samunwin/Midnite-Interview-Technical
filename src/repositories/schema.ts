import * as mongoose from "mongoose";


const eventSchema = new mongoose.Schema(
    {
        user_id: {type: Number, required: true},
        type: {type: String, required: true},

    }
)
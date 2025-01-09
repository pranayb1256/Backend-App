import { mongoose,Schema} from "mongoose";

const subscritpionSchema=Schema({
    subscriber:
    {
        type: Schema.Types.ObjectId,
        ref:"User"
    },
    channel:
    {
        type: Schema.Types.ObjectId, // One to whom 'subsriber is subscribing
        ref:"User"
    }
},{timestamps:true})

export const subscritpion = mongoose.model("subscritpion",subscritpionSchema)




import mongoose from "mongoose";

const multSchema = mongoose.Schema({
    mult: {
        type: String
    }
}, {
    timestamps: true
});

export const Mult = mongoose.model('Mult', multSchema);

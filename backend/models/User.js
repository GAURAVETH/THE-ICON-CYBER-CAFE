import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please provide a name"],
            trim: true,
            minlength: [2, "Name must be at least 2 characters"]
        },

        email: {
            type: String,
            required: [true, "Please provide an email"],
            unique: true,
            lowercase: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                "Please provide a valid email"
            ]
        },

        password: {
            type: String,
            select: false
        },

        phone: {
            type: String,
            default: ""
        },

        avatar: {
            type: String,
            default: null
        },

        role: {
            type: String,
            enum: ["user", "worker", "admin"],
            default: "user"
        },

        googleId: String,

        isActive: {
            type: Boolean,
            default: true
        },

        address: {
            street: String,
            city: String,
            state: String,
            pincode: String,
            country: String
        },

        bookingHistory: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Booking"
            }
        ],

        totalBookings: {
            type: Number,
            default: 0
        },

        averageRating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        }
    },
    {
        timestamps: true
    }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
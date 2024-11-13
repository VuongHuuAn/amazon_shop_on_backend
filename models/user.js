const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    name: {
        required: true,
        type: String,
        trim: true,
    },
    email: {
        required: true,
        type: String,
        trim: true,
        validate: {
            validator: (value) => {
                const re = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
                return value.match(re);
            },
            message: "Email không hợp lệ.",
        },
    },
    password: {
        type: String,
    },
    googleId: {
        type: String,
        sparse: true,
        unique: true,
    },
    address: {
        type: String,
        default: "",
    },
    type: {
        type: String,
        default: "user",
    },
    // Sửa lại cấu trúc cart
    cart: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true,
            },
            quantity: {
                type: Number, // Đảm bảo quantity luôn là số
                required: true,
                min: 1, // Số lượng tối thiểu là 1
                validate: {
                    validator: Number.isInteger, // Đảm bảo là số nguyên
                    message: '{VALUE} không phải là số nguyên hợp lệ'
                }
            },
        },
    ],
});

// Thêm middleware để populate product khi query
userSchema.pre('find', function(next) {
    this.populate('cart.product');
    next();
});

userSchema.pre('findOne', function(next) {
    this.populate('cart.product');
    next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;
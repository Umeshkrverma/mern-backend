const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name"],
        maxLength: [30, "Name cannot be more than 30 characters"],
        minLength: [3, "Name should be at least three character long "]
    },
    email: {
        type: String,
        required: [true, "Please enter your email"],
        unique: true,
        validate: [validator.isEmail, "Please enter a valid email"]
    },
    password: {
        type: String,
        required: [true, "Please enter a password"],
        minLength: [8, "Password should be 8 characters long"],
        select: false
    },
    avatar: {
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    },
    role: {
        type: String,
        default: "user"
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
})
//password hashing before saving into db
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }

    this.password = await bcrypt.hash(this.password, 10)
})
//JWT tokens
userSchema.methods.getJWTToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWTKEY, { expiresIn: process.env.JWT_EXPIRE })
}
//password checker
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}
//password reset token
userSchema.methods.getPasswordToken = function(){
    //generate a token
const resetToken = crypto.randomBytes(20).toString("hex"); //basicaly generates a random token
//hashing and saving into the users....
this.resetPasswordToken = crypto
.createHash("sha256")
.update(resetToken)
.digest("hex");
//time limit for token
this.resetPasswordExpire = Date.now() + 15*60*1000;
return resetToken
}



module.exports = mongoose.model("User", userSchema);
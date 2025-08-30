const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: { type: String, default: "Admin" },
    schoolName: String
});

// 🚨 Enforce only one document in the "admins" collection
adminSchema.pre("save", async function (next) {
    const Admin = mongoose.model("admin", adminSchema);
    const count = await Admin.countDocuments();
    if (count > 0) {
        const err = new Error("You can not register as an admin");
        err.name = "AdminExistsError";
        return next(err);
    }
    next();
});

module.exports = mongoose.model("admin", adminSchema);

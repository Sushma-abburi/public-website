// module.exports = async function generateUniqueId(User) {
//   const count = await User.countDocuments();

//   const nextNumber = (count + 1).toString().padStart(4, "0");

//   return `DTVB-${nextNumber}`;
// };


// utils/generateUniqueId.js
const Counter = require("../models/Counter");

module.exports = async function generateUniqueId() {
  const counter = await Counter.findOneAndUpdate(
    { name: "user" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  return `DT-${String(counter.seq).padStart(3, "0")}`;
};

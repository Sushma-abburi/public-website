module.exports = async function generateUniqueId(User) {
  const count = await User.countDocuments();

  const nextNumber = (count + 1).toString().padStart(4, "0");

  return `DTVB-${nextNumber}`;
};

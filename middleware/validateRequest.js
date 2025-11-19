module.exports = (req, res, next) => {
  const { email, phone, password } = req.body;

  const emailRegex =
    /^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.com|outlook\.com)$/;

  if (!emailRegex.test(email)) {
    return res.status(400).json({
      msg: "Email must be gmail.com, yahoo.com, outlook.com"
    });
  }

  if (!/^\d{10}$/.test(phone)) {
    return res.status(400).json({ msg: "Phone number must be 10 digits" });
  }

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{12,}$/;

  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      msg: "Password must include 1 uppercase, 1 lowercase, 1 number, 1 special character and min 12 chars"
    });
  }

  next();
};


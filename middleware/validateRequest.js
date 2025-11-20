module.exports = (req, res, next) => {
  const { email, phone, password, confirmPassword } = req.body;

  // ------------ Email Validation ------------
  const allowedDomains = ["gmail.com", "yahoo.com", "outlook.com"];
  const emailRegex = /^[a-zA-Z0-9._%+-]+@([a-zA-Z0-9.-]+)$/;

  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({
      msg: "Enter a valid email"
    });
  }

  const domain = email.split("@")[1];
  if (!allowedDomains.includes(domain)) {
    return res.status(400).json({
      msg: `Email domain must be one of: ${allowedDomains.join(", ")}`
    });
  }

  // ------------ Phone Validation ------------
  const phoneRegex = /^\d{10}$/;

  if (!phoneRegex.test(phone)) {
    return res.status(400).json({
      msg: "Phone number must be 10 digits"
    });
  }

  // ------------ Password Validation ------------
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{12,}$/;

  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      msg: "Password must include 1 uppercase, 1 lowercase, 1 number, 1 special character and min 12 characters"
    });
  }

  // ------------ Confirm Password ------------
  if (password !== confirmPassword) {
    return res.status(400).json({
      msg: "Passwords do not match"
    });
  }

  next();
};

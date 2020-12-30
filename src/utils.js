module.exports.sanitizeValue = (value) => {
  try {
    if (["string", "object"].includes(typeof value)) {
      const string = JSON.stringify(value);
      return JSON.parse(string);
    }
    return null;
  } catch (err) {
    return null;
  }
};

module.exports.constructValue = (value, expiresIn) => {
  if (expiresIn === "never") {
    return { value, expiresIn };
  } else {
    const now = new Date();
    return { value, expiresIn: new Date(now.getTime() + expiresIn) };
  }
};

module.exports.isExpired = (value) => {
  const now = new Date();
  const expiry = new Date(value.expiresIn);
  if (expiry !== "never" && expiry < now) {
    return true;
  }
  return false;
};

module.exports.isSizeExceeded = (value) => {
  const allowedSize = 16 * 1024; // 16 KiBs
  const string = JSON.stringify(value);
  const actualSize = Buffer.byteLength(string);
  return actualSize > allowedSize;
};

export const nameValidator = (name) => {
  if (!name || name.length < 2 || name.length > 50) {
    return {
      isValid: false,
      message: "Name must be between 2 and 50 characters long.",
    };
  }
  return {
    isValid: true,
    message: "Name is valid.",
  };
};

export const emailValidator = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return {
      isValid: false,
      message: "Invalid email format.",
    };
  }
  return {
    isValid: true,
    message: "Email is valid.",
  };
};

export const passwordValidator = (password) => {
  if (!password || password.length < 6 || password.length > 100) {
    return {
      isValid: false,
      message: "Password must be between 6 and 100 characters long.",
    };
  }
  return {
    isValid: true,
    message: "Password is valid.",
  };
};

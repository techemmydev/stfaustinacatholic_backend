import jsonwebtoken from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  // Get the token from the cookies
  const token = req.cookies.token;

  // If there's no token, send an 'Access Denied' response
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Access Denied: No token provided" });
  }

  try {
    // Verify the token using the secret key
    const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);

    // Attach the user ID to the request object for future use
    req.userId = decoded.id; // We are assuming that the payload contains `id`

    // Allow the request to proceed to the next middleware/route handler
    next();
  } catch (error) {
    // In case of an error, return 'Access Denied' response
    console.error("Error verifying token", error);
    return res
      .status(401)
      .json({
        success: false,
        message: "Access Denied: Invalid or expired token",
      });
  }
};

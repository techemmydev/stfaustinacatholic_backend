//generating cookies for the user when they sign in

//first steps
import jsonwebtoken from "jsonwebtoken";

//step 2

// Function to generate a JWT token and set it as a cookie in the response
export const generateToken = (res, userId) => {
  const token = jsonwebtoken.sign({ id: userId._id }, process.env.JWT_SECRET, {
    expiresIn: "30d", //expires in 30 days
  });

  //step 3
  // Set the cookie in the response
  res.cookie("token", token, {
    httpOnly: true, //cookie cannot be accessed by client side scripts
    secure: process.env.NODE_ENV === "production",

    sameSite: "strict", //cookie is sent only to the same site as the request
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  });

  return token; //return the token
};

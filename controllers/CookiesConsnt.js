// Cookie Consent Routes
export const getcookies = async (req, res) => {
  const consent = req.cookies.userConsent || null;
  res.json({ consent });
};

export const postcookies = async (req, res) => {
  const { consent } = req.body;
  res.cookie("userConsent", consent, {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    httpOnly: false, // Allow client-side access
    sameSite: "Strict",
  });
  res.json({ message: "Cookie preference saved" });
};

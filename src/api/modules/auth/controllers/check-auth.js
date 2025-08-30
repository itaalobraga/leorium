export function checkAuthStatus(req, res) {
  return res.status(200).json({
    authenticated: true,
    user: req.user,
  });
}

export function checkAuthStatusPublic(req, res) {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(200).json({
      authenticated: false,
    });
  }

  return res.status(200).json({
    authenticated: true,
  });
}

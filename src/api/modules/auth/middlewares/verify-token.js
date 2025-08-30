import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res.status(401).json({ error: "Acesso negado " });
  }

  const token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;

  try {
    const decoded = jwt.verify(token, "secret-key");

    req.userId = decoded.userId;

    next();
  } catch (error) {
    console.error("❌ Erro na verificação do token:", error);
    res.status(401).json({ error: "Token inválido" });
  }
};

export { verifyToken };

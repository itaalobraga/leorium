import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AuthController {
  static login(req, res) {
    res.sendFile(path.join(__dirname, "..", "pages", "login.html"));
  }

  static async authenticate(req, res, database, saveDatabase) {
    const { username, password } = req.body;

    const user = database.users.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      req.session.authenticated = true;
      req.session.userId = user.id;
      req.session.userProfile = user.profile;
      res.redirect("/");
    } else {
      res.redirect("/login?error=1");
    }
  }

  static logout(req, res) {
    req.session.destroy();
    res.redirect("/");
  }

  static getAuthStatus(req, res) {
    res.json({
      authenticated: !!req.session.authenticated,
      userId: req.session.userId || null,
      userProfile: req.session.userProfile || null,
    });
  }
}

export default AuthController;

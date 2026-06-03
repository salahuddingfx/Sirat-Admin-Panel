import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button, Input } from "../../../components/ui";
import "./LoginPage.css";

export function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && password) {
      onLogin({ email, password });
    }
  };

  return (
    <div className="login-container">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="login-card"
      >
        <div className="login-header">
          <span className="login-brand">SIRAT</span>
          <span className="login-badge">ADMIN COMMAND CENTER</span>
        </div>

        <div className="login-intro">
          <h2>Sign In</h2>
          <p>Access control room and manage fashion drops.</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <Input
            id="admin-email"
            type="text"
            label="Email, Username, or Phone"
            placeholder="johndoe@example.com or johndoe"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="password-field">
            <Input
              id="admin-pass"
              type={showPassword ? "text" : "password"}
              label="Password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <Button type="submit" className="login-submit">
            Enter Console <ArrowRight size={18} />
          </Button>
        </form>
      </motion.div>
    </div>
  );
}

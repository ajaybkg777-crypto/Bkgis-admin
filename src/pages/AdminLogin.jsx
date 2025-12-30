import React, { useState } from "react";
import api from "../api";
import "../styles/AdminLogin.css";

export default function AdminLogin() {
  const [user, setUser] = useState({ username: "", password: "" });

  const login = async () => {
    if (!user.username || !user.password) {
      alert("Please enter username and password");
      return;
    }

    try {
      const { data } = await api.post("admin/auth/login", {
        username: user.username,
        password: user.password,
      });

      localStorage.setItem("token", data.token);
      window.location.href = "/panel";
    } catch (err) {
      alert("Invalid username or password");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h2>Admin Login</h2>
        <p className="subtitle">Login to access admin dashboard</p>

        <input
          type="text"
          placeholder="Username"
          onChange={(e) =>
            setUser((prev) => ({ ...prev, username: e.target.value }))
          }
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) =>
            setUser((prev) => ({ ...prev, password: e.target.value }))
          }
        />

        <button onClick={login}>Login</button>
      </div>
    </div>
  );
}

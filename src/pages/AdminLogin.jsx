import React, { useState } from "react";
import api from "../api";

export default function AdminLogin() {
  const [user, setUser] = useState({ username: "", password: "" });

  const login = async () => {
    if (!user.username || !user.password) {
      alert("Please enter username and password");
      return;
    }

    try {
      const { data } = await api.post("/admin/auth/login", {
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
    <div style={{ padding: 50 }}>
      <h2>Admin Login</h2>

      <input
        placeholder="Username"
        onChange={(e) =>
          setUser((prev) => ({ ...prev, username: e.target.value }))
        }
      />

      <input
        placeholder="Password"
        type="password"
        onChange={(e) =>
          setUser((prev) => ({ ...prev, password: e.target.value }))
        }
      />

      <button onClick={login}>Login</button>
    </div>
  );
}
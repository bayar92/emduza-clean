"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import LoginForm from "@/components/LoginForm";

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "/api/auth/login",
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.success) {
        router.push("/duzadmin");
      } else {
        setError("Нэвтрэх үед алдаа гарлаа. Дахин оролдоно уу.");
      }
    } catch {
      setError("Емайл хаяг эсвэл нууц үг буруу байна.");
    }
  };

  return (
    <LoginForm
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      error={error}
      onSubmit={handleLogin}
    />
  );
};

export default LoginPage;

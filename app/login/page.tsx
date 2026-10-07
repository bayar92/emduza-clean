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
    } catch (err) {
      const status = axios.isAxiosError(err) ? err.response?.status : undefined;
      if (status === 429) {
        // Locked out: show the server's message (includes the wait time).
        const serverMsg = axios.isAxiosError(err)
          ? err.response?.data?.error
          : undefined;
        setError(
          serverMsg ??
            "Хэт олон оролдлого хийсэн байна. Түр хүлээгээд дахин оролдоно уу."
        );
      } else if (status === 401) {
        setError("Емайл хаяг эсвэл нууц үг буруу байна.");
      } else if (status === 400) {
        setError("Емайл хаяг болон нууц үгээ оруулна уу.");
      } else {
        setError("Серверийн алдаа гарлаа. Дахин оролдоно уу.");
      }
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

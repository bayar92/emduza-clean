import React from "react";
import Image from "next/image";

interface LoginFormProps {
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  error: string;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const LoginForm = ({
  email,
  setEmail,
  password,
  setPassword,
  error,
  onSubmit,
}: LoginFormProps) => {
  return (
    <div className="flex min-h-screen bg-[#0D47A1] items-center justify-center">
      <div className="w-full max-w-sm mx-auto lg:w-96">
        <div className="flex flex-col items-center">
          <Image
            src="/images/full_logo.png"
            alt="Logo"
            width={256}
            height={256}
          />
          <h2 className="mt-6 text-3xl font-bold text-gray-50">
            ЭМДҮЗ, Тавтай морил
          </h2>
        </div>
        <div className="mt-8">
          <form onSubmit={onSubmit} className="space-y-6">
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-50"
              >
                И-мэйл хаягаа оруулна уу:
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-3 py-2 placeholder-gray-400 border bg-white border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-50"
              >
                Нууц үгээ оруулна уу:
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-3 py-2 placeholder-gray-400 border bg-white border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-[#5CC64A] border border-transparent rounded-md shadow-sm hover:bg-[#4EA93E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Нэвтрэх
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../utils/axios";

interface IProps {
  type: "register" | "login";
}

export default function FormAuth({ type }: IProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const isRegister = type === "register";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    try {
      const endpoint = isRegister ? "/auth/register" : "/auth/login";

      await axios.post(endpoint, { email, password });

      if (isRegister) {
        navigate("/auth/login");
      } else {
        navigate("/");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Something went wrong. Try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-[420px] bg-[var(--card)] border border-[var(--main-border)] rounded-[var(--main-radius)] shadow-[var(--main-shadows)] p-8 flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-[24px] font-semibold text-[var(--main-txt-color)]">
          {isRegister ? "Create Account" : "Welcome"}
        </h1>
        <p className="text-sm text-[var(--second-txt-color)]">
          {isRegister ? "Register to access admin panel" : "Login to continue"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label className="text-sm text-[var(--second-txt-color)]">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 px-4 rounded-[var(--main-radius)] border border-[var(--main-border)] focus:outline-none focus:ring-2 focus:ring-blue-100"
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-[var(--second-txt-color)]">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 px-4 rounded-[var(--main-radius)] border border-[var(--main-border)] focus:outline-none focus:ring-2 focus:ring-blue-100"
            placeholder="Enter your password"
            required
          />
        </div>

        {error && (
          <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded p-2">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="h-11 mt-2 rounded-[var(--main-radius)] bg-[var(--accent)] text-white font-medium hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? "Processing..." : isRegister ? "Register" : "Login"}
        </button>
      </form>
    </div>
  );
}

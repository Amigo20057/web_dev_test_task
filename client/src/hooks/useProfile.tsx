import { useEffect, useState } from "react";
import axios from "../utils/axios";
import type { IUser } from "../types/user.interface";
import { useNavigate } from "react-router-dom";

export default function useProfile() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [data, setData] = useState<IUser | null>(null);
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUser() {
      setIsLoading(true);
      try {
        const response = await axios.get("/auth/profile");
        setData(response.data);
        setIsAuth(true);
      } catch (error: any) {
        setIsAuth(false);
        setData(null);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUser();
  }, []);

  const logout = async () => {
    try {
      await axios.post("/auth/logout");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setData(null);
      setIsAuth(false);
      navigate("/auth/login");
    }
  };

  return {
    isLoading,
    data,
    isAuth,
    logout,
  };
}

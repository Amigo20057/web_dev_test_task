import ReactDOM from "react-dom/client";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import MainLayout from "./layouts/main-layout";
import React from "react";
import "./index.css";
import OrdersPage from "./pages/orders";
import UploadPage from "./components/upload-file";
import ManualCreatePage from "./pages/manual-create";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/orders" replace />,
      },
      {
        path: "orders",
        element: <OrdersPage />,
      },
      {
        path: "upload",
        element: <UploadPage />,
      },
      {
        path: "create-order",
        element: <ManualCreatePage />,
      },
    ],
  },
]);

const rootElement = document.getElementById("root");

ReactDOM.createRoot(rootElement!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);

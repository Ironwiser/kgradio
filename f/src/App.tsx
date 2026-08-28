import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom"
import { MainLayout } from "@/components/layout/MainLayout"
import { Home } from "@/pages/Home"
import { DjSets } from "@/pages/DjSets"
import { Canli } from "@/pages/Canli"
import { Kayit } from "@/pages/Kayit"
import { Giris } from "@/pages/Giris"
import { Hakkimizda } from "@/pages/Hakkimizda"
import { Admin } from "@/pages/Admin"
import { AdminRoute } from "@/components/auth/AdminRoute"

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "dj-sets", element: <DjSets /> },
      { path: "calma-listeleri", element: <Navigate to="/dj-sets" replace /> },
      { path: "canli", element: <Canli /> },
      { path: "rasgele", element: <Hakkimizda /> },
      { path: "hakkimizda", element: <Hakkimizda /> },
      { path: "kayit", element: <Kayit /> },
      { path: "giris", element: <Giris /> },
      { element: <AdminRoute />, children: [{ path: "admin", element: <Admin /> }] },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}

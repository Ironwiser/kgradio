import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { MainLayout } from "@/components/layout/MainLayout"
import { Home } from "@/pages/Home"
import { Listeler } from "@/pages/Listeler"
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
      { path: "calma-listeleri", element: <Listeler /> },
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

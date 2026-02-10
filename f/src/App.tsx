import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { MainLayout } from "@/components/layout/MainLayout"
import { Home } from "@/pages/Home"
import { Spotify } from "@/pages/Spotify"
import { Canli } from "@/pages/Canli"

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "calma-listeleri", element: <Spotify /> },
      { path: "canli", element: <Canli /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}

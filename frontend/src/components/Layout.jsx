import { Outlet } from "react-router-dom"

const Layout = () => {
  return (
    <div className="w-full h-screen bg-[#3B3B3B] px-2">
      <Outlet />
    </div>
  )
}

export default Layout
import { Link } from "react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";
import { IoSettingsOutline } from "react-icons/io5";
import { PiArmchair } from "react-icons/pi";
import { TbLayoutDashboard } from "react-icons/tb";
import { FaDoorOpen } from "react-icons/fa6";
import { FiLogOut } from "react-icons/fi";
import logo from "@/assets/logo.svg"; 

export const AppSidebar = () => {
  const items = [
    {
      title: "Dashboard",
      icon: <TbLayoutDashboard />,
      url: "/dashboard",
    },
    {
      title: "Rooms",
      icon: <FaDoorOpen />,
      url: "/rooms",
    },
    {
      title: "Items",
      icon: <PiArmchair />,
      url: "/items",
    },
    {
      title: "Settings",
      icon: <IoSettingsOutline />,
      url: "/settings",
    },
  ];

  return (
    <Sidebar collapsible="icon" className="bg-[#053e4c] border-none ">
      <SidebarHeader className="font-dmsans">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="hover:bg-transparent text-lg font-semibold h-13">
              <Link to="/" className="flex items-center flex-1 gap-x-2">
                <img
                  src={logo}
                  alt="Inventry Logo"
                  className="size-6 -ml-1"
                />
                <span className="text-[#60a0fe]">Inventry</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="font-dmsans p-2">
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                className="text-base hover:bg-gradient-to-r from-[#70d0e3] to-[#89c6d2] hover:text-[#003442] h-10"
              >
                <Link to={item.url} className="text-waterspout">
                  {item.icon}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="font-dmsans">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="hover:bg-gradient-to-r from-[#70d0e3] to-[#89c6d2] hover:text-[#003442] text-base h-10"
            >
              <Link to="/" className="text-waterspout">
                <FiLogOut />
                <span className="-mt-[2px]">Log out</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

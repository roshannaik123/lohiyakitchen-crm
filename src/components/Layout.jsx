import { useEffect, useState } from "react";
import { Drawer } from "antd";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { ConfigProvider } from "antd";

export default function Layout({ children }) {
  const [isMobile, setIsMobile] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      {!isMobile && (
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: "#006666",
            },
            components: {
              Menu: {
                itemSelectedBg: "#006666",
                itemSelectedColor: "#ffffff",
                itemHoverColor: "#006666",
                itemHoverBg: "#e6f2f2",
              },
            },
          }}
        >
          <Sidebar collapsed={collapsed} isMobile={isMobile} />
        </ConfigProvider>
      )}
      {isMobile && (
        <Drawer
          placement="left"
          closable={false}
          onClose={() => setDrawerOpen(false)}
          open={drawerOpen}
          styles={{ body: { padding: 0 } }}
          width={256}
        >
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: "#006666",
              },
              components: {
                Menu: {
                  itemSelectedBg: "#006666",
                  itemSelectedColor: "#ffffff",
                  itemHoverColor: "#006666",
                  itemHoverBg: "#e6f2f2",
                },
              },
            }}
          >
            <Sidebar
              collapsed={false}
              onClose={() => setDrawerOpen(false)}
              isMobile={true}
            />
          </ConfigProvider>
        </Drawer>
      )}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar
          collapsed={collapsed}
          onToggle={() => {
            if (isMobile) {
              setDrawerOpen(true);
            } else {
              setCollapsed(!collapsed);
            }
          }}
        />
        <main className="flex-1 overflow-auto p-4 bg-gray-100">{children}</main>
      </div>
    </div>
  );
}

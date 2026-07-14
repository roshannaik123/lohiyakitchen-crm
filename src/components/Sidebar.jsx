import {
  ArrowRightOutlined,
  BarChartOutlined,
  BellOutlined,
  CloseOutlined,
  HomeOutlined,
  MessageOutlined,
  PictureOutlined,
  ProfileOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  SolutionOutlined,
  TagsOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Alert, Menu } from "antd";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import logo1 from "../assets/logo-1.png";
import { setShowUpdateDialog } from "../store/auth/versionSlice";
import useFinalUserImage from "./common/Logo";

const getMenuItems = (collapsed) => {
  const userType = useSelector((state) => state?.auth?.user?.user_type);
  const dashboardItems = [
    { key: "/home", icon: <HomeOutlined />, label: "Dashboard" },
    ...(userType === 6
      ? [{ key: "/pos", icon: <HomeOutlined />, label: "POS" }]
      : []),
    { key: "/category", icon: <TagsOutlined />, label: "Category" },
    { key: "/product", icon: <ShoppingOutlined />, label: "Products" },
  ];
  const generalItems = [
    ...(userType === 6
      ? [
          { key: "/user", icon: <UserOutlined />, label: "App User" },
          { key: "/guest-user", icon: <UserOutlined />, label: "Guest User" },
        ]
      : []),
    { key: "/order", icon: <ShoppingCartOutlined />, label: "App Order" },
    {
      key: "/guest-user-order",
      icon: <ShoppingCartOutlined />,
      label: "Web Order",
    },
  ];

  const otherItems = [
    {
      key: "/supplier",
      icon: <SolutionOutlined />,
      label: "Supplier",
    },
    {
      key: "/team",
      icon: <SolutionOutlined />,
      label: "Team",
    },
    { key: "/slider", icon: <PictureOutlined />, label: "Slider" },
    { key: "/notification", icon: <BellOutlined />, label: "Notification" },
    {
      key: "/website-enquiry",
      icon: <MessageOutlined />,
      label: "Website Enquiry",
    },
  ];
  const reportItemsChildren = [
    {
      key: "/report-category",
      icon: <ProfileOutlined />,
      label: "Category",
    },
    { key: "/report-product", icon: <ProfileOutlined />, label: "Product" },
    {
      key: "/report-product-category",
      icon: <ProfileOutlined />,
      label: "Product Category",
    },
    {
      key: "/report-order",
      icon: <ProfileOutlined />,
      label: "Orders",
    },
    {
      key: "/report-order-product",
      icon: <ProfileOutlined />,
      label: "Orders Product",
    },
  ];

  if (collapsed) {
    return [
      ...dashboardItems,
      ...generalItems,
      // {
      //   key: "sub1",
      //   icon: <MailOutlined />,
      //   label: "Management",
      //   children: managementChildren,
      // },

      {
        key: "sub2",
        icon: <BarChartOutlined />,
        label: <span id="report-scroll-anchor">Report</span>,
        children: reportItemsChildren,
      },
      ...otherItems,
    ];
  }

  return [
    {
      type: "group",
      label: "Dashboard",
      children: dashboardItems,
    },
    {
      type: "group",
      label: "General",
      children: generalItems,
    },
    // {
    //   type: "group",
    //   label: "Management",
    //   children: [
    //     {
    //       key: "sub1",
    //       icon: <MailOutlined />,
    //       label: "Management",
    //       children: managementChildren,
    //     },
    //   ],
    // },

    {
      type: "group",
      label: "Report",
      children: [
        {
          key: "sub2",
          icon: <BarChartOutlined />,
          label: <span id="report-scroll-anchor">Report</span>,

          children: reportItemsChildren,
        },
      ],
    },
    {
      type: "group",
      label: "Others",
      children: otherItems,
    },
  ];
};

export default function Sidebar({ collapsed, isMobile = false, onClose }) {
  const location = useLocation();
  const selectedKeys = [location.pathname];
  const getOpenKeysFromPath = (path) => {
    if (path.startsWith("/report-")) return ["sub2"];
    return [];
  };

  const [openKeys, setOpenKeys] = useState(() =>
    getOpenKeysFromPath(location.pathname)
  );
  const naviagte = useNavigate();
  const items = getMenuItems(collapsed);
  const dispatch = useDispatch();
  const finalUserImage = useFinalUserImage();
  const [delayedCollapse, setDelayedCollapse] = useState(collapsed);
  const localVersion = useSelector((state) => state.auth?.version);
  const serverVersion = useSelector((state) => state?.version?.version);
  const showDialog = localVersion !== serverVersion ? true : false;
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDelayedCollapse(collapsed);
    }, 150);

    return () => clearTimeout(timeout);
  }, [collapsed]);

  const handleOpenDialog = () => {
    dispatch(
      setShowUpdateDialog({
        showUpdateDialog: true,
        version: serverVersion,
      })
    );
  };
  const rootSubmenuKeys = ["sub1", "sub2"];
  useEffect(() => {
    if (openKeys.includes("sub2")) {
      const anchor = document.getElementById("report-scroll-anchor");
      const scrollContainer = document.querySelector(".scrollbar-custom");

      if (anchor && scrollContainer) {
        let offset = 0;
        let el = anchor;

        while (el && el !== scrollContainer) {
          offset += el.offsetTop;
          el = el.offsetParent;
        }

        scrollContainer.scrollTo({
          top: offset - 10,
          behavior: "smooth",
        });
        setTimeout(() => {
          scrollContainer.scrollTo({
            top: offset - 10,
            behavior: "smooth",
          });
        }, 200);
      } else {
        console.warn("⚠️ Could not find anchor or scroll container.");
      }
    }
  }, [openKeys]);

  return (
    <motion.aside
      initial={{ width: collapsed ? 95 : 260 }}
      animate={{ width: collapsed ? 95 : 260 }}
      transition={{ duration: 0.3 }}
      className={`h-full bg-white shadow-xl  overflow-hidden flex flex-col font-[Inter] transition-all duration-300
        ${isMobile ? "fixed z-50 h-screen" : "relative"}`}
    >
      <div className="flex items-center justify-center h-14 px-4 bg-[#e6f2f2]">
        <motion.img
          src={collapsed ? logo1 : finalUserImage}
          alt="Logo"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className={`object-contain transition-all duration-300 ${
            collapsed ? "w-8" : "w-28"
          }`}
        />

        {isMobile && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={onClose}
            className="text-white hover:text-red-300 transition-colors"
          >
            <CloseOutlined className="text-xl" />
          </motion.button>
        )}
      </div>

      <div className="flex-1  py-2 scrollbar-custom">
        <Menu
          mode="inline"
          inlineCollapsed={delayedCollapse}
          items={items}
          openKeys={openKeys}
          selectedKeys={selectedKeys}
          onOpenChange={(keys) => {
            const latestOpenKey = keys.find(
              (key) => openKeys.indexOf(key) === -1
            );
            if (rootSubmenuKeys.includes(latestOpenKey)) {
              setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
            } else {
              setOpenKeys(keys);
            }
          }}
          onClick={({ key, keyPath }) => {
            if (isMobile && onClose) {
              onClose();
            }
            if (keyPath.length === 1) {
              setOpenKeys([]);
            }
            naviagte(key);
          }}
          className="custom-menu"
        />
      </div>

      {!collapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xs text-gray-500  text-center border-t border-[#006666] bg-[#e6f2f2]"
        >
          {showDialog ? (
            <div
              className="w-full cursor-pointer animate-pulse"
              onClick={handleOpenDialog}
            >
              <Alert
                message={
                  <div className="flex items-center justify-center text-xs font-semibold">
                    <span className="flex items-center gap-1">
                      New Updated: V{localVersion}
                      <ArrowRightOutlined />V{serverVersion}
                    </span>
                  </div>
                }
                type="info"
                showIcon={false}
                banner
                className="rounded-md bg-blue-50 text-blue-800 border-blue-100 px-4 py-1 text-center"
              />
            </div>
          ) : (
            <Alert
              message={
                <div className="flex flex-col items-center text-center text-xs font-semibold">
                  <div className="flex items-center gap-1">
                    <span className="flex items-center gap-1">
                      Version: {localVersion}
                    </span>
                  </div>
                  <div className="text-[11px] font-normal text-gray-500 mt-1">
                    Updated on: 22-09-2025
                  </div>
                </div>
              }
              type="info"
              showIcon={false}
              banner
              className="rounded-md bg-blue-50 text-blue-800 border-blue-100 px-4 py-1"
            />
          )}
        </motion.div>
      )}
    </motion.aside>
  );
}

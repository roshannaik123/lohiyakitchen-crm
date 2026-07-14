import { Route, Routes } from "react-router-dom";
import AppInitializer from "./components/AppInitializer";
import ProtectedLayout from "./components/ProtectedLayout";
import VersionCheck from "./components/VersionCheck";
import ForgotPassword from "./pages/auth/ForgotPassword";
import SignIn from "./pages/auth/SignIn";
import UserPage from "./pages/profile/Profile";
import UserForm from "./pages/user/UserForm";
import CategoryList from "./pages/category/CategoryList";
import UserList from "./pages/user/UserList";
import ProductList from "./pages/product/ProductList";
import ProductForm from "./pages/product/ProductForm";
import CustomerList from "./pages/security/SecurityList";
import StaffList from "./pages/staff/StaffList";
import SecurityList from "./pages/security/SecurityList";
import DeliveryList from "./pages/delivery/DeliveryList";
import SliderList from "./pages/slider/SliderList";
import Notification from "./pages/notification/Notification";
import GuestUserList from "./pages/guestuser/GuestUserList";
import GuestUserOrderList from "./pages/guestuserorder/GuestUserOrderList";
import GuestUserOrderForm from "./pages/guestuserorder/GuestUserOrderForm";
import GuestUserForm from "./pages/guestuser/GuestUserForm";
import OrderList from "./pages/order/OrderList";
import OrderForm from "./pages/order/OrderForm";
import MaintenancePage from "./components/common/MaintenancePage";
import WebsiteEnquiry from "./pages/websiteenquiry/WebsiteEnquiry";
import CategoryReport from "./pages/report/CategoryReport/CategoryReport";
import ProductReport from "./pages/report/ProductReport/ProductReport";
import ProductCategoryReport from "./pages/report/ProductCategoryReport/ProductCategoryReport";
import OrderReport from "./pages/report/Orderreport/Orderreport";
import OrderProductReport from "./pages/report/OrderProductReport/OrderProductReport";
import OrderView from "./pages/order/OrderView";
import Dashboard from "./pages/home/Dashbord";
import Pos from "./pages/pos/Pos";
import TeamList from "./pages/team/Team";
import GuestUserView from "./pages/guestuserorder/GuestUserView";
import SupplierList from "./pages/supplier/SupplierList";

function App() {
  return (
    <AppInitializer>
      <VersionCheck />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<SignIn />} />
        <Route path="/forget-password" element={<ForgotPassword />} />
        <Route path="/maintenance" element={<MaintenancePage />} />
        <Route path="/pos" element={<Pos />} />
        {/* Protected Routes: All other paths */}
        <Route
          path="*"
          element={
            <ProtectedLayout>
              <Routes>
                <Route path="/home" element={<Dashboard />} />

                <Route path="/user-form" element={<UserPage />} />
                <Route path="/user-create" element={<UserForm />} />
                <Route path="/user-edit/:id" element={<UserForm />} />
                <Route path="/user" element={<UserList />} />
                <Route path="/supplier" element={<SupplierList />} />
                <Route path="/team" element={<TeamList />} />
                <Route path="/security" element={<SecurityList />} />
                <Route path="/staff" element={<StaffList />} />
                <Route path="/delivery" element={<DeliveryList />} />
                <Route path="/slider" element={<SliderList />} />
                <Route path="/notification" element={<Notification />} />
                <Route path="/order" element={<OrderList />} />
                <Route path="/order-form" element={<OrderForm />} />
                <Route path="/order-form/:id" element={<OrderForm />} />
                <Route path="/order-view/:orderid" element={<OrderView />} />
                <Route path="/guest-user" element={<GuestUserList />} />
                <Route
                  path="/guest-user-order"
                  element={<GuestUserOrderList />}
                />
                <Route
                  path="/guest-user-view/:orderid"
                  element={<GuestUserView />}
                />
                <Route
                  path="/guest-order-form"
                  element={<GuestUserOrderForm />}
                />
                <Route
                  path="/guest-order-form/:id"
                  element={<GuestUserOrderForm />}
                />

                <Route path="/category" element={<CategoryList />} />
                <Route path="/product" element={<ProductList />} />
                <Route path="/product-create" element={<ProductForm />} />
                <Route path="/product-edit/:id" element={<ProductForm />} />
                <Route path="/website-enquiry" element={<WebsiteEnquiry />} />
                <Route path="/report-order" element={<OrderReport />} />
                <Route
                  path="/report-order-product"
                  element={<OrderProductReport />}
                />
                <Route path="/report-category" element={<CategoryReport />} />
                <Route path="/report-product" element={<ProductReport />} />
                <Route
                  path="/report-product-category"
                  element={<ProductCategoryReport />}
                />
              </Routes>
            </ProtectedLayout>
          }
        />
      </Routes>
    </AppInitializer>
  );
}
export default App;

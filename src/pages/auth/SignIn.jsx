import { App, Button, Form, Input, Typography } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { PANEL_LOGIN } from "../../api";
import useFinalUserImage from "../../components/common/Logo";
import { useApiMutation } from "../../hooks/useApiMutation";
import { setCredentials } from "../../store/auth/authSlice";
const { Title } = Typography;

const SignIn = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { trigger, loading } = useApiMutation();
  // const auth = useSelector((state) => state.auth);
  const token = useSelector((state) => state.auth.token);
  const finalUserImage = useFinalUserImage();
  if (token) {
    return <Navigate to="/home" replace />;
  }
  const onFinish = async (values) => {
    const { email, password } = values;

    const formData = new FormData();
    formData.append("username", email);
    formData.append("password", password);

    try {
      const res = await trigger({
        url: PANEL_LOGIN,
        method: "post",
        data: formData,
      });
      if (res.code == 200 && res.UserInfo?.token) {
        const { UserInfo, company_detils, company_image, version } = res;

        dispatch(
          setCredentials({
            token: UserInfo.token,
            tokenExpireAt: UserInfo.token_expires_at,
            user: UserInfo.user,
            userDetails: company_detils,
            userImage: company_image,
            version: version?.version_panel,
          })
        );

        navigate("/home");
      } else {
        message.error("Login Failed, Please check your credentials.");
      }
    } catch {
      message.error("An error occurred during login.");
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center ">
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 backdrop-blur-md p-6 m-4 overflow-hidden">
          {/* Left Side - Login Form */}
          <div className="flex flex-col justify-center px-6 py-8">
            <div className="text-center mb-6">
              <img
                src={finalUserImage || ""}
                alt="Logo"
                className="h-20 mx-auto"
              />
              <Title level={3} className="text-gray-800">
                Sign in to your account
              </Title>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              className="w-full"
              initialValues={{
                email: "",
                password: "",
              }}
              requiredMark={false}
            >
              <Form.Item
                label={
                  <span>
                    Mobile No <span className="text-red-500">*</span>
                  </span>
                }
                name="email"
                rules={[
                  { required: true, message: "Please enter your mobile no" },
                ]}
              >
                <Input
                  size="large"
                  placeholder="Enter  mobile no"
                  autoFocus
                  maxLength={10}
                />
              </Form.Item>

              <Form.Item
                label={
                  <span>
                    Password <span className="text-red-500">*</span>
                  </span>
                }
                name="password"
                rules={[
                  { required: true, message: "Please enter your password" },
                ]}
              >
                <Input.Password
                  size="large"
                  placeholder="Enter password"
                  maxLength={20}
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? "Checking..." : "Sign In"}
                </Button>
              </Form.Item>

              <div className="text-right">
                <Link
                  to="/forget-password"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </Form>
          </div>

          <div className="hidden md:flex items-center justify-center">
            <img
              src="https://img.freepik.com/free-vector/shop-with-sign-we-are-open_23-2148562563.jpg?ga=GA1.1.70886028.1749460191&semt=ais_hybrid&w=740"
              alt="Login Illustration"
              className="w-full h-full object-cover rounded-md"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default SignIn;

import { createContext, useEffect, useState } from "react";
import { verify } from "../../../services/api/auth";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { DNA } from "react-loader-spinner";
import { Avatar, Button, Layout, Menu, notification, theme } from 'antd';
const { Header, Sider, Content } = Layout;
import logo from '../../../assets/Logo-Hoc-Vien-Ky-Thuat-Mat-Ma-ACTVN-1.png';
import { MdDashboard, MdPeople, MdDeviceHub } from "react-icons/md";
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined
} from '@ant-design/icons';
import { deleteLocalStorage } from "../../../services/localStorage";
import { useDispatch } from "react-redux";
import { echoSet } from "../../../redux/actions/Echo";
import Echo from "laravel-echo";
import { FaAddressCard } from "react-icons/fa";

export const NotificationContext = createContext(null);

const PrivateLayout = () => {
    const [passThroughPrivate, setPassThroughPrivate] = useState(false);
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(true);
    const dispatch = useDispatch();
    const [api, contextHolder] = notification.useNotification();
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    const path = useLocation();

    const signOut = () => {
        deleteLocalStorage('token');
        navigate("/login");
    }

    const openNotificationWithIcon = (type, message, description) => {
        api[type]({
            message: message,
            description: description,
        });
    };

    useEffect(() => {
        (async () => {
            const response = await verify();
            if (response.message) navigate("/login");

            const echo = new Echo({
                broadcaster: 'reverb',
                key: import.meta.env.VITE_REVERB_APP_KEY,
                wsHost: import.meta.env.VITE_REVERB_HOST,
                wsPort: import.meta.env.VITE_REVERB_PORT,
                wssPort: import.meta.env.VITE_REVERB_PORT,
                forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
                enabledTransports: ['ws', 'wss'],
            });

            const channel = echo.channel('client').subscribed(() => console.log("subscribed client channel!"));

            dispatch(echoSet(channel));

            setPassThroughPrivate(true);
        })()
    }, []);

    return passThroughPrivate ? (
        <>
            {contextHolder}
            <Layout style={{ height: "100vh" }}>
                <Sider trigger={null} collapsible collapsed={collapsed} style={{
                    background: colorBgContainer,
                }}>
                    <div style={{ cursor: "pointer", height: 32, margin: 16, borderRadius: 6, display: "flex", justifyContent: "space-evenly", alignItems: "center" }} onClick={() => navigate("dashboard")}>
                        <Avatar src={<img src={logo} alt="avatar" />} size={40} />
                        {!collapsed && <span style={{ fontSize: 20, fontWeight: "bold" }}>Attendance</span>}
                    </div>
                    <Menu
                        theme="light"
                        mode="inline"
                        defaultSelectedKeys={[path.pathname]}
                        items={[
                            {
                                key: '/dashboard',
                                icon: <MdDashboard />,
                                label: 'Dashboard',
                                onClick: () => navigate("/dashboard")
                            },
                            {
                                key: '/attendance',
                                icon: <FaAddressCard />,
                                label: 'Attendance',
                                onClick: () => navigate("/attendance")
                            },
                            {
                                key: '/employee',
                                icon: <MdPeople />,
                                label: 'Employee',
                                onClick: () => navigate("/employee")
                            },
                            {
                                key: '/device',
                                icon: <MdDeviceHub />,
                                label: 'Device',
                                onClick: () => navigate("/device")
                            },
                        ]}
                    />
                </Sider>
                <Layout>
                    <Header
                        style={{
                            padding: 0,
                            background: colorBgContainer,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}
                    >
                        <Button
                            type="text"
                            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            onClick={() => setCollapsed(!collapsed)}
                            style={{
                                fontSize: '16px',
                                width: 64,
                                height: 64,
                            }}
                        />
                        <Button type="link" size="large" danger onClick={signOut}>Log out</Button>
                    </Header>
                    <Content
                        style={{
                            margin: '24px 16px',
                            padding: 24,
                            minHeight: 280,
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                        }}
                    >
                        <NotificationContext.Provider value={openNotificationWithIcon}>
                            <Outlet />
                        </NotificationContext.Provider>
                    </Content>
                </Layout>
            </Layout>
        </>
    ) : (
        <div style={{ height: "100vh", width: "100vw", backgroundColor: "white", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
            <DNA
                visible={true}
                height="80"
                width="80"
                ariaLabel="dna-loading"
                wrapperStyle={{}}
                wrapperClass="dna-wrapper"
            />
            <h3>Loading...</h3>
        </div>
    )
}

export default PrivateLayout;

import PrivateLayout from "../../components/layouts/PrivateLayout";
import PublicLayout from "../../components/layouts/PublicLayout";
import Attendance from "../../pages/Attendance";
import Dashboard from "../../pages/Dashboard";
import Device from "../../pages/Device";
import Employee from "../../pages/Employee";
import Login from "../../pages/Login";

export const configRouters = [
    {
        element: <PublicLayout />,
        children: [
            {
                path: "login",
                element: <Login />
            }
        ],
    },
    {
        element: <PrivateLayout />,
        children: [
            {
                path: "dashboard",
                element: <Dashboard />
            },
            {
                path: "employee",
                element: <Employee />
            },
            {
                path: "device",
                element: <Device />
            },
            {
                path: "attendance",
                element: <Attendance />
            },
        ]
    }
]

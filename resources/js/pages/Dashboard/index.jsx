import { useEffect, useState } from "react";
import { dashboard } from "../../services/api/auth";
import { Card, Descriptions, Space, Statistic, Table } from "antd";
import { MdPeople, MdDevices } from "react-icons/md";
import { Column } from "@ant-design/plots";
import { formatDate } from "../../helpers/time";
import { useSelector } from "react-redux";

const Dashboard = () => {
    const [dashboardInfo, setDashboardInfo] = useState({ employees: '...', devices: '...', chart: [], lastCard: [], table: [] });
    const [loading, setLoading] = useState(true);
    const [secondLoading, setSecondLoading] = useState(true);
    const echo = useSelector(state => state.echo);

    const chartConfig = {
        data: dashboardInfo.chart,
        xField: 'date',
        yField: 'people',
        label: {
            textBaseline: 'bottom',
        },
        style: {
            radiusTopLeft: 10,
            radiusTopRight: 10,
        },
    };

    const col = [
        {
            title: "Employee Name",
            dataIndex: "employeeName",
            key: "employeeName",
        },
        {
            title: "Card ID",
            dataIndex: "cardId",
            key: "cardId",
        },
        {
            title: "Device In",
            dataIndex: "deviceIn",
            key: "deviceIn",
        },
        {
            title: "Time In",
            dataIndex: "checkIn",
            key: "checkIn"
        },
        {
            title: "Device Out",
            dataIndex: "deviceOut",
            key: "deviceOut",
        },
        {
            title: "Time Out",
            dataIndex: "checkOut",
            key: "checkOut",
            render: (value) => value ? value : "--"
        },
    ];

    useEffect(() => {
        (async () => {
            const response = await dashboard();
            if (!response.message) {
                response.success.lastCard[2].children = formatDate(response.success.lastCard[2].children);
                setDashboardInfo(response.success);
            }
            setLoading(false);
            setSecondLoading(false);
        })()
    }, []);

    useEffect(() => {
        echo.listen('.some.one.attendance', () => {
            (async () => {
                setLoading(true);
                setSecondLoading(true);
                const response = await dashboard();
                if (!response.message) {
                    response.success.lastCard[2].children = formatDate(response.success.lastCard[2].children);
                    setDashboardInfo(response.success);
                }
                setLoading(false);
                setSecondLoading(false);
            })()
        });

        return () => {
            echo.stopListening('.some.one.attendance');
        };
    }, []);

    return (
        <>
            <Space size={"middle"} wrap align="start">
                <Space size={"middle"} direction="vertical">
                    <Card>
                        <Statistic
                            title="Employees"
                            loading={loading}
                            value={dashboardInfo.employees}
                            valueStyle={{ fontWeight: "bold" }}
                            prefix={<MdPeople />}
                        />
                    </Card>
                    <Card>
                        <Statistic
                            title="Devices"
                            loading={loading}
                            value={dashboardInfo.devices}
                            valueStyle={{ fontWeight: "bold" }}
                            prefix={<MdDevices />}
                        />
                    </Card>
                </Space>
                <Card title="Number of people working in the last 7 days" style={{ width: 805, height: 243 }} >
                    <Column {...chartConfig} height={170} width={780} autoFit={false} />
                </Card>
                <Card title="Nearest scanned card" style={{ width: 805, height: 243 }}>
                    <Descriptions layout="vertical" items={dashboardInfo.lastCard} />
                </Card>
            </Space>
            <Table title={() => <span style={{ fontSize: 18 }}><b>10 most recent timekeeping times</b></span>} size="small" pagination={false} loading={secondLoading} bordered columns={col} dataSource={dashboardInfo.table} style={{ marginTop: "15px" }} />
        </>
    )
}

export default Dashboard;

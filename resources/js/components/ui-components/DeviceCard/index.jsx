import { Avatar, Badge, Button, Card, Popconfirm, Space, Switch } from "antd";
import esp32 from '../../../assets/NODEMCU-ESP32-800x800.jpg';
import { formatDate } from "../../../helpers/time";
import { useContext, useState } from "react";
import { deleteDevice, updateDevice } from "../../../services/api/device";
import { NotificationContext } from "../../layouts/PrivateLayout";

const statusBadge = (status, name) => {
    if (status == null) return <Badge status="warning" text={<h3 style={{ display: "inline-block" }}>{name}</h3>} />
    if (status == "available") return <Badge status="processing" text={<h3 style={{ display: "inline-block", marginLeft: 10 }}>{name}</h3>} color="#52c41a" />
    if (status == "unavailable") return <Badge status="error" text={<h3 style={{ display: "inline-block" }}>{name}</h3>} />
    return <Badge status="default" text={<h3 style={{ display: "inline-block" }}>{name}</h3>} />
}

const DeviceCard = ({ deviceInfo, setListDevice }) => {
    const [loading, setLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const openNotificationWithIcon = useContext(NotificationContext);

    const handleDeleteDevice = async () => {
        setDeleteLoading(true);
        const response = await deleteDevice(deviceInfo.id);
        if (response.message) openNotificationWithIcon('error', response.statusCode, response.message);
        else {
            openNotificationWithIcon('success', "Success", "Delete the device successful!");
            setListDevice((prevList) => prevList.filter(i => i.id != deviceInfo.id));
        }
        setDeleteLoading(false);
    }

    const handleStateChange = async (e) => {
        setLoading(true);
        const response = await updateDevice(deviceInfo.id, e ? "available" : "unavailable");
        if (response.message) openNotificationWithIcon('error', response.statusCode, response.message);
        else openNotificationWithIcon("success", "Success", "Change state of device successful!");
        setLoading(false);
    }

    return (
        <Card title={
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {statusBadge(deviceInfo.state, deviceInfo.name)}
                <Space size={"middle"}>
                    {(deviceInfo.state == "available" || deviceInfo.state == "unavailable") && <Switch loading={loading} defaultChecked={deviceInfo.state == "available"} onChange={handleStateChange} />}
                    <Popconfirm title="Delete this device" description="Are you sure to delete this device?" onConfirm={handleDeleteDevice}>
                        <Button danger type="primary" loading={deleteLoading}>Del</Button>
                    </Popconfirm>
                </Space>
            </div>
        } style={{ backgroundColor: (deviceInfo.state == null || deviceInfo.state == "disabled") ? "#cccccc" : "white" }}>
            <div style={{ display: "flex", justifyContent: "space-evenly", alignItems: "center" }}>
                <Avatar size={{ xs: 24, sm: 32, md: 40, lg: 64, xl: 80, xxl: 100 }} alt="Device" shape="square" src={esp32} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexDirection: "column" }}>
                    <div>
                        <p><b>Uuid: </b>{deviceInfo.id}</p>
                        <p><b>Created at: </b>{formatDate(deviceInfo.created_at)}</p>
                    </div>
                </div>
            </div>
        </Card>
    )
}

export default DeviceCard;

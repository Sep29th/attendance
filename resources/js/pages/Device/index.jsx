import { useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { createDevice, getListDevice, sendStateEvent } from "../../services/api/device";
import { Badge, Button, Col, ConfigProvider, Divider, Form, Input, Modal, Row, Space } from "antd";
import { MdAdd } from "react-icons/md"
import { DNA } from "react-loader-spinner";
import DeviceCard from "../../components/ui-components/DeviceCard";
import { FaBarcode } from "react-icons/fa6";
import { MdDriveFileRenameOutline } from "react-icons/md";
import { NotificationContext } from "../../components/layouts/PrivateLayout";

const Device = () => {
    const echo = useSelector(state => state.echo);
    const [listDevice, setListDevice] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [modalAddMessage, setModalAddMessage] = useState('');
    const [formAdd] = Form.useForm(null);
    const openNotificationWithIcon = useContext(NotificationContext);

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = async () => {
        setConfirmLoading(true);
        const id = formAdd.getFieldValue("id");
        const name = formAdd.getFieldValue("name");
        const response = await createDevice(id, name);
        if (response.message) setModalAddMessage(response.message);
        else {
            formAdd.resetFields();
            setListDevice((prevList) => [response.success, ...prevList])
            openNotificationWithIcon("success", "Success", "Add device successful!");
        }
        setConfirmLoading(false);
    };

    const handleCancel = () => {
        formAdd.resetFields();
        setIsModalOpen(false);
    };

    useEffect(() => {
        let intervalID = false;
        let timeoutObject = {};
        (async () => {
            const response = await getListDevice();
            if (response.message) console.log("something went wrong!");
            else {
                setListDevice(response.success.map(item => {
                    return { ...item, state: item.state == null ? null : "disabled" }
                }).reverse());
                echo.listen('.get.current.state.device', (payload) => {
                    if (timeoutObject[payload.id]) clearTimeout(timeoutObject[payload.id]);
                    timeoutObject[payload.id] = setTimeout(() => {
                        setListDevice((prevList) => prevList.map(item => {
                            return { ...item, state: "disabled" }
                        }))
                    }, 12000);
                    setListDevice((prevList) => prevList.map(item => {
                        if (item.id == payload.id) return { ...item, state: payload.state }
                        return item;
                    }))
                });
                sendStateEvent();
                intervalID = setInterval(() => {
                    sendStateEvent();
                }, 5000);
            };
        })();
        return () => {
            if (intervalID) clearInterval(intervalID);
            echo.stopListening('.get.current.state.device');
            Object.keys(timeoutObject).forEach((k) => {
                clearTimeout(timeoutObject[k]);
            })
        }
    }, []);

    return (
        <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Space>
                    <Badge status="processing" text="Available" color="#52c41a" />
                    <Badge status="error" text="Unavailable" />
                    <Badge status="default" text="Disabled" />
                    <Badge status="warning" text="Not connected for the first time" />
                </Space>
                <Button type="primary" size="large" icon={<MdAdd />} onClick={showModal}>Add</Button>
            </div>
            <Divider orientation="left">Devices:</Divider>
            {listDevice ? (
                <>{listDevice.length > 0 ? (
                    <ConfigProvider
                        theme={{
                            components: {
                                Badge: {
                                    dotSize: 15,
                                    statusSize: 15
                                },
                            },
                        }}
                    >
                        <Row gutter={16}>
                            {listDevice.map((item) => <Col span={8}><DeviceCard deviceInfo={item} setListDevice={setListDevice} /></Col>)}
                        </Row>
                    </ConfigProvider>
                ) : (
                    <div style={{ height: "75%", backgroundColor: "white", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
                        <h2>No devices yet!</h2>
                    </div>
                )}</>
            ) : (
                <div style={{ height: "75%", backgroundColor: "white", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
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
            )}
            <Modal title="Add device" confirmLoading={confirmLoading} open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
                <Form form={formAdd} layout="vertical">
                    <Form.Item label="UUID:" name={"id"} rules={[{ required: true, message: "You have to fill uuid" }, { pattern: /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/, message: "Enter the correct UUID format" }]}>
                        <Input addonBefore={<FaBarcode />} size="large" />
                    </Form.Item>
                    <Form.Item label="Name:" name={"name"} rules={[{ required: true, message: "You have to fill name" }, { max: 25, message: "Name have max 25 characters" }, { min: 5, message: "Name have min 5 characters" }]}>
                        <Input addonBefore={<MdDriveFileRenameOutline />} size="large" />
                    </Form.Item>
                    <span style={{ color: '#ff4d4f' }}>{modalAddMessage}</span>
                </Form>
            </Modal>
        </>
    )
}

export default Device;

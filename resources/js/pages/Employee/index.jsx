import { SearchOutlined } from "@ant-design/icons";
import { Avatar, Badge, Button, Divider, Form, Input, Modal, Popconfirm, Select, Space, Switch, Table } from "antd";
import { useContext, useEffect, useRef, useState } from "react";
import { MdAdd, MdDriveFileRenameOutline } from "react-icons/md";
import { useSelector } from "react-redux";
import { NotificationContext } from "../../components/layouts/PrivateLayout";
import Highlighter from 'react-highlight-words';
import { createEmployee, deleteEmployee, getAllEmployee, scanCardId, updateEmployee } from "../../services/api/employee";
import { FaBarcode, FaRegTrashAlt } from "react-icons/fa";
import { formatDate } from "../../helpers/time";
import { LuPencilLine } from "react-icons/lu";
import { getListDeviceWithState } from "../../services/api/device";
import esp32 from "../../assets/NODEMCU-ESP32-800x800.jpg";

const SwitchActiveEmployee = ({ stateValue, record, setListEmployee }) => {
    const [loading, setLoading] = useState(false);
    const [checked, setChecked] = useState(stateValue == 1)
    const openNotificationWithIcon = useContext(NotificationContext);

    const handleStateChange = async () => {
        setLoading(true);
        const response = await updateEmployee({ ...record, state: !record.state });
        if (response.message) {
            openNotificationWithIcon('error', 'Update failed!', 'Update state for card failed!');
        } else {
            setListEmployee(prevList => prevList.map(i => {
                if (i.id == record.id) return response.success;
                return i;
            }));
            openNotificationWithIcon('success', 'Update successfully!', 'Update state for card successfully!');
            setChecked(prevValue => !prevValue);
        }
        setLoading(false);
    };

    return <Switch defaultChecked={stateValue == 1} checked={checked} loading={loading} onChange={handleStateChange} />
}

const Employee = () => {
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);
    const echo = useSelector(state => state.echo);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const openNotificationWithIcon = useContext(NotificationContext);
    const [listEmployee, setListEmployee] = useState([]);
    const [modalAddMessage, setModalAddMessage] = useState('');
    const [formAdd] = Form.useForm(null);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [listAvailableDevice, setListAvailableDevice] = useState([]);
    const [create, setCreate] = useState(null);
    const [focusEmployee, setFocusEmployee] = useState(null);

    const handleOk = async () => {
        setConfirmLoading(true);
        const response = create ? await createEmployee({ name: formAdd.getFieldValue("name"), cardId: formAdd.getFieldValue("id") }) : await updateEmployee({ id: focusEmployee.id, state: focusEmployee.state, name: formAdd.getFieldValue("name"), cardId: formAdd.getFieldValue("id") });
        if (response.message) openNotificationWithIcon('error', response.statusCode, response.message);
        else openNotificationWithIcon('success', 'Successfully!', 'Update employee successfully!');
        formAdd.resetFields();
        if (create) setListEmployee((prevList) => [response.success, ...prevList]);
        else setListEmployee((prevList) => prevList.map(i => i.id == response.success.id ? response.success : i));
        setConfirmLoading(false);
    }

    const handleCancel = () => {
        formAdd.resetFields();
        setIsModalOpen(false);
    }

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };
    const handleReset = (clearFilters) => {
        clearFilters();
        setSearchText('');
    };
    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
            <div
                style={{
                    padding: 8,
                }}
                onKeyDown={(e) => e.stopPropagation()}
            >
                <Input
                    ref={searchInput}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{
                        marginBottom: 8,
                        display: 'block',
                    }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{
                            width: 90,
                        }}
                    >
                        Search
                    </Button>
                    <Button
                        onClick={() => clearFilters && handleReset(clearFilters)}
                        size="small"
                        style={{
                            width: 90,
                        }}
                    >
                        Reset
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            confirm({
                                closeDropdown: false,
                            });
                            setSearchText(selectedKeys[0]);
                            setSearchedColumn(dataIndex);
                        }}
                    >
                        Filter
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            close();
                        }}
                    >
                        close
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => (
            <SearchOutlined
                style={{
                    color: filtered ? '#1677ff' : undefined,
                }}
            />
        ),
        onFilter: (value, record) =>
            record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
        onFilterDropdownOpenChange: (visible) => {
            if (visible) {
                setTimeout(() => searchInput.current?.select(), 100);
            }
        },
        render: (text) =>
            searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{
                        backgroundColor: '#ffc069',
                        padding: 0,
                    }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : (
                text
            ),
    });
    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            ...getColumnSearchProps('name'),
        },
        {
            title: 'Card ID',
            dataIndex: 'cardId',
            key: 'cardId',
            ...getColumnSearchProps('cardId'),
        },
        {
            title: 'State',
            dataIndex: 'state',
            key: 'state',
            align: 'right',
            render: (stateValue, record) => <SwitchActiveEmployee stateValue={stateValue} record={record} setListEmployee={setListEmployee} />
        },
        {
            title: 'Created At',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (item) => formatDate(item)
        },
        {
            title: 'Last Update',
            dataIndex: 'updated_at',
            key: 'updated_at',
            render: (item) => formatDate(item)
        },
        {
            title: 'Actions',
            align: 'right',
            render: (item) => {
                return (
                    <>
                        <Space>
                            <Button icon={<LuPencilLine />} onClick={() => {
                                formAdd.setFieldValue("id", item.cardId);
                                formAdd.setFieldValue("name", item.name);
                                setFocusEmployee(item);
                                setCreate(false);
                                showModal();
                            }} />
                            <Popconfirm
                                title="Delete this employee"
                                description="Are you sure to delete this employee?"
                                onConfirm={async () => {
                                    await deleteEmployee(item.id);
                                    setListEmployee(prevList => prevList.filter(i => i.id != item.id));
                                    openNotificationWithIcon('success', 'Delete successfully!', 'Delete employee successfully!');
                                }}
                                onCancel={() => { }}
                                okText="Yes"
                                cancelText="No"
                            >
                                <Button danger icon={<FaRegTrashAlt />} />
                            </Popconfirm>
                        </Space>
                    </>
                )
            }
        },
    ];

    useEffect(() => {
        (async () => {
            echo.listen(".scan.card.id.result", (payload) => {
                console.log(payload);
                formAdd.setFieldValue("id", payload.cardId);
            });
            const response = await getAllEmployee();
            setListEmployee(() => response.success);
            const res = await getListDeviceWithState("available");
            setListAvailableDevice(() => res.success.map(i => {
                return { ...i, value: i.id, label: i.name }
            }));
        })()
        return () => {
            echo.stopListening('.scan.card.id.result');
        }
    }, []);

    return (
        <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div></div>
                <Button type="primary" size="large" icon={<MdAdd />} onClick={() => { setCreate(true); showModal(); }}>Add</Button>
            </div>
            <Divider orientation="left">Employees:</Divider>
            <Table size="small" bordered columns={columns} dataSource={listEmployee} />
            <Modal title="Add Employee" confirmLoading={confirmLoading} open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
                <Form form={formAdd} layout="vertical">
                    <Form.Item label="Select Availabled Devices:" name={"device"}>
                        <Select
                            optionRender={(a) => <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <Space>
                                    <Avatar size={"large"} shape="square" src={esp32} />
                                    <div>
                                        <p style={{ margin: "5px 0" }}><b>{a.label}</b></p>
                                        <span>{a.value}</span>
                                    </div>
                                </Space>
                                <Badge status="processing" color="#52c41a" style={{ marginRight: 10 }} />
                            </div>}
                            size="large"
                            showSearch
                            placeholder="Select..."
                            optionFilterProp="label"
                            onChange={(a) => { scanCardId(a) }}
                            options={listAvailableDevice}
                        />
                    </Form.Item>
                    <Form.Item label="Card ID:" name={"id"}>
                        <Input addonBefore={<FaBarcode />} size="large" disabled />
                    </Form.Item>
                    <Form.Item label="Name:" name={"name"}>
                        <Input addonBefore={<MdDriveFileRenameOutline />} size="large" />
                    </Form.Item>
                    <span style={{ color: '#ff4d4f' }}>{modalAddMessage}</span>
                </Form>
            </Modal>
        </>
    );
}

export default Employee;

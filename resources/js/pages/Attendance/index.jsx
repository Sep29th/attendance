import { Button, Col, Divider, Row, Table, DatePicker, Form, Input, Space } from "antd";
import { useContext, useEffect, useRef, useState } from "react";
const { RangePicker } = DatePicker;
import { MdContentPasteSearch } from "react-icons/md";
import { getListAttendance, getListCalculateMerit } from "../../services/api/attendance";
import { SearchOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import { MdDone } from "react-icons/md";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import ExcelJS from 'exceljs';
import FileSaver from "file-saver";
import { RiFileExcel2Line } from "react-icons/ri";
import { formatDate } from "../../helpers/time";
import { NotificationContext } from "../../components/layouts/PrivateLayout";

const CalculateMeritPart = ({ tempState }) => {
    const [loading, setLoading] = useState(true);
    const [listCalculateMerit, setListCalculateMerit] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);
    const [dateValue, setDateValue] = useState(dayjs());
    const openNotificationWithIcon = useContext(NotificationContext);

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

    const handleDateChange = async (e) => {
        setLoading(true);
        const response = await getListCalculateMerit(`month=${e.$M + 1}&year=${e.$y}`);
        setListCalculateMerit(response.success);
        setDateValue(e);
        setLoading(false);
    }

    const col = [
        {
            title: "Employee Name",
            dataIndex: "employeeName",
            key: "employeeName",
            ...getColumnSearchProps("employeeName")
        },
        {
            title: "Card ID",
            dataIndex: "cardId",
            key: "cardId",
            ...getColumnSearchProps('cardId'),
        },
        {
            title: "State",
            dataIndex: "state",
            key: "state",
            render: (item) => item == 1 ? <MdDone /> : ""
        },
        {
            title: "Number Of Working Hours",
            dataIndex: "workingHour",
            key: "workingHour",
            filterIcon: (filtered) => (
                <SearchOutlined
                    style={{
                        color: filtered ? '#1677ff' : undefined,
                    }}
                />
            ),
            filterDropdown: () => (
                <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
                    <DatePicker onChange={handleDateChange} picker="month" value={dateValue} />
                </div>

            ),

        }
    ];

    const onClickExportExcel = async () => {
        if (listCalculateMerit.length > 0) {
            const wb = new ExcelJS.Workbook();
            const ws = wb.addWorksheet('Working Hour');
            ws.getColumn('A').width = 5;
            ws.getColumn('B').width = 20;
            ws.getColumn('C').width = 20;
            ws.getColumn('D').width = 20;
            ws.mergeCells('A1:D2');
            ws.getCell('A1').value = 'Tính giờ công';
            ws.getCell('A1').font = { size: 20, name: 'Liberation Serif', bold: true };
            ws.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
            ws.mergeCells('A3:D3');
            ws.mergeCells('D4:D5');
            ws.mergeCells('A6:D6');

            let cols = ['A', 'B', 'C', 'D'];
            let colsName = ['STT', 'Id Card', 'Họ và tên', 'Số giờ công'];
            let configHeadTable = { bold: true, italic: true, size: 13, name: 'Liberation Serif' };
            let rowStartTable = 7;
            let headerAlignment = { vertical: 'middle', horizontal: 'right' };
            let configBorderHeader = {
                top: { style: 'double' },
                left: { style: 'double' },
                bottom: { style: 'double' },
                right: { style: 'double' }
            };
            cols.forEach((item, index) => {
                ws.mergeCells(`${item}${rowStartTable}:${item}${rowStartTable + 1}`);
                let targetCol = ws.getCell(item + rowStartTable);
                targetCol.value = colsName[index];
                targetCol.font = configHeadTable;
                targetCol.alignment = headerAlignment;
                targetCol.border = configBorderHeader;
            });

            let configDataTable = { size: 11, name: 'Liberation Serif' };
            let rowStartDataTable = 9;
            let dataAlignment = { vertical: 'middle', horizontal: 'right' };
            let configBorderData = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };

            listCalculateMerit.forEach((dataItem, dataIndex) => {
                cols.forEach((colItem, colIndex) => {
                    let target = ws.getCell(colItem + (rowStartDataTable + dataIndex));
                    if (colIndex == 0) target.font = { ...configDataTable, bold: true, size: 12 };
                    else target.font = configDataTable;
                    target.alignment = dataAlignment;
                    target.border = configBorderData;
                    if (colIndex == 0) target.value = dataIndex + 1;
                    else if (colIndex == 1) target.value = dataItem.cardId;
                    else if (colIndex == 2) target.value = dataItem.employeeName;
                    else target.value = dataItem.workingHour;
                })
            });

            wb.xlsx.writeBuffer().then(function (buffer) {
                var blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
                FileSaver.saveAs(blob, 'WorkingHour.xlsx');
            });
        } else {
            openNotificationWithIcon("error", "Error!", "The data you want to export is empty!");
        }
    }

    useEffect(() => {
        (async () => {
            setLoading(true);
            const response = await getListCalculateMerit(`month=${dateValue.$M + 1}&year=${dateValue.$y}`);
            setListCalculateMerit(response.success);
            setLoading(false);
        })()
    }, [tempState])

    return (
        <>
            <div style={{ display: "flex", justifyContent: "end", marginBottom: 15 }}><Button size="large" type="primary" icon={<RiFileExcel2Line />} onClick={onClickExportExcel} style={{ backgroundColor: "green" }}>Excel</Button></div>
            <Table pagination={false} loading={loading} size="small" bordered columns={col} dataSource={listCalculateMerit} />
        </>
    )
}

const AttendancePart = ({ tempState }) => {
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const [listAttendance, setListAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [checkInValue, setCheckInValue] = useState(null);
    const [checkOutValue, setCheckOutValue] = useState(null);
    const searchInput = useRef(null);
    const openNotificationWithIcon = useContext(NotificationContext);

    const onClickExportExcel = async () => {
        if (listAttendance.length > 0) {
            const wb = new ExcelJS.Workbook();
            const ws = wb.addWorksheet('History Attendance');
            ws.getColumn('A').width = 5;
            ws.getColumn('B').width = 20;
            ws.getColumn('C').width = 20;
            ws.getColumn('D').width = 30;
            ws.getColumn('E').width = 30;
            ws.mergeCells('A1:E2');
            ws.getCell('A1').value = 'Lịch sử chấm công';
            ws.getCell('A1').font = { size: 20, name: 'Liberation Serif', bold: true };
            ws.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
            ws.mergeCells('A4:C4');
            ws.mergeCells('A5:C5');
            ws.mergeCells('A3:E3');
            ws.mergeCells('D4:E5');
            ws.mergeCells('A6:E6');
            ws.getCell('A4').alignment = { vertical: 'middle', horizontal: 'right' };
            ws.getCell('A5').alignment = { vertical: 'middle', horizontal: 'right' };
            ws.getCell('A4').font = { bold: true, size: 14, name: 'Liberation Serif' };
            ws.getCell('A5').font = { bold: true, size: 14, name: 'Liberation Serif' };

            let cols = ['A', 'B', 'C', 'D', 'E'];
            let colsName = ['STT', 'Id Card', 'Họ và tên', 'Thời gian vào', 'Thời gian ra'];
            let configHeadTable = { bold: true, italic: true, size: 13, name: 'Liberation Serif' };
            let rowStartTable = 7;
            let headerAlignment = { vertical: 'middle', horizontal: 'right' };
            let configBorderHeader = {
                top: { style: 'double' },
                left: { style: 'double' },
                bottom: { style: 'double' },
                right: { style: 'double' }
            };
            cols.forEach((item, index) => {
                ws.mergeCells(`${item}${rowStartTable}:${item}${rowStartTable + 1}`);
                let targetCol = ws.getCell(item + rowStartTable);
                targetCol.value = colsName[index];
                targetCol.font = configHeadTable;
                targetCol.alignment = headerAlignment;
                targetCol.border = configBorderHeader;
            });

            let configDataTable = { size: 11, name: 'Liberation Serif' };
            let rowStartDataTable = 9;
            let dataAlignment = { vertical: 'middle', horizontal: 'right' };
            let configBorderData = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };

            listAttendance.forEach((dataItem, dataIndex) => {
                cols.forEach((colItem, colIndex) => {
                    let target = ws.getCell(colItem + (rowStartDataTable + dataIndex));
                    if (colIndex == 0) target.font = { ...configDataTable, bold: true, size: 12 };
                    else target.font = configDataTable;
                    target.alignment = dataAlignment;
                    target.border = configBorderData;
                    if (colIndex == 0) target.value = dataIndex + 1;
                    else if (colIndex == 1) target.value = dataItem.cardId;
                    else if (colIndex == 2) target.value = dataItem.employeeName;
                    else if (colIndex == 3) target.value = formatDate(dataItem.checkIn);
                    else target.value = dataItem.checkOut ? formatDate(dataItem.checkOut) : "";
                })
            });

            wb.xlsx.writeBuffer().then(function (buffer) {
                var blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
                FileSaver.saveAs(blob, 'HistoryAttendance.xlsx');
            });
        } else {
            openNotificationWithIcon("error", "Error!", "The data you want to export is empty!");
        }
    }

    const handleSubmit = async (a) => {
        setLoading(true);
        let param = '';
        if (a.checkIn) param += `checkInStart=${a.checkIn[0].$d.toISOString()}&checkInEnd=${a.checkIn[1].$d.toISOString()}&`;
        if (a.checkOut) param += `checkOutStart=${a.checkOut[0].$d.toISOString()}&checkOutEnd=${a.checkOut[1].$d.toISOString()}`;
        const response = await getListAttendance(param);
        setListAttendance(response.success);
        setLoading(false);
    }

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

    const col = [
        {
            title: "Employee Name",
            dataIndex: "employeeName",
            key: "employeeName",
            ...getColumnSearchProps('employeeName'),
        },
        {
            title: "Card ID",
            dataIndex: "cardId",
            key: "cardId",
            ...getColumnSearchProps('cardId'),
        },
        {
            title: "Device In",
            dataIndex: "deviceIn",
            key: "deviceIn",
            ...getColumnSearchProps('deviceIn'),
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
            ...getColumnSearchProps('deviceOut'),
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
            setLoading(true);
            let param = '';
            if (checkInValue) param += `checkInStart=${checkInValue[0].$d.toISOString()}&checkInEnd=${checkInValue[1].$d.toISOString()}&`;
            if (checkOutValue) param += `checkOutStart=${checkOutValue[0].$d.toISOString()}&checkOutEnd=${checkOutValue[1].$d.toISOString()}`;
            const response = await getListAttendance(param);
            setListAttendance(response.success);
            setLoading(false);
        })()
    }, [tempState]);

    return (
        <>
            <Form layout="vertical" onFinish={handleSubmit}>
                <Form.Item label="Check in:" name={"checkIn"}>
                    <RangePicker showTime size="large" value={checkInValue} onChange={i => setCheckInValue(i)} />
                </Form.Item>
                <div style={{ display: "flex", alignItems: "end", gap: 15 }}>
                    <Form.Item label="Check out:" name={"checkOut"}>
                        <RangePicker showTime size="large" value={checkOutValue} onChange={i => setCheckOutValue(i)} />
                    </Form.Item>
                    <Form.Item>
                        <Button htmlType="submit" size="large" type="primary" icon={<MdContentPasteSearch />}>Filter</Button>
                    </Form.Item>
                    <Form.Item>
                        <Button size="large" type="primary" icon={<RiFileExcel2Line />} onClick={onClickExportExcel} style={{ backgroundColor: "green" }}>Excel</Button>
                    </Form.Item>
                </div>
            </Form>
            <Table scroll={{ y: 500 }} pagination={false} loading={loading} size="small" bordered columns={col} dataSource={listAttendance} />
        </>
    )
}

const Attendance = () => {
    const [tempState, setTempState] = useState(false);
    const echo = useSelector(state => state.echo);

    useEffect(() => {
        (async () => {
            echo.listen('.some.one.attendance', () => {
                setTempState(prevState => !prevState);
            });
        })()
        return () => {
            echo.stopListening('.some.one.attendance');
        }
    }, []);

    return (
        <Row gutter={[15, 15]}>
            <Col span={12}>
                <Divider orientation="left">Attendance:</Divider>
                <AttendancePart tempState={tempState} />
            </Col>
            <Col span={12}>
                <Divider orientation="right">Calculate merit:</Divider>
                <CalculateMeritPart tempState={tempState} />
            </Col>
        </Row>
    )
}

export default Attendance;

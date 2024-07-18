import {
    LockOutlined,
    UserOutlined,
} from '@ant-design/icons';
import {
    LoginFormPage,
    ProFormText,
} from '@ant-design/pro-components';
import { Form, Tabs, theme } from 'antd';
import logo from '../../assets/Logo-Hoc-Vien-Ky-Thuat-Mat-Ma-ACTVN-1.png'
import { useState } from 'react';
import { login } from '../../services/api/auth';
import { setLocalStorage } from '../../services/localStorage';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const { token } = theme.useToken();
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [spanText, setSpanText] = useState('');
    const navigate = useNavigate();
    return (
        <div style={{ backgroundColor: 'white', height: '100vh' }}>
            <LoginFormPage
                submitter={{
                    searchConfig: {
                        submitText: 'Sign in',
                    },
                    submitButtonProps: {
                        loading: loading
                    },
                    onSubmit: async () => {
                        setLoading(true);
                        const response = await login({ username: form.getFieldValue('username'), password: form.getFieldValue('password') });
                        if(response.message) {
                            setSpanText(response.message);
                        } else {
                            setLocalStorage('token', response.success.token);
                            navigate("/dashboard");
                        }
                        setLoading(false);
                    }
                }}
                form={form}
                logo={logo}
                backgroundVideoUrl={`${import.meta.env.VITE_APP_URL}/storage/backgroundvideo.mp4`}
                title="Attendance"
                containerStyle={{
                    backgroundColor: '#ffffff',
                    backdropFilter: 'blur(4px)',
                    color: 'white'
                }}
                subTitle="Manage RFID time attendance system"
                actions={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}></div>}
            >
                <Tabs centered activeKey={'account'}>
                    <Tabs.TabPane key={'account'} tab={'Account'} />
                </Tabs>
                <>
                    <ProFormText
                        name="username"
                        fieldProps={{
                            size: 'large',
                            prefix: (
                                <UserOutlined
                                    style={{
                                        color: token.colorText,
                                    }}
                                    className={'prefixIcon'}
                                />
                            ),
                            onInput: () => setSpanText('')
                        }}
                        placeholder={'Username'}
                        rules={[
                            {
                                required: true,
                                message: 'Must fill in username!',
                            },
                            {
                                min: 8,
                                message: 'Minimum username length is 8'
                            },
                            {
                                max: 30,
                                message: 'Maximum username length is 30'
                            }
                        ]}
                    />
                    <ProFormText.Password
                        name="password"
                        fieldProps={{
                            size: 'large',
                            prefix: (
                                <LockOutlined
                                    style={{
                                        color: token.colorText,
                                    }}
                                    className={'prefixIcon'}
                                />
                            ),
                            onInput: () => setSpanText('')
                        }}
                        placeholder={'Password'}
                        rules={[
                            {
                                required: true,
                                message: 'Must fill in password！',
                            },
                            {
                                min: 8,
                                message: 'Minimum password length is 8'
                            },
                            {
                                max: 30,
                                message: 'Maximum password length is 30'
                            }
                        ]}
                    />
                </>
                <span style={{ color: '#ff4d4f' }}>{spanText}</span>
            </LoginFormPage>
        </div>
    );
}

export default Login

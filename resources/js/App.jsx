import { ConfigProvider } from 'antd';
import './App.css'
import AllRouters from "./routers/all-routers";

function App() {
    return (
        <ConfigProvider
            theme={{
                components: {
                    Badge: {
                        dotSize: 10,
                        statusSize: 10
                    },
                },
            }}
        >
            <AllRouters />
        </ConfigProvider>
    )
}

export default App

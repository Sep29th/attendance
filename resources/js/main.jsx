import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import { allReducer } from "./redux/reducers";
import { Provider } from "react-redux";
import Pusher from 'pusher-js';
window.Pusher = Pusher;

const store = configureStore({ reducer: allReducer })
ReactDOM.createRoot(document.getElementById('root')).render(
    <Provider store={store}>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </Provider>
)

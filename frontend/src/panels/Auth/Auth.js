import React from "react";
import './Auth.css'
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import backgroundImg from '../../img/background.jpeg'
import Login from "../Login/Login";
import Registration from "../Registration/Registration";

class Auth extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            message: '',
            type: 'login',
        }
    }

    componentDidMount() {
        document.title = "Авторизация / Регистрация"
    }

    render() {
        return <div className='auth-content' style={{
            opacity: '0.7',
            backgroundImage: `url(${backgroundImg})`,
            height: '100vh',
            backgroundSize: 'cover'
        }}>
            <div style={{padding: '5px 20px 20px 20px'}}>
                <div className='auth-form'>
                    <div style={{display: 'flex', paddingBottom: '10px'}}>
                        <div style={{
                            padding: '5px',
                            borderBottom: this.state.type === 'login' ? '2px solid black' : null,
                            marginRight: '5px',
                            cursor: 'pointer'
                        }} onClick={() => {
                            this.setState({
                                type: 'login'
                            })
                        }}>
                            Авторизация
                        </div>
                        <div style={{
                            padding: '5px',
                            borderBottom: this.state.type === 'register' ? '2px solid black' : null,
                            cursor: 'pointer'
                        }} onClick={() => {
                            this.setState({
                                type: 'register'
                            })
                        }}>
                            Регистрация
                        </div>
                    </div>
                    {this.state.type === 'login' ?
                    <Login auth={this.props.auth} setToken={this.props.setToken}/> : null}
                    {this.state.type === 'register'
                        ? <Registration
                            register={this.props.register}
                            imageUpload={this.props.imageUpload}
                            setToken={this.props.setToken}/>
                            : null}
                </div>
            </div>
        </div>
    }
}

export default Auth
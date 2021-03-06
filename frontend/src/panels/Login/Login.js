import React from "react";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";

export default class Login extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            data: {
                username: '',
                password: '',
            },
            message: '',
            valueChecker: {
                username: true,
                password: true
            }
        }
    }

    handleChange = (event) => {
        const data = this.state.data
        data[event.target.name] = event.target.value
        this.setState({
            data: data
        })
    }

    auth = () => {
        const valueChecker = this.state.valueChecker
        let isAllRight = true
        Object.keys(this.state.data).forEach((key) => {
            valueChecker[key] = !!this.state.data[key]
            isAllRight = isAllRight && !!this.state.data[key]
        });
        this.setState({
            valueChecker: valueChecker
        })
        if (isAllRight) {
            this.props.auth(this.state.data.username, this.state.data.password)
                .then(data => {
                    this.props.setToken(data.data.token, data.data.user)
                }).catch(e => {
                this.setState({
                    message: e.response.data.error
                })
            })
        }
    }

    render() {
        return <>
            <div className={'registration-message'}>
                {this.state.message}
            </div>
            <div>
                Email
            </div>
            <Input
                placeholder={'Email'}
                name={'username'}
                value={this.state.data.username}
                onChange={this.handleChange}
            />
            {
                !this.state.valueChecker.username && !this.state.data.username &&
                <div className={'registration-message'}>
                    *Обязательное поле
                </div>
            }
            <div>
                Пароль
            </div>
            <Input
                placeholder={'Password'}
                value={this.state.data.password}
                type={'password'}
                name={'password'}
                onChange={this.handleChange}
            />
            {
                !this.state.valueChecker.password && !this.state.data.password &&
                <div className={'registration-message'}>
                    *Обязательное поле
                </div>
            }
            <Button onClick={this.auth}
                    style={{width: '200px', backgroundColor: '#3e7cb0', color: '#f7faff', border: 'none'}}>
                Авторизация
            </Button>
        </>
    }
}
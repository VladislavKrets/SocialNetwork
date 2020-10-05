import React from "react";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";

export default class Registration extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            data: {
                username: '',
                password: '',
                name: '',
                surname: ''
            },
            avatar: null,
            duplicatePassword: '',
            passwordsMessage: '',
            emailMessage: '',
            valueChecker: {
                username: true,
                password: true,
                name: true,
                surname: true
            }
        }

    }

    handleChange = (event) => {
        if (event.target.name === 'duplicatePassword') {
            this.setState({
                [event.target.name]: event.target.value
            })
        }
        else {
            const data = this.state.data
            data[event.target.name] = event.target.value
            this.setState({
                data: data
            })
        }
        if (this.state.duplicatePassword && this.state.duplicatePassword !== this.state.data.password){
            this.setState({
                passwordsMessage: 'Пароли не совпадают'
            })
        }
        if (event.target.name === 'duplicatePassword'
            && (!event.target.value
                || event.target.value === this.state.data.password)) {
            this.setState({
                passwordsMessage: ''
            })
        }
    }



    register = () => {
        const valueChecker = this.state.valueChecker;
        let isAllRight = true
        Object.keys(this.state.data).forEach((key) => {
            valueChecker[key] = !!this.state.data[key]
            isAllRight = isAllRight && !!this.state.data[key]
        });

        isAllRight = isAllRight && !!this.state.duplicatePassword
        if (!this.state.duplicatePassword){
            this.setState({
                passwordsMessage: '*Обязательное поле'
            })
        }
        if (!valueChecker.username){
            this.setState({
                emailMessage: '*Обязательное поле'
            })
        }
        if (this.state.data.username &&
            !this.state.data.username.match(/[0-9a-zA-Z.\-]+@[0-9a-zA-Z.\-]+/)){
            valueChecker.username = false
            isAllRight = false
            this.setState({
                emailMessage: '*Невалидный email'
            })
        }
        this.setState({valueChecker: valueChecker})
        if (isAllRight) {
            const data = this.state.data;
            this.props.register(data)
                .then(data => {
                    this.props.setToken(data.data.token, data.data.user)
                }).catch(e => {
                this.setState({
                    message: e.response.data.error
                })
            })
        }
    }

    onEmailFieldBlur = (e) => {
        if (!this.state.data.username.match(/[0-9a-zA-Z.\-]+@[0-9a-zA-Z.\-]+/)){
            const valueChecker = this.state.valueChecker;
            valueChecker.username = false
            this.setState({
                valueChecker: valueChecker,
                emailMessage: '*Невалидный email'
            })
        }
        else {
            const valueChecker = this.state.valueChecker;
            valueChecker.username = true
            this.setState({
                valueChecker: valueChecker,
                emailMessage: ''
            })
        }
    }

    render() {
        return <>
            <div style={{color: 'red', fontSize: '1.0em', textAlign: 'center'}}>
                {this.state.message}
            </div>
            <Input
                placeholder={'Name'}
                style={{width: '200px'}}
                name={'name'}
                value={this.state.data.name}
                onChange={this.handleChange}
            />
            {
                !this.state.valueChecker.name && !this.state.data.name &&
                <div style={{color: 'red', fontSize: '1.0em', textAlign: 'center'}}>
                    *Обязательное поле
                </div>
            }
            <Input
                placeholder={'Surname'}
                style={{width: '200px'}}
                name={'surname'}
                value={this.state.data.surname}
                onChange={this.handleChange}
            />
            {
                !this.state.valueChecker.surname && !this.state.data.surname &&
                <div style={{color: 'red', fontSize: '1.0em', textAlign: 'center'}}>
                    *Обязательное поле
                </div>
            }
            <Input
                placeholder={'Email'}
                onBlur={this.onEmailFieldBlur}
                style={{width: '200px'}}
                name={'username'}
                value={this.state.data.username}
                onChange={this.handleChange}
            />
            {
                !this.state.valueChecker.username
                && (!this.state.data.username
                    || !this.state.data.username.match(/[0-9a-zA-Z.\-]+@[0-9a-zA-Z.\-]+/))
                &&
                <div style={{color: 'red', fontSize: '1.0em', textAlign: 'center'}}>
                    {this.state.emailMessage}
                </div>
            }
            <Input
                placeholder={'Password'}
                style={{width: '200px'}}
                value={this.state.data.password}
                type={'password'}
                name={'password'}
                onChange={this.handleChange}
            />
            {
                !this.state.valueChecker.password && !this.state.data.password &&
                <div style={{color: 'red', fontSize: '1.0em', textAlign: 'center'}}>
                    *Обязательное поле
                </div>
            }
            <Input
                placeholder={'Reenter password'}
                style={{width: '200px'}}
                value={this.state.duplicatePassword}
                type={'password'}
                name={'duplicatePassword'}
                onChange={this.handleChange}
            />
            <div style={{color: 'red', fontSize: '1.0em', textAlign: 'center'}}>
                {this.state.passwordsMessage}
            </div>

            <Button onClick={this.register}>
                Регистрация
            </Button>
        </>
    }
}
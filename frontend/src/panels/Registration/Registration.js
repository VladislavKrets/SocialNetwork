import React from "react";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import './Registration.css'

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
            additionalData: {
                country: '',
                city: '',
                birthdayDate: ''
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
            },
            chooser: 'main'
        }

    }

    handleChange = (event) => {
        if (event.target.name === 'duplicatePassword') {
            this.setState({
                [event.target.name]: event.target.value
            })
        } else {
            const data = this.state.data
            data[event.target.name] = event.target.value
            this.setState({
                data: data
            })
        }
        if (this.state.duplicatePassword && this.state.duplicatePassword !== this.state.data.password) {
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
        if (!this.state.duplicatePassword) {
            this.setState({
                passwordsMessage: '*Обязательное поле',
                chooser: 'main'
            })
        }
        if (!valueChecker.username) {
            this.setState({
                emailMessage: '*Обязательное поле',
                chooser: 'main'
            })
        }
        if (this.state.data.username &&
            !this.state.data.username.match(/[0-9a-zA-Z.\-]+@[0-9a-zA-Z.\-]+/)) {
            valueChecker.username = false
            isAllRight = false
            this.setState({
                emailMessage: '*Невалидный email',
                chooser: 'main'
            })
        }
        this.setState({valueChecker: valueChecker})
        if (isAllRight) {
            const data = {...this.state.data}
            Object.keys(this.state.additionalData).forEach((key) => {
                if (this.state.additionalData[key]) data[key] = this.state.additionalData[key]
            });
            this.props.register(data)
                .then(data => {
                    this.props.setToken(data.data.token, data.data.user)
                }).catch(e => {
                this.setState({
                    message: e.response.status === 401
                        ? "Пользователь с таким email-ом уже существует" : null,
                    chooser: 'main'
                })
            })
        } else {
            this.setState({
                chooser: 'main'
            })
        }
    }

    onEmailFieldBlur = (e) => {
        if (!this.state.data.username.match(/[0-9a-zA-Z.\-]+@[0-9a-zA-Z.\-]+/)) {
            const valueChecker = this.state.valueChecker;
            valueChecker.username = false
            this.setState({
                valueChecker: valueChecker,
                emailMessage: '*Невалидный email'
            })
        } else {
            const valueChecker = this.state.valueChecker;
            valueChecker.username = true
            this.setState({
                valueChecker: valueChecker,
                emailMessage: ''
            })
        }
    }
    handleAddChange = (event) => {
        const data = this.state.additionalData
        data[event.target.name] = event.target.value
        this.setState({
            additionalData: data
        })
    }

    render() {
        return <>
            <div className={'registration-message'}>
                {this.state.message}
            </div>
            {this.state.chooser === 'main' &&
            <>
                <div style={{textAlign: 'center'}}>
                    Заполните основную информацию
                </div>
                <div style={{textAlign: 'center', paddingBottom: '5px'}}>
                    (обязательно)
                </div>
                <div style={{paddingTop: '5px'}}>
                    Имя:
                </div>
                <Input
                    placeholder={'Name'}
                    name={'name'}
                    value={this.state.data.name}
                    onChange={this.handleChange}
                />
                {
                    !this.state.valueChecker.name && !this.state.data.name &&
                    <div className={'registration-message'}>
                        *Обязательное поле
                    </div>
                }
                <div style={{paddingTop: '5px'}}>
                    Фамилия:
                </div>
                <Input
                    placeholder={'Surname'}
                    name={'surname'}
                    value={this.state.data.surname}
                    onChange={this.handleChange}
                />
                {
                    !this.state.valueChecker.surname && !this.state.data.surname &&
                    <div className={'registration-message'}>
                        *Обязательное поле
                    </div>
                }
                <div style={{paddingTop: '5px'}}>
                    Email:
                </div>
                <Input
                    placeholder={'Email'}
                    onBlur={this.onEmailFieldBlur}
                    name={'username'}
                    value={this.state.data.username}
                    onChange={this.handleChange}
                />
                {
                    !this.state.valueChecker.username
                    && (!this.state.data.username
                        || !this.state.data.username.match(/[0-9a-zA-Z.\-]+@[0-9a-zA-Z.\-]+/))
                    &&
                    <div className={'registration-message'}>
                        {this.state.emailMessage}
                    </div>
                }
                <div style={{paddingTop: '5px'}}>
                    Пароль:
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
                <div style={{paddingTop: '5px'}}>
                    Пароль повторно:
                </div>
                <Input
                    placeholder={'Reenter password'}
                    value={this.state.duplicatePassword}
                    type={'password'}
                    name={'duplicatePassword'}
                    onChange={this.handleChange}
                />
                <div className={'registration-message'}>
                    {this.state.passwordsMessage}
                </div>
                <div style={{paddingTop: '5px'}}></div>
                <Button onClick={() => this.setState({
                    chooser: 'additional'
                })} style={{backgroundColor: '#3e7cb0', color: '#f7faff', border: 'none'}}>
                    Далее
                </Button>
            </>}
            {this.state.chooser === 'additional' && <>
                <div style={{textAlign: 'center'}}>
                    Заполните дополнительную информацию
                </div>
                <div style={{textAlign: 'center', paddingBottom: '5px'}}>
                    (необязательно)
                </div>
                <div style={{paddingTop: '5px'}}>
                    Страна:
                </div>
                <Input
                    placeholder={'Country'}
                    name={'country'}
                    value={this.state.additionalData.country}
                    onChange={this.handleAddChange}
                />
                <div style={{paddingTop: '5px'}}>
                    Город:
                </div>
                <Input
                    placeholder={'City'}
                    name={'city'}
                    value={this.state.additionalData.city}
                    onChange={this.handleAddChange}
                />
                <div style={{paddingTop: '5px'}}>
                    Дата рождения:
                </div>
                <Input
                    placeholder={'Birthday date'}
                    type={'date'}
                    name={'birthday_date'}
                    min={'1900-01-01'}
                    max={new Date().toDateString()}
                    value={this.state.additionalData.birthday_date}
                    onChange={this.handleAddChange}
                />
                <div style={{paddingTop: '5px'}}>
                    <Button onClick={() => this.setState({
                        chooser: 'main'
                    })} style={{backgroundColor: '#3e7cb0', color: '#f7faff', border: 'none'}}>
                        Назад
                    </Button>
                    <Button onClick={this.register}
                            style={{backgroundColor: '#199912', color: '#f7faff', border: 'none'}}>
                        Регистрация
                    </Button>
                </div>
            </>
            }

        </>
    }
}
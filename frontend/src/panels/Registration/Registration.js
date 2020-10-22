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
                passwordsMessage: '*Обязательное поле'
            })
        }
        if (!valueChecker.username) {
            this.setState({
                emailMessage: '*Обязательное поле'
            })
        }
        if (this.state.data.username &&
            !this.state.data.username.match(/[0-9a-zA-Z.\-]+@[0-9a-zA-Z.\-]+/)) {
            valueChecker.username = false
            isAllRight = false
            this.setState({
                emailMessage: '*Невалидный email'
            })
        }
        this.setState({valueChecker: valueChecker})
        if (isAllRight) {
            const data = this.state.data;
            Object.keys(this.state.additionalData).forEach((key) => {
                data[key] = this.state.additionalData[key]
            });
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
            <div
                style={{
                    width: '100%', padding: '15px 0',
                    textAlign: this.state.chooser === 'main' ? 'right' : 'left'
                }}>
                <span style={{
                    color: '#3e7cb0', display: 'flex', alignItems: 'center',
                    flexDirection: this.state.chooser === 'main' ? 'row-reverse' : null
                }}>
                    <div style={{
                        display: 'inline-block',
                        transform: 'scaleY(1.5)',
                        fontSize: '1.8em',
                        paddingBottom: '3px',
                        cursor: 'pointer',
                    }}
                         onClick={() => {
                             this.state.chooser === 'main'
                                 ? this.setState({chooser: 'additional'})
                                 : this.setState({chooser: 'main'})
                         }}
                    >
                        {this.state.chooser === 'main' ? '>' : '<'}
                    </div>
                    <div style={{fontSize: '1em', padding: '0 12px', cursor: 'pointer',}}
                         onClick={() => {
                             this.state.chooser === 'main'
                                 ? this.setState({chooser: 'additional'})
                                 : this.setState({chooser: 'main'})
                         }}>
                        {this.state.chooser === 'main' ? 'Дополнительная информация' : 'Назад'}
                    </div>
                </span>
            </div>
            <div style={{color: 'red', fontSize: '1.0em', textAlign: 'center'}}>
                {this.state.message}
            </div>
            {this.state.chooser === 'main' &&
            <>
                <div>
                    Имя:
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
                <div>
                    Фамилия:
                </div>
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
                <div>
                    Email:
                </div>
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
                <div>
                    Пароль:
                </div>
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
                <div>
                    Пароль повторно:
                </div>
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
            </>}
            {this.state.chooser === 'additional' && <>
                <div>
                    Страна:
                </div>
                <Input
                    placeholder={'Country'}
                    style={{width: '200px'}}
                    name={'country'}
                    value={this.state.additionalData.country}
                    onChange={this.handleAddChange}
                />
                <div>
                    Город:
                </div>
                <Input
                    placeholder={'City'}
                    style={{width: '200px'}}
                    name={'city'}
                    value={this.state.additionalData.city}
                    onChange={this.handleAddChange}
                />
                <div>
                    Дата рождения:
                </div>
                <Input
                    placeholder={'Birthday date'}
                    type={'date'}
                    style={{width: '200px'}}
                    name={'birthday_date'}
                    min={'1900-01-01'}
                    max={new Date().toDateString()}
                    value={this.state.additionalData.birthday_date}
                    onChange={this.handleAddChange}
                />
            </>
            }
            <Button onClick={this.register} style={{width: '200px'}}>
                Регистрация
            </Button>
        </>
    }
}
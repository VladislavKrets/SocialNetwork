import React from 'react';
import backgroundImg from '../../img/background.jpeg'
import './Main.css'
import {Link} from "react-router-dom";
class Main extends React.Component{
    componentDidMount() {
        document.title = "Проект социальной сети"
    }

    render() {
        return <div
            style={{
                opacity: '0.7',
                backgroundImage: `url(${backgroundImg})`,
                height: '100vh',
                backgroundSize: 'cover'
            }}>
            <div className='center-block' style={{paddingTop: '100px'}}>
                <div className='info-block'>
                    <div>Зарегистрироваться/Авторизоваться можно здесь</div>
                    <div style={{display: 'flex', justifyContent: 'center', paddingTop: '15px'}}>
                        <Link className='reg-button' to={'/auth'}>Регистрация/Авторизация</Link>
                    </div>
                </div>
            </div>
            <div className='center-block' style={{paddingTop: '100px'}}>
                <div className='info-block'>
                    Здесь должна быть какая-то информация
                </div>
            </div>
        </div>
    }
}
export default Main
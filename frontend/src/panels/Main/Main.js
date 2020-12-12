import React from 'react';
import backgroundImg from '../../img/background.jpeg'
import './Main.css'
import {Link} from "react-router-dom";

class Main extends React.Component {
    componentDidMount() {
        document.title = "Проект социальной сети"
    }

    render() {
        return <div
            className={'main-page-body'}
            style={{
                backgroundImage: `url(${backgroundImg})`,
            }}>
            {!this.props.user &&
            <div className='center-block' style={{paddingTop: '100px'}}>
                <div className='info-block'>
                    <div>Зарегистрироваться/Авторизоваться можно здесь</div>
                    <div style={{display: 'flex', justifyContent: 'center', paddingTop: '15px'}}>
                        <Link className='reg-button' to={'/auth'}>Регистрация/Авторизация</Link>
                    </div>
                </div>
            </div>
            }
            {this.props.user && <div className='center-block' style={{paddingTop: '100px'}}>
                <div className='info-block'>
                    <div>Вы авторизованы как
                        <span style={{color: '#3e7cb0', fontWeight: 'bold', paddingLeft: '3px'}}>
                            {this.props.user.name} {this.props.user.surname}
                        </span>
                    </div>
                    <div>Вы можете перейти на свою страницу</div>
                    <div style={{display: 'flex', justifyContent: 'center', paddingTop: '15px'}}>
                        <Link className='reg-button' to={'/me'}>Перейти на страницу</Link>
                    </div>
                </div>
            </div>}
            <div className='center-block' style={{paddingTop: '100px'}}>
                <div className='info-block'>
                    <div style={{paddingBottom: '12px'}}>
                        Данный проект осуществлен в рамках курсовой работы
                        <span style={{fontWeight: 'bold'}}> "Создание базы данных небольшой социальной сети"</span>.
                    </div>
                    <div>
                        Здесь были реализованы некоторые основные функции социальных сетей - регистрация пользователя,
                        редактирование пользователя, возможность ставить фото профиля пользователя, возможность
                        пользователя выкладывать фотографии, возможность пользователя создавать записи как у себя,
                        так и на страницах других пользователей, возможность пользователя оставлять комментарии под записями,
                        редактировать собственные записи, удалять собственные записи или записи пользователей со своей страницы,
                        возможность пользователя создавать сообщества (группы), администрировать их, вступать в сообщества
                        других пользователей, общаться с другими пользователями посредством диалогов.
                    </div>
                </div>
            </div>
               <div className='center-block' style={{paddingTop: '100px'}}>
                <div className='info-block'>
                    <div>
                        В базе данных этого проекта насчитывается 7 понятий, а именно Пользователь, Группа, Пост, Пост в группе,
                        Комментарий, Сообщение, Сохраненное изображение или 20 отношений, включая служебные таблицы (например, из-за связей ManyToMany)
                    </div>
                </div>
            </div>
        </div>
    }
}

export default Main
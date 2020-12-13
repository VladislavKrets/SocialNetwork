import React, {useState} from "react";
import {Link} from "react-router-dom";
import './Navbar.css'
import user from '../../img/user.svg'
import exit from '../../img/exit.svg'
import {useHistory} from 'react-router-dom';
import Alert from "../Alert/Alert";

function NavBar(props) {
    let history = useHistory();

    const [isExitDialogOpened, setExit] = useState(false)

    const profileRedirect = () => {
        let path = `/me`;
        document.title = 'Профиль'
        history.push(path);
        props.setCurrentLink(null)
    }
    const currStyle = {
        backgroundColor: 'white',
        color: '#3e7cb0'
    }
    return <div>
        {
            isExitDialogOpened ?
                <Alert style={{backgroundColor: '#f7faff', borderRadius: '12px',}}
                       close={() => {
                           setExit(false)
                       }}>
                    <div style={{
                        width: '300px',
                        borderRadius: '12px',
                        backgroundColor: '#f7faff'
                    }}>
                        <div style={{padding: '20px 12px', wordBreak: 'break-word', textAlign: 'center'}}>
                            Вы действительно хотите выйти из этого аккаунта?
                        </div>
                        <div style={{
                            display: 'flex',
                            fontWeight: 'bold',
                            width: '100%',
                            borderTop: '1px solid grey'
                        }}>
                            <div style={{
                                textAlign: 'center',
                                width: '50%',
                                borderRight: '1px solid grey',
                                padding: '12px 0',
                                color: 'red',
                                cursor: 'pointer'
                            }} onClick={() => {
                                props.setCurrentLink({current: null})
                                props.logOut()
                            }}>
                                Выйти
                            </div>
                            <div style={{
                                width: '50%',
                                textAlign: 'center',
                                padding: '12px 0',
                                color: '#3e7cb0',
                                cursor: 'pointer'
                            }} onClick={() => {
                                setExit(false)
                            }}>
                                Отмена
                            </div>
                        </div>
                    </div>
                </Alert>
                : null
        }
        <div className='navbar-desktop'>
            <ul className='ul-navbar-desktop'>
                {
                    props.links.map(link => {
                        return <li tooltip={link.tooltip} tooltip-position={'bottom'}>
                            <Link to={link.link} style={window.location.pathname === link.link ? currStyle : null}
                                  onClick={() => {
                                      props.setCurrentLink(link.text)
                                  }}>{link.text}</Link>
                        </li>
                    })
                }

            </ul>
            <div className={'nav-user'}>
                <div style={{display: 'flex', alignItems: 'center'}} onClick={profileRedirect}>
                    <div style={{paddingRight: '7px'}}>
                        <img className={'center-cropped'} style={{width: '60px', height: '60px'}}
                             src={props.user.avatar.image}/>
                    </div>
                    <span style={{paddingRight: '7px'}}>{props.user.name}</span>
                    <span style={{paddingRight: '7px'}}>{props.user.surname}</span>
                </div>
                <div style={{paddingLeft: '7px'}}>
                    <a className={'exit-nav-bar'}
                       style={{cursor: 'pointer'}} onClick={() => {
                        setExit(true)
                    }}>Выйти</a>
                </div>
            </div>
        </div>
        <div className='navbar-mobile'>
            <div>{document.title}</div>
            <div onClick={() => {
                setExit(true)
            }}><img style={{width: '28px', 'height': '28px'}} src={exit}/></div>
        </div>
        <div className='navbar-content'>
            {props.children}
        </div>
        <div className='epicbar-mobile'>
            <div onClick={profileRedirect} style={{
                padding: '0 10px',
                borderBottom: window.location.pathname === '/me' ? '2px solid #3e7cb0' : null
            }}>
                <img style={{width: '28px', 'height': '28px'}} src={user}/>
            </div>
            {props.links.map(link => {
                return <Link to={link.link} style={{
                    padding: '0 10px',
                    borderBottom: window.location.pathname === link.link ? '2px solid #3e7cb0' : null
                }}
                             onClick={() => {
                                 props.setCurrentLink(link.text)
                             }}>
                    <img style={{width: '28px', 'height': '28px'}} src={link.icon}/>
                </Link>
            })
            }
        </div>
    </div>
}

export default NavBar
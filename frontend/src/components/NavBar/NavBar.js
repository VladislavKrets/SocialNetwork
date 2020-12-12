import React from "react";
import {Link} from "react-router-dom";
import './Navbar.css'
import user from '../../img/user.svg'
import {useHistory} from 'react-router-dom';

function NavBar(props) {
    let history = useHistory();

    const profileRedirect = () => {
        let path = `/me`;
        history.push(path);
        props.setCurrentLink(null)
    }
    const currStyle = {
        backgroundColor: 'white',
        color: '#3e7cb0'
    }
    return <div>
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
                        props.setCurrentLink({current: null})
                        props.logOut()
                    }}>Выйти</a>
                </div>
            </div>
        </div>
        <div className='navbar-mobile'>
            {document.title}
        </div>
        <div className='navbar-content'>
            {props.children}
        </div>
        <div className='epicbar-mobile'>
            <div onClick={profileRedirect} style={{
                    padding: '0 10px',
                    borderBottom: window.location.pathname === '/me' ?  '2px solid #3e7cb0' : null
                }}>
                <img style={{width: '28px', 'height': '28px'}} src={user}/>
            </div>
            {props.links.map(link => {
                return <Link to={link.link} style={{
                    padding: '0 10px',
                    borderBottom: window.location.pathname === link.link ?  '2px solid #3e7cb0' : null
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
import React from "react";
import {Link} from "react-router-dom";
import './Navbar.css'
import { useHistory } from 'react-router-dom';



function NavBar(props) {
    let history = useHistory();
    const profileRedirect =()=> {
        let path = `/me`;
        history.push(path);
    }
    return  <div>
            <div className='navbar-desktop'>
                <ul className='ul-navbar-desktop'>
                    {
                        props.links.map(link => {
                            return <li>
                                <Link to={link.link}>{link.text}</Link>
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
                           style={{cursor: 'pointer'}} onClick={props.logOut}>Выйти</a>
                    </div>
                </div>
            </div>
            <div className='navbar-mobile'>

            </div>
            <div className='navbar-content'>
                {props.children}
            </div>
            <div className='epicbar-mobile'>

            </div>
        </div>
}

export default NavBar
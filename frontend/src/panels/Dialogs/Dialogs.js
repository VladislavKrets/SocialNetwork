import React from "react";
import NavBar from "../../components/NavBar/NavBar";
import {Link} from "react-router-dom";
import noAvatar from "../../img/no-avatar.png";

export default class Dialogs extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dialogs: null
        }
    }

    componentDidMount() {
        this.getDialogs()
    }

    getDialogs = () => {
        this.props.getDialogs().then(data => {
            this.setState({
                dialogs: data.data
            })
        })
    }

    render() {
        return <NavBar user={this.props.user}
                       logOut={this.props.logOut}
                       links={this.props.links}>
            {this.state.dialogs && <>
                <div className={'user-center-container'}>
                    <span style={{color: '#3e7cb0', fontWeight: 'bold', fontSize: '1.2em'}}>Мои сообщения</span>
                </div>
                <div className={'user-center-container'}>
                    <div style={{width: '1000px'}}>
                        {
                            this.state.dialogs && this.state.dialogs.map(item => {
                                const date = new Date(item.date)
                                const curr_date = date.getDate();
                                const curr_month = date.getMonth() + 1;
                                const curr_year = date.getFullYear();
                                const curr_hours = date.getHours()
                                const curr_minutes = date.getMinutes()
                                const curr_seconds = date.getSeconds()
                                return <Link
                                    style={{
                                        textDecoration: 'none',
                                        padding: '12px 0',
                                        borderBottom: '1px solid #3e7cb0',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        color: '#3e7cb0',
                                        alignItems: 'center',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        fontSize: '1.2em'
                                    }}
                                    to={`/dialog/${item.id}`}
                                >
                                    <Link to={`/user/${item.user_to.id}`} target={'_blank'} onClick={e => {
                                            e.stopPropagation()
                                        }}
                                          style={{display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit'}}>
                                        <div style={{paddingRight: '5px', }}>
                                            <img style={{width: '90px', height: '90px'}}
                                                 className={'center-cropped'}
                                                 src={item.user_to.avatar ? item.user_to.avatar.image : noAvatar}
                                            />
                                        </div>
                                        <div>
                                            <div>
                                                {item.user_to.name}
                                            </div>
                                            <div>
                                                {item.user_to.surname}
                                            </div>
                                        </div>
                                    </Link>
                                    <div style={{
                                        width: '65%',
                                        display: 'flex',
                                        flexDirection: 'row-reverse',
                                        alignItems: 'center'
                                    }}>
                                        <div style={{
                                            width: '25%',
                                            color: 'grey',
                                            fontSize: '0.6em',
                                            fontWeight: 'normal',
                                            textAlign: 'right',
                                        }}>
                                            {(curr_hours < 10 ? "0" + curr_hours : curr_hours)
                                            + ":" + (curr_minutes < 10 ? "0" + curr_minutes : curr_minutes)
                                            + ":" + (curr_seconds < 10 ? "0" + curr_seconds : curr_seconds)
                                            + " " + (curr_date < 10 ? "0" + curr_date : curr_date)
                                            + "-" + (curr_month < 10 ? "0" + curr_month : curr_month)
                                            + "-" + curr_year}
                                        </div>
                                        <div style={{
                                            width: '80%',
                                            color: 'black',
                                            fontSize: '1em',
                                            fontWeight: 'normal',
                                            textAlign: 'right'
                                        }}>
                                            {item.last_message ? item.last_message.text : null}
                                        </div>

                                    </div>
                                </Link>
                            })}
                    </div>
                </div>
            </>
            }
        </NavBar>
    }
}
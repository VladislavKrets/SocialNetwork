import React from "react";
import NavBar from "../../components/NavBar/NavBar";
import noAvatar from '../../img/no-avatar.png'
import {withRouter} from "react-router";
import {Link} from "react-router-dom";

class Friends extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            people: null,
            chosen: 'friends'
        }
    }

    getPeople = () => {
        this.props.getPeople().then(data => {
            this.setState({
                people: data.data
            })
        })
    }
    getFriends = () => {
        this.props.getFriends().then((data) => {
            this.setState({
                people: data.data
            })
        })
    }
    sendFriendRequest = (id) => {
        this.props.sendFriendRequest(id).then(() => {
            const people = this.state.people.map(x => {
                if (x.id === id) {
                    x.followed = true
                    return x;
                }
                return x;
            })
            this.setState({
                people: people
            })
        })
    }
    removeFromFriends = (id) => {
        this.props.removeFromFriends(id).then(() => {
            let people;
            if (this.state.chosen === 'people') {
                people = this.state.people.map(x => {
                    if (x.id === id) {
                        x.followed = false
                        return x;
                    }
                    return x;
                })
            } else if (this.state.chosen === 'friends') {
                people = this.state.people.filter(x => x.id !== id);
            }
            this.setState({
                people: people
            })
        })
    }
    userRedirect = (id) => {
        const {location, history} = this.props
        let path = `/user/${id}`;
        history.push(path);
    }

    componentDidMount() {
        this.getFriends()
    }

    render() {
        return <NavBar
            user={this.props.user}
            logOut={this.props.logOut}
            links={this.props.links}>
            <div style={{
                padding: '20px',
                fontSize: '2em',
                color: '#3e7cb0',
                textAlign: 'center',
                fontWeight: 'bold'
            }}>
                {this.state.chosen === 'friends' ? 'Мои друзья' : 'Люди'}
            </div>
            <div style={{display: 'flex', justifyContent: 'center'}}>
                <span style={{
                    display: 'flex',
                    color: 'antiquewhite',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                }}>
                    <div style={{
                        textAlign: 'center',
                        width: '150px',
                        padding: '15px',
                        backgroundColor: this.state.chosen === 'friends' ? 'antiquewhite' : '#3e7cb0',
                        color: this.state.chosen === 'friends' ? '#3e7cb0' : null,
                        borderBottomLeftRadius: '7px',
                        borderTopLeftRadius: '7px',
                    }} onClick={() => {
                        this.setState({chosen: 'friends', people: null})
                        this.getFriends()
                    }}>
                        Мои друзья
                    </div>
                    <div style={{
                        textAlign: 'center',
                        width: '150px',
                        padding: '15px',
                        backgroundColor: this.state.chosen === 'people' ? 'antiquewhite' : '#3e7cb0',
                        color: this.state.chosen === 'people' ? '#3e7cb0' : null,
                        borderBottomRightRadius: '7px',
                        borderTopRightRadius: '7px'
                    }} onClick={() => {
                        this.setState({chosen: 'people', people: null})
                        this.getPeople()
                    }}>
                        Люди
                    </div>
                </span>
            </div>
            <div style={{display: 'flex', justifyContent: 'center', paddingTop: '30px'}}>
                <div style={{width: '1000px'}}>
                    {
                        this.state.people && this.state.people.map(item => {
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
                                to={`/user/${item.id}`}
                            >
                                <div>
                                    <img style={{width: '200px', height: '200px'}}
                                         className={'center-cropped'}
                                         src={item.avatar_image ? item.avatar_image.image : noAvatar}
                                    />
                                </div>
                                <div>
                                    <span style={{paddingRight: '12px'}}>
                                        {item.name}
                                    </span>
                                    <span>
                                        {item.surname}
                                    </span>
                                </div>
                                <div>
                                    {this.props.user.id === item.id ?
                                        <div style={{
                                            color: 'green',
                                            width: '210px',
                                            textAlign: 'center',
                                            fontSize: '3em'
                                        }}>
                                            ✔
                                        </div> : item.followed && item.followed_you ?
                                            <div style={{
                                                color: 'green',
                                                width: '210px',
                                                textAlign: 'center',
                                                fontSize: '1.2em'
                                            }}>
                                                <div style={{textAlign: 'center'}}>Друзья</div>
                                                <div><span
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        this.removeFromFriends(item.id)
                                                    }}
                                                    style={{
                                                        color: 'red',
                                                        fontSize: '0.7em',
                                                        fontWeight: "normal",
                                                        cursor: 'pointer',
                                                        borderBottom: '1px solid red',
                                                    }}>Удалить из друзей</span>
                                                </div>
                                            </div> : item.followed && !item.followed_you ?
                                                <div style={{
                                                    color: 'green',
                                                    width: '210px',
                                                    textAlign: 'center',
                                                    fontSize: '1em'
                                                }}>
                                                    <div>Вы подписаны</div>
                                                    <div><span
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            this.removeFromFriends(item.id)
                                                        }}
                                                        style={{
                                                            color: 'red',
                                                            fontSize: '0.7em',
                                                            fontWeight: "normal",
                                                            cursor: 'pointer',
                                                            borderBottom: '1px solid red',
                                                        }}>Отписаться</span>
                                                    </div>
                                                </div> : !item.followed && item.followed_you ?
                                                    <div style={{
                                                        backgroundColor: '#36965d',
                                                        width: '210px',
                                                        color: 'antiquewhite',
                                                        borderRadius: '5px 10px',
                                                        fontSize: '1em',
                                                        padding: '5px 15px',
                                                        textAlign: 'center',
                                                    }} onClick={e => {
                                                        e.stopPropagation();
                                                        this.sendFriendRequest(item.id)
                                                    }
                                                    }>
                                                        Добавить в друзья
                                                    </div> :
                                                    <div style={{
                                                        backgroundColor: '#36965d',
                                                        width: '210px',
                                                        color: 'antiquewhite',
                                                        borderRadius: '5px 10px',
                                                        fontSize: '1em',
                                                        padding: '5px 15px',
                                                        textAlign: 'center',
                                                    }} onClick={e => {
                                                        e.stopPropagation();
                                                        this.sendFriendRequest(item.id)
                                                    }
                                                    }>
                                                        Подписаться
                                                    </div>
                                    }
                                </div>
                            </Link>
                        })
                    }
                    {this.state.people && this.state.people.length === 0 && (this.state.chosen === 'friends' ?
                        <div style={{textAlign: 'center'}}>У вас еще нет друзей</div>
                        : <div style={{textAlign: 'center'}}>Ни одного человека еще не зарегистрировано</div>)}
                </div>
            </div>
        </NavBar>
    }
}

export default withRouter(Friends)
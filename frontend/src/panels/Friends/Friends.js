import React from "react";
import NavBar from "../../components/NavBar/NavBar";
import noAvatar from '../../img/no-avatar.png'
import Photo from "../../components/Photo/Photo";

export default class Friends extends React.Component {

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
                            return <div
                                style={{
                                    padding: '12px 0',
                                    borderBottom: '1px solid #3e7cb0',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    color: '#3e7cb0',
                                    alignItems: 'center',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    fontSize: '1.2em'
                                }}>
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
                                            width: '138px',
                                            textAlign: 'center',
                                            fontSize: '3em'
                                        }}>
                                            ✔
                                        </div> : item.followed && item.followed_you ?
                                            <div style={{
                                                color: 'green',
                                                width: '138px',
                                                textAlign: 'center',
                                                fontSize: '1.2em'
                                            }}>
                                                Друзья
                                            </div> : item.followed && !item.followed_you ?
                                                <span style={{
                                                    color: 'green',
                                                    width: '138px',
                                                    textAlign: 'center',
                                                    fontSize: '1em'
                                                }}>
                                                Вы подписаны
                                            </span> : !item.followed && item.followed_you ?
                                                    <span style={{
                                                        backgroundColor: '#36965d',
                                                        color: 'antiquewhite',
                                                        borderRadius: '5px 10px',
                                                        fontSize: '1em',
                                                        padding: '5px 12px'
                                                    }} onClick={e => {
                                                        e.stopPropagation();
                                                        this.sendFriendRequest(item.id)
                                                    }
                                                    }>
                                                        Добавить в друзья
                                                    </span> :
                                                    <span style={{
                                                        backgroundColor: '#36965d',
                                                        color: 'antiquewhite',
                                                        borderRadius: '5px 10px',
                                                        fontSize: '1em',
                                                        padding: '5px 12px'
                                                    }} onClick={e => {
                                                        e.stopPropagation();
                                                        this.sendFriendRequest(item.id)
                                                    }
                                                    }>
                                        Подписаться
                                    </span>
                                    }
                                </div>
                            </div>
                        })
                    }
                </div>
            </div>
        </NavBar>
    }
}
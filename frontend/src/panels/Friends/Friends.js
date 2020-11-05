import React from "react";
import NavBar from "../../components/NavBar/NavBar";
import noAvatar from '../../img/no-avatar.png'
import {withRouter} from "react-router";
import {Link} from "react-router-dom";
import Alert from "../../components/Alert/Alert";
import Input from "../../components/Input/Input";

class Friends extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            people: null,
            chosen: 'friends',
            isRemoveDialogOpened: false,
            currentUserId: null,
            message: '',
            removeButtonName: '',
            searchData: {
                name: ''
            }
        }
    }

    handleSearchChange = (e) => {
        const searchData = this.state.searchData
        searchData[e.target.name] = e.target.value
        if (e.target.name === 'name') this.search(searchData)
        this.setState({
            searchData: searchData
        })
    }

    onChangeRemoveDialogState = (id, message, removeButtonName) => {
        this.setState({
            isRemoveDialogOpened: !this.state.isRemoveDialogOpened,
            currentUserId: id,
            message: message,
            removeButtonName: removeButtonName
        })
    }

    getPeople = () => {
        document.title = "Люди"
        this.props.getPeople().then(data => {
            this.setState({
                people: data.data
            })
        })
    }
    getFriends = () => {
        document.title = "Мои друзья"
        this.props.getFriends().then((data) => {
            this.setState({
                people: data.data
            })
        })
    }
    getSubscribers = () => {
        document.title = "Мои подписчики"
        this.props.getUserSubscribers().then(data => {
            this.setState({
                people: data.data
            })
        })
    }
    getSubscribed = () => {
        document.title = "Мои подписки"
        this.props.getUserSubscribed().then(data => {
            this.setState({
                people: data.data
            })
        })
    }
    searchUserFriends = (searchData) => {
        this.props.searchUserFriends(searchData).then(data => {
            this.setState({
                people: data.data
            })
        })
    }
    searchPeople = (searchData) => {
        this.props.searchPeople(searchData).then(data => {
            this.setState({
                people: data.data
            })
        })
    }

    searchUserSubscribers = (searchData) => {
        this.props.searchUserSubscribers(searchData).then(data => {
            this.setState({
                people: data.data
            })
        })
    }

    searchUserSubscribed = (searchData) => {
        this.props.searchUserSubscribed(searchData).then(data => {
            this.setState({
                people: data.data
            })
        })
    }

    search = (searchData) => {
        switch (this.state.chosen) {
            case "people":
                this.searchPeople(searchData)
                break
            case "friends":
                this.searchUserFriends(searchData)
                break
            case "subscribers":
                this.searchUserSubscribers(searchData)
                break
            case "subscribed":
                this.searchUserSubscribed(searchData)
                break
        }
    }

    sendFriendRequest = (id) => {
        this.props.sendFriendRequest(id).then(() => {
            let people = this.state.people
            if (this.state.chosen === 'subscribers') {
                people = people.filter(x => x.id !== id)
            } else {
                people = people.map(x => {
                    if (x.id === id) {
                        x.followed = true
                        return x;
                    }
                    return x;
                })
            }
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
            } else if (this.state.chosen === 'friends' || this.state.chosen === 'subscribed') {
                people = this.state.people.filter(x => x.id !== id);
            }
            this.setState({
                people: people
            })
        })
    }

    componentDidMount() {
        this.getFriends()
        document.title = "Мои друзья"
    }

    render() {
        return <NavBar
            user={this.props.user}
            logOut={this.props.logOut}
            setCurrentLink={this.props.setCurrentLink}
            currentLink={this.props.currentLink}
            links={this.props.links}>
            {
                this.state.isRemoveDialogOpened ?
                    <Alert style={{backgroundColor: '#f7faff', borderRadius: '12px',}}
                           close={() => {
                               this.onChangeRemoveDialogState(null, '', '')
                           }}>
                        <div style={{
                            width: '300px',
                            borderRadius: '12px',
                            backgroundColor: '#f7faff'
                        }}>
                            <div style={{padding: '20px 12px', wordBreak: 'break-word', textAlign: 'center'}}>
                                {this.state.message}
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
                                    this.removeFromFriends(this.state.currentUserId)
                                    this.onChangeRemoveDialogState(null, '', '')
                                }}>
                                    {this.state.removeButtonName}
                                </div>
                                <div style={{
                                    width: '50%',
                                    textAlign: 'center',
                                    padding: '12px 0',
                                    color: '#3e7cb0',
                                    cursor: 'pointer'
                                }} onClick={() => {
                                    this.onChangeRemoveDialogState(null, '', '')
                                }}>
                                    Отмена
                                </div>
                            </div>
                        </div>
                    </Alert>
                    : null
            }
            <div style={{
                padding: '20px',
                fontSize: '2em',
                color: '#3e7cb0',
                textAlign: 'center',
                fontWeight: 'bold'
            }}>
                {this.state.chosen === 'friends' ? 'Мои друзья'
                    : this.state.chosen === 'subscribers'
                        ? 'Мои подписчики'
                        : this.state.chosen === 'subscribed'
                            ? 'Мои подписки' : 'Люди'}
            </div>
            <div style={{display: 'flex', justifyContent: 'center', paddingBottom: '20px'}}>
                <Input type={'text'} name={'name'} style={{width: '800px'}} placeholder={'Поиск'}
                       onChange={this.handleSearchChange} value={this.state.searchData.name}/>
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
                        this.setState({
                            chosen: 'friends', people: null, searchData: {
                                name: ''
                            }
                        })
                        this.getFriends()
                    }}>
                        Мои друзья
                    </div>
                    <div style={{
                        textAlign: 'center',
                        width: '150px',
                        padding: '15px',
                        backgroundColor: this.state.chosen === 'subscribers' ? 'antiquewhite' : '#3e7cb0',
                        color: this.state.chosen === 'subscribers' ? '#3e7cb0' : null,
                        borderLeft: '1px solid antiquewhite'
                    }} onClick={() => {
                        this.setState({
                            chosen: 'subscribers', people: null, searchData: {
                                name: ''
                            }
                        })
                        this.getSubscribers()
                    }}>
                        Мои подписчики
                    </div>
                    <div style={{
                        textAlign: 'center',
                        width: '150px',
                        padding: '15px',
                        backgroundColor: this.state.chosen === 'subscribed' ? 'antiquewhite' : '#3e7cb0',
                        color: this.state.chosen === 'subscribed' ? '#3e7cb0' : null,
                        borderLeft: '1px solid antiquewhite'
                    }} onClick={() => {
                        this.setState({
                            chosen: 'subscribed', people: null, searchData: {
                                name: ''
                            }
                        })
                        this.getSubscribed()
                    }}>
                        Мои подписки
                    </div>
                    <div style={{
                        textAlign: 'center',
                        width: '150px',
                        padding: '15px',
                        backgroundColor: this.state.chosen === 'people' ? 'antiquewhite' : '#3e7cb0',
                        color: this.state.chosen === 'people' ? '#3e7cb0' : null,
                        borderLeft: '1px solid antiquewhite',
                        borderBottomRightRadius: '7px',
                        borderTopRightRadius: '7px'
                    }} onClick={() => {
                        this.setState({
                            chosen: 'people', people: null, searchData: {
                                name: ''
                            }
                        })
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
                                target="_blank"
                                to={`/user/${item.id}`}
                            >
                                <div>
                                    <img style={{width: '200px', height: '200px'}}
                                         className={'center-cropped'}
                                         src={item.avatar ? item.avatar.image : noAvatar}
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
                                                        e.preventDefault();
                                                        this.onChangeRemoveDialogState(item.id,
                                                            'Вы действительно хотите удалить' +
                                                            ' данного пользователя из друзей?',
                                                            'Удалить')
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
                                                    <div style={{paddingBottom: '10px'}}>Вы подписаны</div>
                                                    <span
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            e.preventDefault();
                                                            this.onChangeRemoveDialogState(item.id,
                                                                'Вы действительно хотите отписаться' +
                                                                ' от данного пользователя?',
                                                                'Отписаться')
                                                        }}
                                                        style={{
                                                            color: 'red',
                                                            fontSize: '0.85em',
                                                            fontWeight: "normal",
                                                            cursor: 'pointer',
                                                            borderBottom: '1px solid red',
                                                        }}>Отписаться
                                                    </span>
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
                                                        e.preventDefault();
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
                                                        e.preventDefault();
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
                    {this.state.people && this.state.people.length === 0 && (
                        this.state.searchData.name ? <div style={{textAlign: 'center'}}>Ничего не найдено</div> :
                            this.state.chosen === 'friends' ?
                                <div style={{textAlign: 'center'}}>У вас еще нет
                                    друзей</div> : this.state.chosen === 'subscribers' ?
                                <div style={{textAlign: 'center'}}>У вас нет подписчиков</div>
                                : this.state.chosen === 'subscribed' ?
                                    <div style={{textAlign: 'center'}}>Вы ни на кого не подписаны</div>
                                    : <div style={{textAlign: 'center'}}>Ни одного человека еще не
                                        зарегистрировано</div>)}
                </div>
            </div>
        </NavBar>
    }
}

export default withRouter(Friends)
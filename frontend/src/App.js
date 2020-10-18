import React from 'react';
import logo from './logo.svg';
import './App.css';
import {Redirect, Route, Switch} from "react-router";
import Main from "./panels/Main/Main";
import Auth from "./panels/Auth/Auth";
import axios from "./api";
import cookie from "react-cookies";
import User from "./panels/User/User";
import PrivateRoute from "./components/PrivateRoute/PrivateRoute";
import noAvatar from "./img/no-avatar.png"
import Friends from "./panels/Friends/Friends";
import Groups from "./panels/Groups/Groups";
import Group from "./panels/Group/Group";

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            token: null,
            user: null,
            loading: true,
            navLinks: [
                {link: '/friends', text: 'Друзья'},
                {link: '/groups', text: 'Группы'},
                {link: '/inquires', text: 'Опросы'}
            ]
        }
    }

    auth = (login, password) => {
        return axios.put('/auth/',
            {
                username: login,
                password: password
            }, {
                headers: {
                    "X-CSRFTOKEN": cookie.load("csrftoken")
                }
            })
    }

    register = (data) => {
        return axios.post('/auth/',
            data, {
                headers: {
                    "X-CSRFTOKEN": cookie.load("csrftoken")
                }
            })
    }

    getUser = (token) => {
        axios.get('/me/', {
            headers: {
                Authorization: 'Token ' + (token ? token : this.state.token)
            }
        }).then(data => {
            const user = data.data
            if (!user.avatar) {
                user['avatar'] = {
                    image: noAvatar
                }
            }
            this.setState({
                user: user
            })
        }).catch(e => {
            if (e.response.status === 401) {
                this.logOut();
            }
        })
    }
    imageUpload = (image, is_avatar) => {
        let form_data = new FormData();
        form_data.append('image', image, image.name);
        if (is_avatar) form_data.append('is_avatar', is_avatar);
        return axios.post('/upload/', form_data, {
            headers: {
                Authorization: 'Token ' + this.state.token,
                'content-type': 'multipart/form-data'
            }
        })
    }

    imageDelete = (id) => {
        return axios.delete(`/upload_post_image/${id}/`, {
            headers: {
                Authorization: 'Token ' + this.state.token,
            }
        })
    }

    postImageUpload = (image, isPhoto) => {
        let form_data = new FormData();
        form_data.append('image', image, image.name);
        form_data.append('photo', (!!isPhoto).toString())
        return axios.post('/upload_post_image/', form_data, {
            headers: {
                Authorization: 'Token ' + this.state.token,
                'content-type': 'multipart/form-data'
            }
        })
    }

    postImageDelete = (id) => {
        return axios.delete(`/upload_post_image/${id}/`, {
            headers: {
                Authorization: 'Token ' + this.state.token,
            }
        })
    }

    postAdd = (data) => {
        return axios.post('/posts/',
            data, {
                headers: {
                    Authorization: 'Token ' + this.state.token,
                    "X-CSRFTOKEN": cookie.load("csrftoken")
                }
            })
    }
    groupPostAdd = (data) => {
        return axios.post('/group_posts/',
            data, {
                headers: {
                    Authorization: 'Token ' + this.state.token,
                    "X-CSRFTOKEN": cookie.load("csrftoken")
                }
            })
    }
    unshiftPostToUser = (post) => {
        const user = this.state.user
        user.posts.unshift(post)
        this.setState({
            user: user
        })
    }
    getFriends = () => {
        return axios.get('/friends/',
            {
                headers: {
                    Authorization: 'Token ' + this.state.token,
                    "X-CSRFTOKEN": cookie.load("csrftoken")
                }
            })
    }

    getUserById = (id) => {
        return axios.get(`/users/${id}/`,
            {
                headers: {
                    Authorization: 'Token ' + this.state.token,
                    "X-CSRFTOKEN": cookie.load("csrftoken")
                }
            })
    }
    removeFromFriends = (id) => {
        return axios.delete(`/people/${id}/`, {
            headers: {
                Authorization: 'Token ' + this.state.token,
                "X-CSRFTOKEN": cookie.load("csrftoken")
            }
        })
    }
    sendFriendRequest = (id) => {
        return axios.post(`/friends/${id}/`, {}, {
            headers: {
                Authorization: 'Token ' + this.state.token,
                "X-CSRFTOKEN": cookie.load("csrftoken")
            }
        })
    }
    getPeople = () => {
        return axios.get('/people/',
            {
                headers: {
                    Authorization: 'Token ' + this.state.token,
                    "X-CSRFTOKEN": cookie.load("csrftoken")
                }
            })
    }
    setToken = (token, user) => {
        const editedUser = user
        if (!editedUser.avatar) {
            editedUser['avatar'] = {
                image: noAvatar
            }
        }
        this.setState({
            token: token,
            user: editedUser
        })
        cookie.save('token', token, {maxAge: 30 * 24 * 60 * 60})
    }
    logOut = () => {
        cookie.save('token', "", {maxAge: 1})
        this.setState({
            token: null
        })
        document.location.reload(true)
    }

    componentDidMount() {
        const token = cookie.load('token')
        if (token) {
            this.setState({token: token})
            cookie.save('token', token, {maxAge: 30 * 24 * 60 * 60})
            this.getUser(token)
        }
        this.setState({
            loading: false
        })
    }

    updateUser = (data, id) => {
        const validatedData = {}
        Object.keys(data).forEach((key) => {
            if (data[key]) validatedData[key] = data[key]
        });
        return axios.patch(`/users/${id}/`, validatedData, {
            headers: {
                Authorization: 'Token ' + this.state.token,
            }
        }).then(data => {
            const user = data.data
            if (!user.avatar) {
                user['avatar'] = {
                    image: noAvatar
                }
            }
            this.setState({
                user: user
            })
        }).catch(e => {
            if (e.response.status === 401) {
                this.logOut();
            }
        })
    }

    createGroup = (group) => {
        return axios.post(`/groups/`, group, {
            headers: {
                Authorization: 'Token ' + this.state.token,
                "X-CSRFTOKEN": cookie.load("csrftoken")
            }
        })
    }

    updateGroup = (group, id) => {
        return axios.patch(`/groups/${id}/`, group, {
            headers: {
                Authorization: 'Token ' + this.state.token,
                "X-CSRFTOKEN": cookie.load("csrftoken")
            }
        })
    }

    getMyGroups = () => {
        return axios.get('/my_groups/',
            {
                headers: {
                    Authorization: 'Token ' + this.state.token,
                    "X-CSRFTOKEN": cookie.load("csrftoken")
                }
            })
    }

    getGroups = () => {
        return axios.get('/groups/',
            {
                headers: {
                    Authorization: 'Token ' + this.state.token,
                    "X-CSRFTOKEN": cookie.load("csrftoken")
                }
            })
    }

    getGroup = (id) => {
        return axios.get(`/groups/${id}/`,
            {
                headers: {
                    Authorization: 'Token ' + this.state.token,
                    "X-CSRFTOKEN": cookie.load("csrftoken")
                }
            })
    }

    groupSubscribe = (id) => {
        return axios.post(`/my_groups/${id}/`, {},
            {
                headers: {
                    Authorization: 'Token ' + this.state.token,
                    "X-CSRFTOKEN": cookie.load("csrftoken")
                }
            })
    }

    groupUnsubscribe = (id) => {
        return axios.delete(`/my_groups/${id}/`,
            {
                headers: {
                    Authorization: 'Token ' + this.state.token,
                    "X-CSRFTOKEN": cookie.load("csrftoken")
                }
            })
    }

    render() {
        return this.state.token && !this.state.user ? <div></div> : <Switch>
            <Route exact path='/' component={Main}/>
            <Route exact path='/auth'>
                {!this.state.loading && this.state.token ? <Redirect to="/me"/> :
                    <Auth
                        auth={this.auth}
                        register={this.register}
                        token={this.state.token}
                        setToken={this.setToken}
                        imageUpload={this.imageUpload}
                    />
                }
            </Route>
            <PrivateRoute exact path={'/me'} tokenLoading={this.state.loading}
                          token={this.state.token}>
                <User token={this.state.token}
                      imageUpload={this.postImageUpload}
                      logOut={this.logOut}
                      deleteImage={this.postImageDelete}
                      links={this.state.navLinks}
                      updateUser={this.updateUser}
                      postImageUpload={this.postImageUpload}
                      deletePostImage={this.postImageDelete}
                      postAdd={this.postAdd}
                      getUser={this.getUser}
                      unshiftPostToUser={this.unshiftPostToUser}
                      user={this.state.user}/>
            </PrivateRoute>
            <PrivateRoute exact path={'/friends'} tokenLoading={this.state.loading}
                          token={this.state.token}>
                <Friends links={this.state.navLinks}
                         logOut={this.logOut}
                         getPeople={this.getPeople}
                         getFriends={this.getFriends}
                         sendFriendRequest={this.sendFriendRequest}
                         removeFromFriends={this.removeFromFriends}
                         user={this.state.user}/>
            </PrivateRoute>
            <PrivateRoute path={'/user/:id'} tokenLoading={this.state.loading}
                          token={this.state.token}>
                <User links={this.state.navLinks}
                      logOut={this.logOut}
                      getUser={this.getUser}
                      postAdd={this.postAdd}
                      sendFriendRequest={this.sendFriendRequest}
                      getUserById={this.getUserById}
                      postImageUpload={this.postImageUpload}
                      deletePostImage={this.postImageDelete}
                      removeFromFriends={this.removeFromFriends}
                      user={this.state.user}
                />
            </PrivateRoute>
            <PrivateRoute path={'/group/:id'} tokenLoading={this.state.loading}
                          token={this.state.token}>
                <Group
                    links={this.state.navLinks}
                    logOut={this.logOut}
                    user={this.state.user}
                    getGroup={this.getGroup}
                    imageUpload={this.postImageUpload}
                    groupPostAdd={this.groupPostAdd}
                    groupSubscribe={this.groupSubscribe}
                    deletePostImage={this.postImageDelete}
                    groupUnsubscribe={this.groupUnsubscribe}
                    updateGroup={this.updateGroup}
                    deleteImage={this.postImageDelete}
                />
            </PrivateRoute>
            <PrivateRoute exact path={'/groups'} tokenLoading={this.state.loading}
                          token={this.state.token}>
                <Groups
                    createGroup={this.createGroup}
                    links={this.state.navLinks}
                    logOut={this.logOut}
                    user={this.state.user}
                    imageUpload={this.postImageUpload}
                    imageDelete={this.postImageDelete}
                    getMyGroups={this.getMyGroups}
                    getGroups={this.getGroups}
                    groupSubscribe={this.groupSubscribe}
                    groupUnsubscribe={this.groupUnsubscribe}
                />
            </PrivateRoute>
        </Switch>
    }
}

export default App;

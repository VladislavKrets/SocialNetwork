import React from "react";
import MediaQuery from 'react-responsive'
import Button from "../../components/Button/Button";
import NavBar from "../../components/NavBar/NavBar";
import './User.css'
import Alert from "../../components/Alert/Alert";
import Input from "../../components/Input/Input";
import Photo from "../../components/Photo/Photo";
import PostPhoto from "../../components/PostPhoto/PostPhoto";
import PostPhotoSaved from "../../components/PostPhotoSaved/PostPhotoSaved";
import PhotoViewer from "../../components/PhotoViewer/PhotoViewer";
import {Link, withRouter} from 'react-router-dom'
import noAvatar from "../../img/no-avatar.png";
import editSvg from "../../img/edit.svg"

class User extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            data: {
                name: '',
                surname: '',
                country: '',
                city: '',
                birthday_date: '',
                are_posts_opened: true,
                avatar: null
            },
            currentPost: {
                text: '',
                images: []
            },
            editPostData: {
                text: '',
                images: []
            },
            currentUser: null,
            isPhotoDialogOpened: false,
            isEditDialogOpened: false,
            isRemoveDialogOpened: false,
            isRemoveFromFriendsDialogOpened: false,
            isPostEditDialogOpened: false,
            message: '',
            removeButtonName: '',
            currentPostId: null,
            currentImage: null,
            showAdditionalInfo: false,
            avatar: props.user.avatar
        }
    }

    componentDidMount() {
        this.props.getUser(null, (data) => {
            const currData = this.state.data
            currData.name = data.data.name
            currData.surname = data.data.surname
            currData.country = data.data.country
            currData.city = data.data.city
            currData.birthday_date = data.data.birthday_date
            currData.are_posts_opened = data.data.are_posts_opened
            this.setState({
                data: currData
            })
        })
        document.title = "Профиль"
        this.props.getUserById && this.getUserById()
    }

    changeShowAdditionalInfo = () => {
        this.setState({
            showAdditionalInfo: !this.state.showAdditionalInfo
        })
    }

    getUserById = () => {
        this.props.getUserById(this.props.match.params['id']).then(data => {
            document.title = data.data.name + " " + data.data.surname
            const user = data.data
            if (!user.avatar) {
                user['avatar'] = {
                    image: noAvatar
                }
            }
            this.setState({
                currentUser: user
            })
        })
    }

    onChangeEditDialogState = () => {
        this.setState({
            isEditDialogOpened: !this.state.isEditDialogOpened
        })
    }

    onChangeRemoveDialogState = (id) => {
        this.setState({
            isRemoveDialogOpened: !this.state.isRemoveDialogOpened,
            currentPostId: id
        })
    }

    onChangeEditPostDialogState = (id) => {
        const user = this.props.getUserById ? this.state.currentUser : this.props.user
        let post = this.state.editPostData;
        if (id) {
            post = user.posts.filter(x => x.id === id)[0]
        }
        const currentPostData = {}
        currentPostData.text = post.text
        currentPostData.images = post.images.filter(x => true)
        this.setState({
            isPostEditDialogOpened: !this.state.isPostEditDialogOpened,
            currentPostId: id,
            editPostData: currentPostData
        })
    }

    onChangeRemoveFromFriendsDialogState = (message, removeButtonName) => {
        this.setState({
            isRemoveFromFriendsDialogOpened: !this.state.isRemoveFromFriendsDialogOpened,
            message: message,
            removeButtonName: removeButtonName
        })
    }

    onChangePhotoDialogState = () => {
        this.setState({
            isPhotoDialogOpened: !this.state.isPhotoDialogOpened,
            currentImage: null
        })
    }

    handleImageChange = (e) => {
        const image = e.target.files[0];

        this.props.imageUpload(image, true).then(data => {
            const userData = this.state.data;
            userData.avatar = data.data.id;
            this.setState({
                avatar: data.data,
                data: userData,
            })
        }).catch(e => {

        })
    };
    handleUsualImageChange = (e) => {
        const image = e.target.files[0];
        this.props.imageUpload(image, true).then(data => {
            document.location.reload(true)
        }).catch(e => {

        })
    }
    handlePostImageChange = (e) => {
        const image = e.target.files[0];
        this.props.postImageUpload(image).then(data => {
            const post = this.state.currentPost
            post.images.push(data.data)
            this.setState({
                currentPost: post
            })
        }).catch(e => {

        })
    }
    handleEditPostImageChange = (e) => {
        const image = e.target.files[0];
        this.props.postImageUpload(image).then(data => {
            const post = this.state.editPostData
            post.images.push(data.data)
            this.setState({
                editPostData: post
            })
        }).catch(e => {

        })
    }
    handleChange = (e) => {
        const data = this.state.data;
        if (e.target.name === 'are_posts_opened') {
            data[e.target.name] = e.target.checked
        } else data[e.target.name] = e.target.value
        this.setState({
            data: data
        })
    }
    onWheel = e => {
        e.preventDefault();
        const container = document.getElementById("photo-gallery");
        const containerScrollPosition = document.getElementById("photo-gallery").scrollLeft;
        container.scrollTo({
            top: 0,
            left: containerScrollPosition + e.deltaY,
            behaviour: "smooth"
        });
    };

    onPostTextChangeListener = e => {
        const post = this.state.currentPost
        post.text = e.target.value;
        this.setState({
            currentPost: post
        })
    }

    onPostEditTextChangeListener = e => {
        const post = this.state.editPostData
        post.text = e.target.value;
        this.setState({
            editPostData: post
        })
    }

    onPostSave = () => {
        const post = this.state.currentPost;
        post.images = post.images.map(x => x.id)
        if (!(post.text === '' && post.images.length === 0)) {
            if (this.props.getUserById) post.receiver = this.state.currentUser.id
            this.props.postAdd(post).then(data => {
                if (this.props.getUserById) {
                    const user = this.state.currentUser;
                    user.posts.unshift(data.data)
                    this.setState({
                        currentUser: user
                    })
                } else {
                    this.props.unshiftPostToUser(data.data)
                }
                this.setState({
                    currentPost: {
                        text: '',
                        images: []
                    }
                })
            })
        }
    }

    onPostEdit = () => {
        const post = this.state.editPostData;
        post.images = post.images.map(x => x.id)
        if (!(post.text === '' && post.images.length === 0)) {
            if (this.props.getUserById) post.receiver = this.state.currentUser.id
            this.props.editUserPost(this.state.currentPostId, post).then(data => {
                if (this.props.getUserById) {
                    const user = this.state.currentUser;
                    user.posts = user.posts.map(x => {
                        if (x.id === data.data.id) return data.data
                        return x
                    })
                    this.setState({
                        currentUser: user
                    })
                } else {
                    this.props.changePostInUser(data.data)
                }
                this.setState({
                    editPostData: {
                        text: '',
                        images: []
                    }
                })
            })
        }
    }
    onPhotoClick = (image) => {
        this.setState({
            currentImage: image,
            isPhotoDialogOpened: true,
        })

    }

    removeFromFriends = (id) => {
        this.props.removeFromFriends(id).then(() => {
            const user = this.state.currentUser
            user.followed = false
            this.setState({
                currentUser: user
            })
        })

    }
    sendFriendRequest = (id) => {
        this.props.sendFriendRequest(id).then(() => {
            const user = this.state.currentUser
            user.followed = true
            this.setState({
                currentUser: user
            })
        })
    }

    handleKeyDown = (event) => {
        if (event.ctrlKey && event.key === "Enter") {
            this.onPostSave()
        }
    }

    handleEditKeyDown = (event) => {
        if (event.ctrlKey && event.key === "Enter") {
            this.onPostEdit()
            this.onChangeEditPostDialogState(null)
        }
    }

    dialogRedirect = () => {
        const user = this.state.currentUser
        if (user.dialog === null) {
            this.props.createDialog(this.state.currentUser.id).then(data => {
                window.open(`/dialog/${data.data.id}`, '_blank');
            })
        } else window.open(`/dialog/${user.dialog}`, '_blank');
    }

    onPostRemove = (id) => {
        this.props.removeUserPost(id).then(() => {
            if (this.props.getUserById) {
                const user = this.state.currentUser;
                user.posts = user.posts.filter(x => x.id !== id)
                this.setState({
                    currentUser: user
                })
            } else {
                this.props.removePostFromUser(id)
            }
        })
    }

    render() {
        const user = this.props.getUserById ? this.state.currentUser : this.props.user
        return <NavBar
            user={this.props.user}
            logOut={this.props.logOut}
            setCurrentLink={this.props.setCurrentLink}
            currentLink={this.props.currentLink}
            links={this.props.links}>
            {this.props.getUserById && !this.state.currentUser ? <div></div> : <div>
                {this.state.isEditDialogOpened &&
                <Alert style={{backgroundColor: '#f7faff', borderRadius: '12px',}} close={this.onChangeEditDialogState}>
                    <div className={'edit-user-alert'}>
                        <div style={{
                            textAlign: 'center',
                            fontSize: '1.2em',
                            color: '#3e7cb0',
                            fontWeight: 'bold',
                            paddingBottom: '12px'
                        }}>Редактирование профиля
                        </div>
                        <div style={{display: "flex", flexDirection: 'column', alignItems: 'center'}}>
                            <div>
                                Имя:
                            </div>
                            <Input
                                placeholder={'Name'}
                                style={{width: '300px'}}
                                name={'name'}
                                value={this.state.data.name}
                                onChange={this.handleChange}
                            />
                            <div>
                                Фамилия:
                            </div>
                            <Input
                                placeholder={'Surname'}
                                style={{width: '300px'}}
                                name={'surname'}
                                value={this.state.data.surname}
                                onChange={this.handleChange}
                            />
                            <div>
                                Страна:
                            </div>
                            <Input
                                placeholder={'Country'}
                                style={{width: '300px'}}
                                name={'country'}
                                value={this.state.data.country}
                                onChange={this.handleChange}
                            />
                            <div>
                                Город:
                            </div>
                            <Input
                                placeholder={'City'}
                                style={{width: '300px'}}
                                name={'city'}
                                value={this.state.data.city}
                                onChange={this.handleChange}
                            />
                            <div>
                                Дата рождения:
                            </div>
                            <Input
                                placeholder={'Birthday date'}
                                type={'date'}
                                style={{width: '300px'}}
                                name={'birthday_date'}
                                min={'1900-01-01'}
                                max={new Date().toDateString()}
                                value={this.state.data.birthday_date}
                                onChange={this.handleChange}
                            />
                            <div style={{padding: '5px 0px'}}>
                                <label>
                                    <input type={'checkbox'} checked={this.state.data.are_posts_opened}
                                           name={'are_posts_opened'} onChange={this.handleChange}/>
                                    Разрешить другим пользователям оставлять посты на этой странице
                                </label>
                            </div>
                            <div style={{display: 'flex', justifyContent: 'center'}}>
                                {this.state.avatar &&
                                <img className={'center-cropped'} src={this.state.avatar.image}/>}
                            </div>
                            <div style={{display: "flex"}}>
                                <label className='button' style={{
                                    width: '150px',
                                    textAlign: 'center'
                                }}>
                                    <input className={'image-button'} type="file"
                                           style={{display: "none"}}

                                           accept="image/png, image/jpeg" onChange={this.handleImageChange}/>
                                    Загрузить аватар
                                </label>
                                <Button style={{width: '150px',}} onClick={() => {
                                    this.props.deleteImage(this.state.avatar.id)
                                    this.setState({
                                        avatar: null
                                    })
                                }}>
                                    Удалить аватар
                                </Button>
                            </div>
                            <div>
                                <Button style={{backgroundColor: '#199912', color: '#f7faff', border: 'none'}}
                                        onClick={() => {
                                            this.props.updateUser(this.state.data, this.props.user.id).then(() => {
                                                this.onChangeEditDialogState()
                                            })
                                        }}>
                                    Сохранить
                                </Button>
                                <Button style={{backgroundColor: '#3e7cb0', color: '#f7faff', border: 'none'}}
                                        onClick={() => {
                                            this.setState({
                                                data: {
                                                    name: '',
                                                    surname: ''
                                                }
                                            })
                                            this.onChangeEditDialogState()
                                        }}>
                                    Отмена
                                </Button>
                            </div>
                        </div>
                    </div>
                </Alert>
                }
                {
                    this.state.isPostEditDialogOpened &&
                    <Alert style={{backgroundColor: '#f7faff', borderRadius: '12px',}}
                           close={() => this.onChangeEditPostDialogState(null)}>
                        <div className={'edit-post-user-alert'}>
                            <div style={{
                                textAlign: 'center',
                                fontSize: '1.2em',
                                color: '#3e7cb0',
                                fontWeight: 'bold',
                                paddingBottom: '12px'
                            }}>Редактирование поста
                            </div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                border: '1px solid black',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                padding: '3px'
                            }}>
                        <textarea value={this.state.editPostData.text} onKeyDown={this.handleEditKeyDown}
                                  onChange={this.onPostEditTextChangeListener}
                                  style={{
                                      width: '100%',
                                      height: '70px',
                                      resize: 'none',
                                      border: 'none',
                                      background: 'none',
                                      borderRadius: '4px',
                                      outline: 'none'
                                  }}
                                  placeholder={'Напишите здесь текст вашего поста и нажмите ctrl+enter'}/>
                            </div>

                            <div className={'post-photo-gallery'}>
                                {this.state.editPostData.images.map(item => {
                                    return <PostPhoto photo={item} delete={(id) => {
                                        this.props.deletePostImage(id).then(() => {
                                            const post = this.state.editPostData
                                            post.images = post.images.filter(x => x.id !== id)
                                            this.setState({
                                                editPostData: post
                                            })
                                        })
                                    }}/>
                                })}
                            </div>
                            <div style={{textAlign: 'right'}}>
                                <label className={'button desktop'}>
                                    <input className={'image-button'} type="file"
                                           style={{display: "none"}}
                                           value={''}
                                           accept="image/png, image/jpeg"
                                           onChange={this.handleEditPostImageChange}/>
                                    Прикрепить фото
                                </label>
                                <label className={'button mobile'}>
                                    <input className={'image-button'} type="file"
                                           style={{display: "none"}}
                                           value={''}
                                           accept="image/png, image/jpeg"
                                           onChange={this.handleEditPostImageChange}/>
                                    Фото
                                </label>
                                <Button style={{backgroundColor: '#199912', color: '#f7faff', border: 'none'}}
                                        onClick={() => {
                                            this.onPostEdit()
                                            this.onChangeEditPostDialogState(null)
                                        }}>
                                    Сохранить
                                </Button>
                                <Button style={{backgroundColor: '#3e7cb0', color: '#f7faff', border: 'none'}}
                                        onClick={() => this.onChangeEditPostDialogState(null)}>
                                    Отмена
                                </Button>
                            </div>
                        </div>
                    </Alert>

                }
                {
                    this.state.isPhotoDialogOpened ?
                        <Alert close={this.onChangePhotoDialogState}>
                            <PhotoViewer photo={this.state.currentImage}/>
                        </Alert>
                        : null
                }
                {
                    this.state.isRemoveDialogOpened ?
                        <Alert style={{backgroundColor: '#f7faff', borderRadius: '12px',}}
                               close={() => {
                                   this.onChangeRemoveDialogState(null)
                               }}>
                            <div style={{
                                width: '300px',
                                borderRadius: '12px',
                                backgroundColor: '#f7faff'
                            }}>
                                <div style={{padding: '20px 12px', wordBreak: 'break-word', textAlign: 'center'}}>
                                    Вы действительно хотите удалить данный пост?
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
                                        this.onPostRemove(this.state.currentPostId)
                                        this.onChangeRemoveDialogState(null)
                                    }}>
                                        Удалить
                                    </div>
                                    <div style={{
                                        width: '50%',
                                        textAlign: 'center',
                                        padding: '12px 0',
                                        color: '#3e7cb0',
                                        cursor: 'pointer'
                                    }} onClick={() => {
                                        this.onChangeRemoveDialogState(null)
                                    }}>
                                        Отмена
                                    </div>
                                </div>
                            </div>
                        </Alert>
                        : null
                }
                {
                    this.state.isRemoveFromFriendsDialogOpened ?
                        <Alert style={{backgroundColor: '#f7faff', borderRadius: '12px',}}
                               close={() => {
                                   this.onChangeRemoveFromFriendsDialogState('', '')
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
                                        this.removeFromFriends(this.state.currentUser.id)
                                        this.onChangeRemoveFromFriendsDialogState('', '')
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
                                        this.onChangeRemoveFromFriendsDialogState('', '')
                                    }}>
                                        Отмена
                                    </div>
                                </div>
                            </div>
                        </Alert>
                        : null
                }
                <div className={'user-center-container'}>
                    <div style={{display: "flex", paddingTop: '5px'}}>
                        <div>
                            <img className={'center-cropped user-main-avatar'}
                                 src={user.avatar.image}/>
                        </div>
                        <div style={{display: "flex", alignItems: "center"}}>
                            <div className={'user-name-main-block'}>
                                <div>
                                    {user.name}
                                </div>
                                <div>
                                    {user.surname}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {this.props.user.id !== user.id &&
                <div className={'user-center-container'} style={{marginTop: '30px', marginBottom: '30px'}}>
                    {this.state.currentUser.followed && this.state.currentUser.followed_you ?
                        <div className={'user-followed-block'}>
                            <div style={{textAlign: 'center', paddingBottom: '15px'}}>✔ Друзья</div>
                            <span
                                onClick={(e) => {
                                    e.stopPropagation()
                                    this.onChangeRemoveFromFriendsDialogState("Вы действительно хотите " +
                                        "удалить данного пользователя из друзей?",
                                        "Удалить")
                                }}
                                style={{
                                    color: 'red',
                                    fontSize: '1em',
                                    cursor: 'pointer',
                                    borderBottom: '1px solid red',
                                }}>Удалить из друзей
                            </span>

                        </div> : this.state.currentUser.followed && !this.state.currentUser.followed_you ?
                            <div className={'user-followed-block'}>
                                <div style={{paddingBottom: '15px'}}>✔ Вы подписаны</div>
                                <span
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        this.onChangeRemoveFromFriendsDialogState("Вы действительно хотите " +
                                            "отписаться от данного пользователя?",
                                            "Отписаться")
                                    }}
                                    style={{
                                        color: 'red',
                                        fontSize: '1em',
                                        cursor: 'pointer',
                                        borderBottom: '1px solid red',
                                    }}>Отписаться
                                </span>
                            </div> : !this.state.currentUser.followed && this.state.currentUser.followed_you ?
                                <div className={'user-followed-block'} style={{
                                    cursor: 'pointer',
                                    color: 'antiquewhite',
                                    backgroundColor: '#36965d',
                                    borderRadius: '5px 10px',
                                    padding: '5px 15px',
                                }} onClick={e => {
                                    e.stopPropagation();
                                    this.sendFriendRequest(this.state.currentUser.id)
                                }
                                }>
                                    Добавить в друзья
                                </div> :
                                <div className={'user-followed-block'} style={{
                                    cursor: 'pointer',
                                    backgroundColor: '#36965d',
                                    color: 'antiquewhite',
                                    borderRadius: '5px 10px',
                                    padding: '5px 15px',
                                }} onClick={e => {
                                    e.stopPropagation();
                                    this.sendFriendRequest(this.state.currentUser.id)
                                }
                                }>
                                    Подписаться
                                </div>
                    }
                </div>
                }
                <div className={'user-center-container user-button-main-bar'}>
                    <span className={'button-span desktop'} style={{marginRight: '5px'}}
                          onClick={this.changeShowAdditionalInfo}>
                        Дополнительная информация</span>
                    <span className={'button-span mobile'} style={{marginRight: '5px'}}
                          onClick={this.changeShowAdditionalInfo}>
                        Дополнительно</span>
                    {this.props.user.id === user.id &&
                    <span className={'button-span'} onClick={this.onChangeEditDialogState}>Редактировать</span>}
                    {this.props.user.id !== user.id &&
                    <span className={'button-span desktop'} onClick={this.dialogRedirect}>Написать сообщение</span>}
                    {this.props.user.id !== user.id &&
                    <span className={'button-span mobile'} onClick={this.dialogRedirect}>Написать</span>}
                </div>
                {
                    this.state.showAdditionalInfo && <div className={'user-center-container'}>
                        <table className={'additional-info-table'}>
                            <tr>
                                <td>
                                    Страна:
                                </td>
                                <td>
                                    {user.country ? user.country : 'Не указано'}
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    Город:
                                </td>
                                <td>
                                    {user.city ? user.city : 'Не указано'}
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    Дата рождения:
                                </td>
                                <td>
                                    {user.birthday_date ? user.birthday_date : 'Не указано'}
                                </td>
                            </tr>
                        </table>
                    </div>
                }
                <div className={'user-center-container'}>
                    <span style={{color: '#3e7cb0', fontWeight: 'bold', fontSize: '1.2em'}}>Мои фото</span>
                </div>
                <div className={'user-center-container'}>
                    <div id='photo-gallery' className={'photo-gallery user-in-block'}
                         style={this.props.getUserById && this.props.user.id !== user.id && user.photos.length === 0 ? {
                             justifyContent: 'center'
                         } : {}}
                         onWheel={user.photos.length !== 0 ? this.onWheel : null}
                         onMouseOver={user.photos.length !== 0 ? () => {
                             document.body.style.overflow = 'hidden';
                         } : null} onMouseOut={user.photos.length !== 0 ? () => {
                        document.body.style.overflow = 'auto';
                    } : null}>
                        {this.props.user.id === user.id &&
                        <label className={'user-photo-add'}>
                            <input className={'image-button'} type="file"
                                   style={{display: "none"}}

                                   accept="image/png, image/jpeg" onChange={this.handleUsualImageChange}/>
                            +
                        </label>}
                        {user.photos.length === 0 &&
                        <div className={'user-no-photo-block'}>
                            Ни одного фото еще не добавлено
                        </div>
                        }
                        {user.photos && user.photos.map(item => {
                            return <Photo photo={item} onClick={this.onPhotoClick}/>
                        })}
                        <div style={{width: '1px', minWidth: '1px'}}></div>
                    </div>
                </div>
                <div className={'user-center-container'}>
                    <span style={{color: '#3e7cb0', fontWeight: 'bold', fontSize: '1.2em'}}>Мои записи</span>
                </div>
                {(this.props.user.id === user.id || user.are_posts_opened) &&
                <div className={'user-center-container'}>
                    <div className={'user-in-block'} style={{
                        backgroundColor: '#3e7cb0',
                        borderRadius: '7px',
                        padding: '15px',

                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center'
                        }}>
                        <textarea value={this.state.currentPost.text} onKeyDown={this.handleKeyDown}
                                  onChange={this.onPostTextChangeListener}
                                  style={{
                                      width: '100%',
                                      height: '70px',
                                      resize: 'none',
                                      border: 'none',
                                      borderRadius: '4px',
                                      outline: 'none'
                                  }}
                                  placeholder={'Напишите здесь текст вашего поста и нажмите ctrl+enter'}/>
                        </div>

                        <div className={'post-photo-gallery'}>
                            {this.state.currentPost.images.map(item => {
                                return <PostPhoto photo={item} delete={(id) => {
                                    this.props.deletePostImage(id).then(() => {
                                        const post = this.state.currentPost
                                        post.images = post.images.filter(x => x.id !== id)
                                        this.setState({
                                            currentPost: post
                                        })
                                    })
                                }}/>
                            })}
                        </div>
                        <div style={{textAlign: 'right'}}>
                            <label className={'button'}>
                                <input className={'image-button'} type="file"
                                       style={{display: "none"}}
                                       value={''}
                                       accept="image/png, image/jpeg" onChange={this.handlePostImageChange}/>
                                Прикрепить фото
                            </label>
                            <Button onClick={this.onPostSave}>
                                Отправить
                            </Button>
                        </div>
                    </div>
                </div>
                }
                {
                    user.posts.length === 0 &&
                    <div className={'user-center-container'} style={{marginTop: '30px', marginBottom: '30px'}}>
                        Ни одного поста не было добавлено
                    </div>
                }
                {
                    user.posts.map(item => {
                        let images = item.images
                        let user_item = item.user
                        if (!user_item.avatar) {
                            user_item['avatar'] = {
                                image: noAvatar
                            }
                        }
                        const date = new Date(item.date)
                        const curr_date = date.getDate();
                        const curr_month = date.getMonth() + 1;
                        const curr_year = date.getFullYear();
                        const curr_hours = date.getHours()
                        const curr_minutes = date.getMinutes()
                        const curr_seconds = date.getSeconds()
                        return images.map &&
                            <div className={'user-center-container'}
                                 style={{marginTop: '30px', marginBottom: '30px'}}>
                                <Link target="_blank" to={`/post/${item.id}`} className={'post-wrapper user-in-block'}
                                      style={{color: 'black', textDecoration: 'none'}}
                                      onClick={() => this.props.getCurrentUserPost(item.id)}>
                                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                        <div>
                                            <Link target="_blank"
                                                  style={{
                                                      textDecoration: 'none'
                                                  }}
                                                  onClick={e => {
                                                      e.stopPropagation()
                                                  }}
                                                  to={`/user/${user_item.id}`}>
                                                <div className={'user-post-avatar'}>
                                                    <div style={{paddingRight: '7px'}}>
                                                        <img className={'center-cropped'}
                                                             style={{width: '60px', height: '60px'}}
                                                             src={user_item.avatar.image}/>
                                                    </div>
                                                    <span style={{paddingRight: '7px'}}>{user_item.name}</span>
                                                    <span style={{paddingRight: '7px'}}>{user_item.surname}</span>
                                                </div>
                                            </Link>
                                            <span className={'mobile'} style={{fontSize: '0.7em',
                                                paddingLeft: '12px'}}>
                                                {(curr_hours < 10 ? "0" + curr_hours : curr_hours)
                                                + ":" + (curr_minutes < 10 ? "0" + curr_minutes : curr_minutes)
                                                + ":" + (curr_seconds < 10 ? "0" + curr_seconds : curr_seconds)
                                                + " " + (curr_date < 10 ? "0" + curr_date : curr_date)
                                                + "-" + (curr_month < 10 ? "0" + curr_month : curr_month)
                                                + "-" + curr_year}

                                            </span>
                                        </div>
                                        <span style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            color: 'grey',
                                            paddingRight: '20px',
                                        }}>
                                            <span className={'desktop'} style={{padding: '5px'}}>
                                                {(curr_hours < 10 ? "0" + curr_hours : curr_hours)
                                                + ":" + (curr_minutes < 10 ? "0" + curr_minutes : curr_minutes)
                                                + ":" + (curr_seconds < 10 ? "0" + curr_seconds : curr_seconds)
                                                + " " + (curr_date < 10 ? "0" + curr_date : curr_date)
                                                + "-" + (curr_month < 10 ? "0" + curr_month : curr_month)
                                                + "-" + curr_year}

                                            </span>
                                            {user_item.id === this.props.user.id &&
                                            <span style={{padding: '0 12px', cursor: 'pointer'}} onClick={e => {
                                                e.stopPropagation()
                                                e.preventDefault()
                                                this.onChangeEditPostDialogState(item.id)
                                            }}>
                                                <img src={editSvg} style={{height: '12px'}}/>
                                            </span>
                                            }
                                            {(user.id === this.props.user.id || user_item.id === this.props.user.id) &&
                                            <span style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                color: 'red',
                                                cursor: 'pointer',
                                                fontSize: '1.2em',
                                                fontWeight: 'bold',
                                                padding: '0 5px',
                                                paddingBottom: '3px'
                                            }} onClick={e => {
                                                this.onChangeRemoveDialogState(item.id)
                                                e.stopPropagation()
                                                e.preventDefault()
                                            }}>
                                                x
                                            </span>}
                                        </span>
                                    </div>
                                    <div style={{padding: '12px', wordBreak: 'break-word'}}>{item.text}</div>
                                    <div className={'post-photo-gallery'} style={{justifyContent: 'center'}}>
                                        {images && images.map(item => {
                                            return <PostPhotoSaved onClick={this.onPhotoClick} photo={item}/>
                                        })}
                                    </div>
                                    <div style={{textAlign: 'right', padding: '12px'}}>
                                        <span style={{color: '#3e7cb0', fontWeight: 'bold'}}>Комментариев: </span>
                                        <span>{item.comments_count}</span>
                                    </div>
                                </Link>
                            </div>
                    })
                }
            </div>
            }
        </NavBar>
    }
}

export default withRouter(User)
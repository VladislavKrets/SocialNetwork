import React from "react";
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
            currentUser: null,
            isPhotoDialogOpened: false,
            isEditDialogOpened: false,
            isRemoveDialogOpened: false,
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
            links={this.props.links}>
            {this.props.getUserById && !this.state.currentUser ? <div></div> : <div>
                {this.state.isEditDialogOpened &&
                <Alert close={this.onChangeEditDialogState}>
                    <div style={{width: '600px', padding: '12px', borderRadius: '7px', backgroundColor: '#d5dde6'}}>
                        <div style={{display: 'flex', flexDirection: 'row-reverse'}}><span
                            style={{color: '#3e7cb0', fontWeight: 'bold', fontSize: '2em', cursor: 'pointer'}}
                            onClick={this.onChangeEditDialogState}>X</span></div>
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
                                <Button onClick={() => {
                                    this.props.updateUser(this.state.data, this.props.user.id).then(() => {
                                        this.onChangeEditDialogState()
                                    })
                                }}>
                                    Сохранить
                                </Button>
                                <Button onClick={() => {
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
                                <div style={{padding: '12px', wordBreak: 'break-word', textAlign: 'center'}}>
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
                <div className={'user-center-container'}>
                    <div style={{display: "flex", paddingTop: '5px'}}>
                        <div>
                            <img className={'center-cropped'} style={{width: '300px', height: '300px'}}
                                 src={user.avatar.image}/>
                        </div>
                        <div style={{display: "flex", alignItems: "center"}}>
                            <div style={{fontSize: '2em', color: '#3e7cb0', paddingLeft: '12px', fontWeight: 'bold'}}>
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
                        <div style={{
                            fontWeight: 'bold',
                            color: '#36965d',
                            textAlign: 'center',
                            fontSize: '1.2em'
                        }}>
                            <div style={{textAlign: 'center', paddingBottom: '15px'}}>✔ Друзья</div>
                            <span
                                onClick={(e) => {
                                    e.stopPropagation()
                                    this.removeFromFriends(this.state.currentUser.id)
                                }}
                                style={{
                                    color: 'red',
                                    fontSize: '1em',
                                    cursor: 'pointer',
                                    borderBottom: '1px solid red',
                                }}>Удалить из друзей
                            </span>

                        </div> : this.state.currentUser.followed && !this.state.currentUser.followed_you ?
                            <div style={{
                                color: '#36965d',
                                textAlign: 'center',
                                fontSize: '1.2em',
                                fontWeight: 'bold'
                            }}>
                                <div style={{paddingBottom: '15px'}}>✔ Вы подписаны</div>
                                <span
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        this.removeFromFriends(this.state.currentUser.id)
                                    }}
                                    style={{
                                        color: 'red',
                                        fontSize: '1em',
                                        cursor: 'pointer',
                                        borderBottom: '1px solid red',
                                    }}>Отписаться
                                </span>
                            </div> : !this.state.currentUser.followed && this.state.currentUser.followed_you ?
                                <div style={{
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    backgroundColor: '#36965d',
                                    color: 'antiquewhite',
                                    borderRadius: '5px 10px',
                                    fontSize: '1.2em',
                                    padding: '5px 15px',
                                    textAlign: 'center',
                                }} onClick={e => {
                                    e.stopPropagation();
                                    this.sendFriendRequest(this.state.currentUser.id)
                                }
                                }>
                                    Добавить в друзья
                                </div> :
                                <div style={{
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    backgroundColor: '#36965d',
                                    color: 'antiquewhite',
                                    borderRadius: '5px 10px',
                                    fontSize: '1.2em',
                                    padding: '5px 15px',
                                    textAlign: 'center',
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
                <div className={'user-center-container'}>
                    <span className={'button-span'} style={{marginRight: '5px'}}
                          onClick={this.changeShowAdditionalInfo}>
                        Дополнительная информация</span>
                    {this.props.user.id === user.id &&
                    <span className={'button-span'} onClick={this.onChangeEditDialogState}>Редактировать</span>}
                    {this.props.user.id !== user.id &&
                    <span className={'button-span'} onClick={this.dialogRedirect}>Написать сообщение</span>}
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
                    <div id='photo-gallery' className={'photo-gallery'}
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
                        <label className={'user-photo-add'}
                               style={{
                                   width: '300px',
                                   height: '300px',
                                   minWidth: '300px',
                                   borderRadius: '3px',
                                   backgroundColor: 'white',
                                   display: "flex",
                                   justifyContent: "center",
                                   alignItems: "center",
                                   fontSize: '8em',
                                   color: '#3e7cb0',
                                   fontWeight: 'bold',
                                   cursor: 'pointer',
                                   marginRight: '20px'
                               }}>
                            <input className={'image-button'} type="file"
                                   style={{display: "none"}}

                                   accept="image/png, image/jpeg" onChange={this.handleUsualImageChange}/>
                            +
                        </label>}
                        {user.photos.length === 0 &&
                        <div style={{
                            height: '300px',
                            display: 'flex',
                            alignItems: 'center',
                            color: 'antiquewhite',
                            fontSize: '1.2em',
                            fontWeight: 'bold'
                        }}>
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
                    <div style={{
                        width: '1000px',
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
                                  placeholder={'Напишите здесь текст вашего поста инажмите ctrl+enter'}/>
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
                            <Button>
                                <label><input className={'image-button'} type="file"
                                              style={{display: "none"}}
                                              value={''}
                                              accept="image/png, image/jpeg" onChange={this.handlePostImageChange}/>
                                    Прикрепить фото</label>
                            </Button>
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
                        let user = item.user
                        if (!user.avatar) {
                            user['avatar'] = {
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
                                <Link target="_blank" to={`/post/${item.id}`} className={'post-wrapper'}
                                      style={{width: '1000px', color: 'black', textDecoration: 'none'}}
                                      onClick={() => this.props.getCurrentUserPost(item.id)}>
                                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                        <Link target="_blank"
                                              style={{
                                                  textDecoration: 'none'
                                              }}
                                              onClick={e => {
                                                  e.stopPropagation()
                                              }}
                                              to={`/user/${user.id}`}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                padding: '12px',
                                                fontSize: '1.2em',
                                                color: '#3e7cb0',
                                                fontWeight: 'bold'
                                            }}>
                                                <div style={{paddingRight: '7px'}}>
                                                    <img className={'center-cropped'}
                                                         style={{width: '60px', height: '60px'}}
                                                         src={user.avatar.image}/>
                                                </div>
                                                <span style={{paddingRight: '7px'}}>{user.name}</span>
                                                <span style={{paddingRight: '7px'}}>{user.surname}</span>
                                            </div>
                                        </Link>
                                        <span style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            color: 'grey',
                                            paddingRight: '20px',
                                        }}>
                                            <span style={{padding: '5px'}}>
                                                {(curr_hours < 10 ? "0" + curr_hours : curr_hours)
                                                + ":" + (curr_minutes < 10 ? "0" + curr_minutes : curr_minutes)
                                                + ":" + (curr_seconds < 10 ? "0" + curr_seconds : curr_seconds)
                                                + " " + (curr_date < 10 ? "0" + curr_date : curr_date)
                                                + "-" + (curr_month < 10 ? "0" + curr_month : curr_month)
                                                + "-" + curr_year}

                                            </span>
                                            {user.id === this.props.user.id &&
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
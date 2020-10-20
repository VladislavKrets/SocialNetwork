import NavBar from "../../components/NavBar/NavBar";
import {withRouter} from "react-router";
import React from "react";
import PostPhoto from "../../components/PostPhoto/PostPhoto";
import Button from "../../components/Button/Button";
import PostPhotoSaved from "../../components/PostPhotoSaved/PostPhotoSaved";
import noAvatar from "../../img/no-avatar.png";
import noGroupAvatar from "../../img/no-image-group.jpg";
import Alert from "../../components/Alert/Alert";
import PhotoViewer from "../../components/PhotoViewer/PhotoViewer";
import Input from "../../components/Input/Input";
import {Link} from "react-router-dom";
import './Group.css'

class Group extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            group: null,
            currentPost: {
                group: this.props.match.params['id'],
                text: '',
                images: [],
                is_from_group_name: false,
            },
            groupData: {
                avatar_image: null,
                name: '',
                are_posts_opened: false
            },
            avatar: null,
            isPhotoDialogOpened: false,
            currentImage: null,
            isEditDialogOpened: false,
            isSubscribersDialogOpened: false
        }
    }

    getGroup = () => {
        this.props.getGroup(this.props.match.params['id']).then((data) => {
            const group = data.data;
            if (!group.avatar_image) {
                group.avatar_image = {image: noGroupAvatar}
            }
            const groupData = this.state.groupData
            groupData.are_posts_opened = group.are_posts_opened
            this.setState({
                group: group,
                avatar: data.data.avatar_image,
                groupData: groupData
            })
            document.title = data.data.name
        })
    }

    componentDidMount() {
        this.getGroup();
    }

    onChangeEditDialogState = () => {
        this.setState({
            isEditDialogOpened: !this.state.isEditDialogOpened
        })
    }

    onChangeSubscribeDialogState = () => {
        this.setState({
            isSubscribersDialogOpened: !this.state.isSubscribersDialogOpened
        })
    }

    handlePostImageChange = (e) => {
        const image = e.target.files[0];
        this.props.imageUpload(image).then(data => {
            const post = this.state.currentPost
            post.images.push(data.data)
            this.setState({
                currentPost: post
            })
        }).catch(e => {

        })
    }
    handleImageChange = (e) => {
        const image = e.target.files[0];
        const groupData = this.state.groupData;
        this.props.imageUpload(image).then(data => {
            groupData.avatar_image = data.data.id
            this.setState({
                avatar: data.data,
                groupData: groupData
            })
        }).catch(e => {

        })
    }
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
        if (post.text !== '') {
            this.props.groupPostAdd(post).then(data => {
                const group = this.state.group;
                group.posts.unshift(data.data)
                this.setState({
                    group: group,
                    currentPost: {
                        group: this.props.match.params['id'],
                        text: '',
                        images: [],
                        is_from_group_name: false
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

    groupSubscribe = (id) => {
        this.props.groupSubscribe(id).then(() => {
            const group = this.state.group;
            group.is_subscribed = true
            group.subscribers.unshift(this.props.user)
            this.setState({
                group: group
            })
        })
    }
    updateGroup = () => {
        const data = {}
        Object.keys(this.state.groupData).forEach(key => {
            if (!(this.state.groupData[key] === null
                || this.state.groupData[key] === undefined
                || this.state.groupData[key] === '')) data[key] = this.state.groupData[key]
        })
        if (this.state.avatar == null) data.avatar_image = null
        this.props.updateGroup(data, this.props.match.params['id']).then((data) => {
            const group = data.data
            if (!group.avatar_image) {
                group.avatar_image = {image: noGroupAvatar}
            }
            this.setState({
                group: group,
                groupData: {
                    avatar_image: null,
                    name: '',
                },
                currentImage: null,
                isEditDialogOpened: false
            })

        })
    }
    groupUnsubscribe = (id) => {
        this.props.groupUnsubscribe(id).then(() => {
            const group = this.state.group;
            group.is_subscribed = false
            group.subscribers = group.subscribers.filter(x => x.id !== this.props.user.id)
            this.setState({
                group: group
            })
        })
    }
    handleChange = (e) => {
        const groupData = this.state.groupData;
        if (e.target.name === 'are_posts_opened') {
            groupData[e.target.name] = e.target.checked
        } else groupData[e.target.name] = e.target.value
        this.setState({
            groupData: groupData
        })
    }
    onPostNamingChangeListener = (e) => {
        const post = this.state.currentPost;
        post.is_from_group_name = e.target.checked
        this.setState({
            currentPost: post
        })
    }

    onWheel = e => {
        e.preventDefault();
        const container = document.getElementById("friends-gallery");
        const containerScrollPosition = document.getElementById("friends-gallery").scrollTop;
        container.scrollTo({
            top: 0,
            left: containerScrollPosition + e.deltaX,
            behaviour: "smooth"
        });
    };

    render() {
        const emptyDivArray = []
        for (let i = 0; i < 5; i++) {
            emptyDivArray.push(i)
        }
        return <NavBar
            user={this.props.user}
            logOut={this.props.logOut}
            links={this.props.links}>
            {this.state.group &&
            <>
                {
                    this.state.isPhotoDialogOpened ?
                        <Alert close={this.onChangePhotoDialogState}>
                            <PhotoViewer photo={this.state.currentImage}/>
                        </Alert>
                        : null
                }
                {this.state.isEditDialogOpened &&
                <Alert close={this.onChangeEditDialogState}>
                    <div style={{width: '600px', padding: '12px', borderRadius: '7px', backgroundColor: '#d5dde6'}}>
                        <div style={{display: 'flex', flexDirection: 'row-reverse'}}><span
                            style={{color: '#3e7cb0', fontWeight: 'bold', fontSize: '2em', cursor: 'pointer'}}
                            onClick={this.onChangeEditDialogState}>X</span></div>
                        <div style={{display: "flex", flexDirection: 'column', alignItems: 'center'}}>
                            <Input
                                placeholder={'Name'}
                                style={{width: '300px'}}
                                name={'name'}
                                value={this.state.groupData.name}
                                onChange={this.handleChange}
                            />
                            <div style={{padding: '5px 0px'}}>
                                <label>
                                    <input type={'checkbox'} checked={this.state.groupData.are_posts_opened}
                                           name={'are_posts_opened'} onChange={this.handleChange}/>
                                    Разрешить другим пользователям оставлять посты в этой группе
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
                                <Button onClick={this.updateGroup}>
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
                    this.state.isSubscribersDialogOpened &&
                    <Alert close={this.onChangeSubscribeDialogState}>
                        <div style={{
                            padding: '12px 0px',
                            borderRadius: '7px',
                            backgroundColor: '#d5dde6',
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '0 12px'
                            }}>
                                <span style={{color: '#3e7cb0', fontWeight: 'bold', fontSize: '1.2em'}}>Подписчики</span>
                                <span
                                    style={{color: '#3e7cb0', fontWeight: 'bold', fontSize: '2em', cursor: 'pointer'}}
                                    onClick={this.onChangeSubscribeDialogState}>X</span>
                            </div>
                            <div id="friends-gallery" style={{
                                width: '1000px',
                                height: '600px',
                                padding: '0 12px',
                                overflowY: 'scroll'
                            }}>
                                <div style={{display: 'flex'}}>
                                    <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between'}}>
                                        {
                                            this.state.group.subscribers.map(user => {
                                                return <Link target="_blank" to={`/user/${user.id}`}
                                                             style={{textDecoration: 'none'}}>
                                                    <div style={{padding: '12px', cursor: 'pointer',}}>
                                                        <div>
                                                            <img className={'center-cropped'}
                                                                 style={{width: '200px', height: '200px'}}
                                                                 src={user.avatar.image}/>
                                                        </div>
                                                        <div style={{
                                                            fontSize: '1em',
                                                            color: '#3e7cb0',
                                                            paddingLeft: '12px',
                                                            fontWeight: 'bold',
                                                            textAlign: 'center'
                                                        }}>
                                                    <span style={{paddingRight: '4px'}}>
                                                        {user.name}
                                                    </span>
                                                            <span>
                                                        {user.surname}
                                                    </span>
                                                        </div>
                                                    </div>
                                                </Link>
                                            })
                                        }

                                        {
                                            emptyDivArray.map(x => {
                                                return <div>
                                                </div>
                                            })
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Alert>
                }
                <div className={'user-center-container'}>
                    <div style={{display: "flex", paddingTop: '5px'}}>
                        <div>
                            <img className={'center-cropped'} style={{width: '300px', height: '300px'}}
                                 src={this.state.group.avatar_image.image}/>
                        </div>
                        <div style={{display: "flex", alignItems: "center"}}>
                            <div style={{fontSize: '2em', color: '#3e7cb0', paddingLeft: '12px', fontWeight: 'bold'}}>
                                <div>
                                    {this.state.group.name}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {this.props.user.id === this.state.group.creator &&
                <div className={'user-center-container'} style={{marginTop: '30px', marginBottom: '30px'}}>
                    <div style={{
                        color: '#36965d',
                        fontSize: '1.2em',
                        fontWeight: "bold",
                        paddingBottom: '15px',
                        textAlign: 'center'
                    }}>
                        Вы администратор данного сообщества
                    </div>
                </div>
                }
                <div className={'user-center-container'} style={{marginTop: '30px', marginBottom: '30px'}}>
                    {!this.state.group.is_subscribed ?
                        <div style={{
                            cursor: 'pointer',
                            backgroundColor: '#36965d',
                            width: '210px',
                            fontWeight: 'bold',
                            color: 'antiquewhite',
                            borderRadius: '5px 10px',
                            fontSize: '1.2em',
                            padding: '5px 15px',
                            textAlign: 'center',
                        }} onClick={e => {
                            e.stopPropagation();
                            this.groupSubscribe(this.state.group.id)
                        }
                        }>
                            Подписаться
                        </div>
                        :
                        <div style={{textAlign: 'center'}}>
                            <div style={{
                                color: '#36965d',
                                fontSize: '1.2em',
                                fontWeight: "bold",
                                paddingBottom: '15px'
                            }}>
                                ✔ Вы подписаны
                            </div>
                            <span
                                onClick={(e) => {
                                    e.stopPropagation()
                                    this.groupUnsubscribe(this.state.group.id)
                                }}
                                style={{
                                    color: 'red',
                                    fontSize: '1.2em',
                                    fontWeight: "bold",
                                    cursor: 'pointer',
                                    borderBottom: '1px solid red',
                                }}>Отписаться
                            </span>
                        </div>
                    }
                </div>

                <div className={'user-center-container'} style={{marginTop: '30px', marginBottom: '30px'}}>
                    <span className={'button-span'} style={{marginRight: '5px'}}>Дополнительная информация</span>
                    {this.state.group.creator === this.props.user.id &&
                    <span className={'button-span'} onClick={this.onChangeEditDialogState}>Редактировать</span>}
                </div>

                <div className={'user-center-container'} style={{marginTop: '30px', marginBottom: '30px'}}>
                    <div style={{
                        width: '1000px',
                        backgroundColor: '#3e7cb0',
                        borderRadius: '7px',
                        padding: '12px',
                    }}>
                        <div style={{display: 'flex', justifyContent: 'space-between'}}>
                            <span style={{color: 'antiquewhite', fontWeight: 'bold'}}>Подписчики</span>
                            <span style={{
                                color: 'antiquewhite',
                                borderBottom: '1px solid antiquewhite',
                                cursor: 'pointer'
                            }} onClick={this.onChangeSubscribeDialogState}>
                                Смотреть всех
                            </span>
                        </div>
                        <div style={{display: 'flex', overflow: 'hidden', justifyContent: 'space-between'}}>
                            {this.state.group.subscribers.slice(0, 4).map(item => {
                                const user = item
                                if (!user.avatar) {
                                    user['avatar'] = {
                                        image: noAvatar
                                    }
                                }
                                return <Link target="_blank" to={`/user/${user.id}`} style={{textDecoration: 'none'}}>
                                    <div style={{padding: '12px', cursor: 'pointer'}}>
                                        <div>
                                            <img className={'center-cropped'} style={{width: '200px', height: '200px'}}
                                                 src={user.avatar.image}/>
                                        </div>
                                        <div style={{
                                            fontSize: '1em',
                                            color: 'antiquewhite',
                                            paddingLeft: '12px',
                                            fontWeight: 'bold',
                                            textAlign: 'center'
                                        }}>
                                        <span style={{paddingRight: '4px'}}>
                                            {user.name}
                                        </span>
                                            <span>
                                            {user.surname}
                                        </span>
                                        </div>
                                    </div>
                                </Link>
                            })}
                            {
                                emptyDivArray.concat(emptyDivArray).map(x => {
                                    return <div>
                                    </div>
                                })
                            }
                        </div>
                    </div>
                </div>

                {(this.state.group.creator === this.props.user.id || this.state.group.are_posts_opened)
                && <div className={'user-center-container'}>
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
                        <textarea value={this.state.currentPost.text} onChange={this.onPostTextChangeListener}
                                  style={{
                                      width: '100%',
                                      height: '70px',
                                      resize: 'none',
                                      border: 'none',
                                      borderRadius: '4px',
                                      outline: 'none'
                                  }}
                                  placeholder={'Напишите здесь текст вашего поста'}/>
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
                        {this.state.group.creator === this.props.user.id &&
                        <div style={{padding: '5px 0px', color: 'antiquewhite',}}>
                            <label>
                                <input type={'checkbox'} checked={this.state.currentPost.is_from_group_name}
                                       name={'are_posts_opened'} onChange={this.onPostNamingChangeListener}/>
                                От имени группы
                            </label>
                        </div>
                        }
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
                    this.state.group.posts.length === 0 &&
                    <div className={'user-center-container'} style={{marginTop: '30px', marginBottom: '30px'}}>
                        Ни одного поста не было добавлено
                    </div>
                }
                {
                    this.state.group.posts.map(item => {
                        let images = item.images
                        const date = new Date(item.date)
                        const curr_date = date.getDate();
                        const curr_month = date.getMonth() + 1;
                        const curr_year = date.getFullYear();
                        const curr_hours = date.getHours()
                        const curr_minutes = date.getMinutes()
                        const curr_seconds = date.getSeconds()
                        const user = item.user
                        return images.map &&
                            <div className={'user-center-container'}
                                 style={{marginTop: '30px', marginBottom: '30px'}}>
                                <div className={'post-wrapper'} style={{width: '1000px'}}>
                                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                        <Link target="_blank"
                                              style={{
                                                  textDecoration: 'none'
                                              }}
                                              to={!item.is_from_group_name ? `/user/${user.id}` : `/group/${this.state.group.id}`}>
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
                                                         src={!item.is_from_group_name ? (user.avatar ? user.avatar.image : noAvatar)
                                                             : this.state.group.avatar_image.image}/>
                                                </div>
                                                <span
                                                    style={{paddingRight: '7px'}}>{!item.is_from_group_name ? user.name : this.state.group.name}</span>
                                                {!item.is_from_group_name &&
                                                <span style={{paddingRight: '7px'}}>{user.surname}</span>}
                                            </div>
                                        </Link>
                                        <span style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            color: 'grey',
                                            paddingRight: '20px',
                                        }}>
                                            {(curr_hours < 10 ? "0" + curr_hours : curr_hours)
                                            + ":" + (curr_minutes < 10 ? "0" + curr_minutes : curr_minutes)
                                            + ":" + (curr_seconds < 10 ? "0" + curr_seconds : curr_seconds)
                                            + " " + (curr_date < 10 ? "0" + curr_date : curr_date)
                                            + "-" + (curr_month < 10 ? "0" + curr_month : curr_month)
                                            + "-" + curr_year}
                                        </span>
                                    </div>
                                    <div style={{padding: '12px'}}>{item.text}</div>
                                    <div className={'post-photo-gallery'} style={{justifyContent: 'center'}}>
                                        {images && images.map(item => {
                                            return <PostPhotoSaved onClick={this.onPhotoClick} photo={item}/>
                                        })}
                                    </div>
                                </div>
                            </div>
                    })
                }
            </>
            }
        </NavBar>
    }
}

export default withRouter(Group)
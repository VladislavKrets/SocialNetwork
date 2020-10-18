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

class Group extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            group: null,
            currentPost: {
                group: this.props.match.params['id'],
                text: '',
                images: []
            },
            isPhotoDialogOpened: false,
            currentImage: null
        }
    }

    getGroup = () => {
        this.props.getGroup(this.props.match.params['id']).then((data) => {
            const group = data.data;
            if (!group.avatar_image) {
                group.avatar_image = noGroupAvatar
            }
            this.setState({
                group: data.data
            })
        })
    }

    componentDidMount() {
        this.getGroup();
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
                this.setState({
                    currentPost: {
                        group: this.props.match.params['id'],
                        text: '',
                        images: []
                    }
                })
                document.location.reload(true)
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
            this.setState({
                group: group
            })
        })
    }

    groupUnsubscribe = (id) => {
        this.props.groupUnsubscribe(id).then(() => {
            const group = this.state.group;
            group.is_subscribed = false
            this.setState({
                group: group
            })
        })
    }

    render() {
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
                <div className={'user-center-container'}>
                    <div style={{display: "flex", paddingTop: '5px'}}>
                        <div>
                            <img className={'center-cropped'} style={{width: '300px', height: '300px'}}
                                 src={this.state.group.avatar_image}/>
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
                                                     src={user ? (user.avatar ? user.avatar.image : noAvatar)
                                                         : this.state.group.avatar_image}/>
                                            </div>
                                            <span
                                                style={{paddingRight: '7px'}}>{user ? user.name : this.state.group.name}</span>
                                            {user && <span style={{paddingRight: '7px'}}>{user.surname}</span>}
                                        </div>
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
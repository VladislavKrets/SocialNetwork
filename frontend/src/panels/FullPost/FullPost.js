import NavBar from "../../components/NavBar/NavBar";
import {withRouter} from "react-router";
import React from "react";
import {Link} from "react-router-dom";
import noAvatar from "../../img/no-avatar.png";
import noGroupAvatar from "../../img/no-image-group.jpg";
import PostPhotoSaved from "../../components/PostPhotoSaved/PostPhotoSaved";
import Alert from "../../components/Alert/Alert";
import PhotoViewer from "../../components/PhotoViewer/PhotoViewer";
import PostPhoto from "../../components/PostPhoto/PostPhoto";
import Button from "../../components/Button/Button";
import editSvg from "../../img/edit.svg";

class FullPost extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            id: parseInt(this.props.match.params['id']),
            post: null,
            currentComment: {
                text: '',
                images: [],
                is_user: parseInt(this.props.match.params['id']) > 0,
                post_id: Math.abs(parseInt(this.props.match.params['id'])),
            },
            editCommentData: {
                post: Math.abs(parseInt(this.props.match.params['id'])),
                text: '',
                images: []
            },
            editPostData: {
                text: '',
                images: [],
            },
            isRemoveCommentDialogOpened: false,
            isCommentEditDialogOpened: false,
            isPostEditDialogOpened: false,
            currentCommentId: null,
            isRemovePostDialogOpened: false,
        }
    }

    onChangeEditCommentDialogState = (id) => {
        const post = this.state.post
        let comment = {
            post: Math.abs(parseInt(this.props.match.params['id'])),
            text: '',
            images: []
        }
        if (id) comment = post.comments.filter(x => x.id === id)[0]
        const currentCommentData = {}
        currentCommentData.post = comment.id
        currentCommentData.text = comment.text
        currentCommentData.images = comment.images.filter(x => true)
        this.setState({
            isCommentEditDialogOpened: !this.state.isCommentEditDialogOpened,
            currentCommentId: id,
            editCommentData: currentCommentData
        })
    }
    onChangeEditPostDialogState = () => {
        const post = this.state.post
        const editPostData = {}
        editPostData.text = post.text
        editPostData.images = post.images.filter(x => true)
        if (this.state.id > 0) editPostData.receiver = post.receiver
        else editPostData.group = post.group.id
        this.setState({
            isPostEditDialogOpened: !this.state.isPostEditDialogOpened,
            editPostData: editPostData
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

    onPostEditTextChangeListener = e => {
        const post = this.state.editPostData
        post.text = e.target.value;
        this.setState({
            editPostData: post,
        })
    }

    onPostEdit = () => {
        const post = this.state.editPostData;
        post.images = post.images.map(x => x.id)
        if (!(post.text === '' && post.images.length === 0)) {
            if (this.state.id > 0) {
                this.props.editUserPost(this.state.id, post).then(data => {
                    const post = this.state.post
                    post.text = data.data.text
                    post.images = data.data.images
                    this.setState({
                        post: post,
                        editPostData: {
                            text: '',
                            images: [],
                        },
                    })
                })
            } else {
                this.props.editGroupPost(-this.state.id, post).then(data => {
                    const post = this.state.post
                    post.text = data.data.text
                    post.images = data.data.images
                    this.setState({
                        post: post,
                        editPostData: {
                            text: '',
                            images: [],
                        },
                    })
                })
            }
        }
    }

    handleEditCommentImageChange = (e) => {
        const image = e.target.files[0];
        this.props.postImageUpload(image).then(data => {
            const comment = this.state.editCommentData
            comment.images.push(data.data)
            this.setState({
                editCommentData: comment
            })
        }).catch(e => {

        })
    }

    onCommentEditTextChangeListener = e => {
        const comment = this.state.editCommentData
        comment.text = e.target.value;
        this.setState({
            editCommentData: comment
        })
    }

    onCommentEdit = () => {
        const comment = this.state.editCommentData;
        comment.images = comment.images.map(x => x.id)
        if (!(comment.text === '' && comment.images.length === 0)) {
            this.props.editComment(this.state.currentCommentId, comment).then(data => {
                const post = this.state.post;
                post.comments = post.comments.map(x => {
                    if (x.id === data.data.id) return data.data
                    return x
                })
                this.setState({
                    post: post,
                    editPostData: {
                        post: post.id,
                        text: '',
                        images: []
                    }
                })
            })
        }
    }

    componentDidMount() {
        const id = parseInt(this.props.match.params['id'])
        if (id > 0) this.getCurrentUserPost(id)
        else this.getCurrentGroupPost(-id)
        document.title = "Пост"
    }

    getCurrentUserPost = (id) => {
        this.props.getCurrentUserPost(id).then(data => {
            this.setState({
                post: data.data
            })
        })
    }

    getCurrentGroupPost = (id) => {
        this.props.getCurrentGroupPost(id).then(data => {
            this.setState({
                post: data.data
            })
        })
    }
    onPhotoClick = (image) => {
        this.setState({
            currentImage: image,
            isPhotoDialogOpened: true,
        })

    }
    onChangePhotoDialogState = () => {
        this.setState({
            currentImage: null,
            isPhotoDialogOpened: false,
        })
    }
    handleEditPostKeyDown = (event) => {
        if (event.ctrlKey && event.key === "Enter") {
            this.onPostEdit()
            this.onChangeEditPostDialogState()
        }
    }
    handleEditCommentKeyDown = (event) => {
        if (event.ctrlKey && event.key === "Enter") {
            this.onCommentEdit()
            this.onChangeEditCommentDialogState(null)
        }
    }
    onCommentTextChangeListener = e => {
        const comment = this.state.currentComment
        comment.text = e.target.value;
        this.setState({
            currentComment: comment
        })
    }
    handleKeyDown = (event) => {
        if (event.ctrlKey && event.key === "Enter") {
            this.onCommentSave()
        }
    }
    onCommentSave = () => {
        const comment = this.state.currentComment;
        comment.images = comment.images.map(x => x.id)
        if (!(comment.text === '' && comment.images.length === 0)) {
            this.props.commentAdd(comment).then(data => {
                const post = this.state.post;
                post.comments.unshift(data.data)
                post.comments_count += 1
                this.setState({
                    post: post,
                    currentComment: {
                        text: '',
                        images: [],
                        is_user: parseInt(this.props.match.params['id']) > 0,
                        post_id: Math.abs(parseInt(this.props.match.params['id']))
                    }
                })
            })
        }
    }
    handlePostImageChange = (e) => {
        const image = e.target.files[0];
        this.props.postImageUpload(image).then(data => {
            const comment = this.state.currentComment
            comment.images.push(data.data)
            this.setState({
                currentComment: comment
            })
        }).catch(e => {

        })
    }
    removeComment = (id) => {
        this.props.removeComment(id).then(() => {
            const post = this.state.post
            post.comments = post.comments.filter(x => x.id !== id)
            post.comments_count += 1
            this.setState({
                post: post
            })
        })
    }
    removePost = () => {
        if (this.state.id > 0) {
            this.props.removeUserPost(this.state.id).then(() => {
                window.open(`/user/${this.state.post.receiver}`, "_self");
            })
        } else {
            this.props.removeGroupPost(-this.state.id).then(() => {
                window.open(`/group/${this.state.post.group.id}`, "_self");
            })
        }
    }
    onChangeRemoveCommentDialogState = (id) => {
        this.setState({
            isRemoveCommentDialogOpened: !this.state.isRemoveCommentDialogOpened,
            currentCommentId: id
        })
    }

    onChangeRemovePostDialogState = () => {
        this.setState({
            isRemovePostDialogOpened: !this.state.isRemovePostDialogOpened,
        })
    }

    render() {
        const date = new Date(this.state.post ? this.state.post.date : undefined)
        const curr_date = date.getDate();
        const curr_month = date.getMonth() + 1;
        const curr_year = date.getFullYear();
        const curr_hours = date.getHours()
        const curr_minutes = date.getMinutes()
        const curr_seconds = date.getSeconds()
        return <NavBar user={this.props.user}
                       setCurrentLink={this.props.setCurrentLink}
                       currentLink={this.props.currentLink}
                       logOut={this.props.logOut}
                       links={this.props.links}>
            {this.state.post && <div>
                {
                    this.state.isPhotoDialogOpened ?
                        <Alert close={this.onChangePhotoDialogState}>
                            <PhotoViewer photo={this.state.currentImage}/>
                        </Alert>
                        : null
                }
                {
                    this.state.isRemoveCommentDialogOpened ?
                        <Alert style={{backgroundColor: '#f7faff', borderRadius: '12px',}}
                               close={() => {
                                   this.onChangeRemoveCommentDialogState(null)
                               }}>
                            <div style={{
                                width: '300px',
                                borderRadius: '12px',
                                backgroundColor: '#f7faff'
                            }}>
                                <div style={{padding: '20px 12px', wordBreak: 'break-word', textAlign: 'center'}}>
                                    Вы действительно хотите удалить данный комментарий?
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
                                        this.removeComment(this.state.currentCommentId)
                                        this.onChangeRemoveCommentDialogState(null)
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
                                        this.onChangeRemoveCommentDialogState(null)
                                    }}>
                                        Отмена
                                    </div>
                                </div>
                            </div>
                        </Alert>
                        : null
                }
                {
                    this.state.isRemovePostDialogOpened ?
                        <Alert style={{backgroundColor: '#f7faff', borderRadius: '12px',}}
                               close={() => {
                                   this.onChangeRemovePostDialogState()
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
                                        this.removePost()
                                        this.onChangeRemovePostDialogState()
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
                                        this.onChangeRemovePostDialogState()
                                    }}>
                                        Отмена
                                    </div>
                                </div>
                            </div>
                        </Alert>
                        : null
                }
                {
                    this.state.isPostEditDialogOpened &&
                    <Alert style={{backgroundColor: '#f7faff', borderRadius: '12px',}}
                           close={() => this.onChangeEditPostDialogState()}>
                        <div style={{
                            width: '1000px',
                            backgroundColor: '#f7faff',
                            borderRadius: '12px',
                            padding: '15px',

                        }}>
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
                        <textarea
                            value={this.state.editPostData.text} onKeyDown={this.handleEditPostKeyDown}
                            onChange={this.onPostEditTextChangeListener}
                            style={{
                                width: '100%',
                                height: '70px',
                                background: 'none',
                                resize: 'none',
                                border: 'none',
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
                                <label className={'button'}>
                                    <input className={'image-button'} type="file"
                                           style={{display: "none"}}
                                           value={''}
                                           accept="image/png, image/jpeg"
                                           onChange={this.handleEditPostImageChange}/>
                                    Прикрепить фото
                                </label>
                                <Button style={{backgroundColor: '#199912', color: '#f7faff', border: 'none'}}
                                        onClick={() => {
                                            this.onPostEdit()
                                            this.onChangeEditPostDialogState()
                                        }}>
                                    Сохранить
                                </Button>
                                <Button style={{backgroundColor: '#3e7cb0', color: '#f7faff', border: 'none'}}
                                        onClick={() => this.onChangeEditPostDialogState()}>
                                    Отмена
                                </Button>
                            </div>
                        </div>
                    </Alert>

                }
                {
                    this.state.isCommentEditDialogOpened &&
                    <Alert style={{backgroundColor: '#f7faff', borderRadius: '12px',}}
                           close={() => this.onChangeEditCommentDialogState(null)}>
                        <div style={{
                            width: '1000px',
                            backgroundColor: '#f7faff',
                            borderRadius: '12px',
                            padding: '15px',

                        }}>
                            <div style={{
                                textAlign: 'center',
                                fontSize: '1.2em',
                                color: '#3e7cb0',
                                fontWeight: 'bold',
                                paddingBottom: '12px'
                            }}>Редактирование комментария
                            </div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                border: '1px solid black',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                padding: '3px'
                            }}>
                        <textarea
                            value={this.state.editCommentData.text} onKeyDown={this.handleEditCommentKeyDown}
                            onChange={this.onCommentEditTextChangeListener}
                            style={{
                                width: '100%',
                                height: '70px',
                                background: 'none',
                                resize: 'none',
                                border: 'none',
                                borderRadius: '4px',
                                outline: 'none'
                            }}
                            placeholder={'Напишите здесь текст вашего комментария и нажмите ctrl+enter'}/>
                            </div>

                            <div className={'post-photo-gallery'}>
                                {this.state.editCommentData.images.map(item => {
                                    return <PostPhoto photo={item} delete={(id) => {
                                        this.props.deletePostImage(id).then(() => {
                                            const post = this.state.editCommentData
                                            post.images = post.images.filter(x => x.id !== id)
                                            this.setState({
                                                editCommentData: post
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
                                           accept="image/png, image/jpeg"
                                           onChange={this.handleEditCommentImageChange}/>
                                    Прикрепить фото
                                </label>
                                <Button style={{backgroundColor: '#199912', color: '#f7faff', border: 'none'}}
                                        onClick={() => {
                                            this.onCommentEdit()
                                            this.onChangeEditCommentDialogState(null)
                                        }}>
                                    Сохранить
                                </Button>
                                <Button style={{backgroundColor: '#3e7cb0', color: '#f7faff', border: 'none'}}
                                        onClick={() => this.onChangeEditCommentDialogState(null)}>
                                    Отмена
                                </Button>
                            </div>
                        </div>
                    </Alert>

                }
                <div className={'user-center-container'}>
                    <div style={{
                        width: '1000px', color: 'black', textDecoration: 'none',
                        display: 'flex', justifyContent: 'space-between'
                    }}>
                        <Link target="_blank"
                              onClick={e => e.stopPropagation()}
                              style={{
                                  textDecoration: 'none'
                              }}
                              to={this.state.id < 0 ? (!this.state.post.is_from_group_name
                                  ? `/user/${this.state.post.user.id}` : `/group/${this.state.post.group.id}`)
                                  : `/user/${this.state.post.user.id}`}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '12px',
                                fontSize: '1.5em',
                                color: '#3e7cb0',
                                fontWeight: 'bold'
                            }}>
                                <div style={{paddingRight: '7px'}}>
                                    <img className={'center-cropped'}
                                         style={{width: '160px', height: '160px'}}
                                         src={this.state.id < 0 ? (!this.state.post.is_from_group_name ?
                                             (this.state.post.user.avatar
                                                 ? this.state.post.user.avatar.image : noAvatar)
                                             : (this.state.post.group.avatar_image
                                                 ? this.state.post.group.avatar_image.image : noGroupAvatar))
                                             : this.state.post.user.avatar
                                                 ? this.state.post.user.avatar.image : noAvatar}/>
                                </div>
                                <span
                                    style={{paddingRight: '7px'}}>{this.state.id < 0 ?
                                    (!this.state.post.is_from_group_name ? this.state.post.user.name : this.state.post.group.name)
                                    : this.state.post.user.name}
                            </span>
                                {(this.state.id > 0 || !this.state.post.is_from_group_name) &&
                                <span style={{paddingRight: '7px'}}>{this.state.post.user.surname}</span>
                                }
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
                </div>
                <div className={'user-center-container'}>
                    <div style={{
                        width: '1000px', color: 'black', fontSize: '1.2em', wordBreak: 'break-word'
                    }}>
                        {this.state.post.text}
                    </div>
                </div>
                <div className={'user-center-container'}>
                    <div style={{
                        width: '1000px',
                    }}>
                        <div className={'post-photo-gallery'} style={{justifyContent: 'center'}}>
                            {this.state.post.images && this.state.post.images.map(item => {
                                return <PostPhotoSaved style={{width: '500px', maxHeight: '800px'}}
                                                       onClick={this.onPhotoClick} photo={item}/>
                            })}
                        </div>
                    </div>
                </div>
                <div className={'user-center-container'}>
                    <div style={{
                        width: '1000px',
                    }}>
                        <div style={{textAlign: 'right', padding: '12px'}}>
                            <span style={{color: '#3e7cb0', fontWeight: 'bold'}}>Комментариев: </span>
                            <span>{this.state.post.comments_count}</span>
                        </div>
                    </div>
                </div>
                <div className={'user-center-container'}>
                    {this.state.post.user.id === this.props.user.id &&
                    <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        color: '#3e7cb0',
                        cursor: 'pointer',
                        fontSize: '1em',
                        fontWeight: 'bold',
                        padding: '0 5px',
                        marginRight: '15px',
                        borderBottom: '1px solid #3e7cb0'
                    }} onClick={e => {
                        this.onChangeEditPostDialogState()
                        e.stopPropagation()
                        e.preventDefault()
                    }}>
                        Редактировать пост
                    </span>}
                    {(this.state.post.user.id === this.props.user.id
                        || (this.state.id < 0 && this.state.post.group.creator === this.props.user.id
                            || this.state.id > 0 && this.state.post.receiver === this.props.user.id)) &&
                    <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        color: 'red',
                        cursor: 'pointer',
                        fontSize: '1em',
                        fontWeight: 'bold',
                        padding: '0 5px',
                        borderBottom: '1px solid red'
                    }} onClick={e => {
                        this.onChangeRemovePostDialogState()
                        e.stopPropagation()
                        e.preventDefault()
                    }}>
                        Удалить пост
                    </span>}
                </div>
                <div className={'user-center-container'}>
                    <span style={{color: '#3e7cb0', fontWeight: 'bold', fontSize: '1.2em'}}>Комментарии</span>
                </div>
                <div className={'user-center-container'} style={{padding: '50px 0'}}>
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
                        <textarea value={this.state.currentComment.text} onKeyDown={this.handleKeyDown}
                                  onChange={this.onCommentTextChangeListener}
                                  style={{
                                      width: '100%',
                                      height: '70px',
                                      resize: 'none',
                                      border: 'none',
                                      borderRadius: '4px',
                                      outline: 'none'
                                  }}
                                  placeholder={'Напишите здесь текст вашего комментария и нажмите ctrl+enter'}/>
                        </div>

                        <div className={'post-photo-gallery'}>
                            {this.state.currentComment.images.map(item => {
                                return <PostPhoto photo={item} delete={(id) => {
                                    this.props.deletePostImage(id).then(() => {
                                        const comment = this.state.currentComment
                                        comment.images = comment.images.filter(x => x.id !== id)
                                        this.setState({
                                            currentComment: comment
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
                            <Button onClick={this.onCommentSave}>
                                Отправить
                            </Button>
                        </div>
                    </div>
                </div>
                {
                    this.state.post.comments.map(item => {
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
                                <div className={'post-wrapper'}
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
                                              to={`/user/${user_item.id}`}>
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
                                                         src={user_item.avatar.image}/>
                                                </div>
                                                <span style={{paddingRight: '7px'}}>{user_item.name}</span>
                                                <span style={{paddingRight: '7px'}}>{user_item.surname}</span>
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
                                            {item.user.id === this.props.user.id &&
                                            <span style={{padding: '0 12px', cursor: 'pointer'}} onClick={e => {
                                                e.stopPropagation()
                                                e.preventDefault()
                                                this.onChangeEditCommentDialogState(item.id)
                                            }}>
                                                <img src={editSvg} style={{height: '12px'}}/>
                                            </span>
                                            }
                                            {(item.user.id === this.props.user.id
                                                || (this.state.id < 0 && this.state.post.group.creator === this.props.user.id
                                                    || this.state.id > 0 && this.state.post.receiver === this.props.user.id)) &&
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
                                                this.onChangeRemoveCommentDialogState(item.id)
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
                                </div>
                            </div>
                    })
                }
                {
                    this.state.post.comments.length === 0 &&
                    <div className={'user-center-container'} style={{marginTop: '30px', marginBottom: '30px'}}>
                        Под этим постом еще нет комментариев
                    </div>
                }
            </div>
            }
        </NavBar>
    }
}

export default withRouter(FullPost)
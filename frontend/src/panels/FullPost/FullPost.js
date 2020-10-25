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
                post_id: Math.abs(parseInt(this.props.match.params['id']))
            }
        }
    }

    componentDidMount() {
        const id = parseInt(this.props.match.params['id'])
        if (id > 0) this.getCurrentUserPost(id)
        else this.getCurrentGroupPost(-id)
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
    onCommentTextChangeListener = e => {
        const comment = this.state.currentComment
        comment.text = e.target.value;
        this.setState({
            currentComment: comment
        })
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

    render() {
        const date = new Date(this.state.post ? this.state.post.date : undefined)
        const curr_date = date.getDate();
        const curr_month = date.getMonth() + 1;
        const curr_year = date.getFullYear();
        const curr_hours = date.getHours()
        const curr_minutes = date.getMinutes()
        const curr_seconds = date.getSeconds()
        return <NavBar user={this.props.user}
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
                        <textarea value={this.state.currentComment.text} onChange={this.onCommentTextChangeListener}
                                  style={{
                                      width: '100%',
                                      height: '70px',
                                      resize: 'none',
                                      border: 'none',
                                      borderRadius: '4px',
                                      outline: 'none'
                                  }}
                                  placeholder={'Напишите здесь текст вашего комментария'}/>
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
                            <Button>
                                <label><input className={'image-button'} type="file"
                                              style={{display: "none"}}
                                              value={''}
                                              accept="image/png, image/jpeg" onChange={this.handlePostImageChange}/>
                                    Прикрепить фото</label>
                            </Button>
                            <Button onClick={this.onCommentSave}>
                                Отправить
                            </Button>
                        </div>
                    </div>
                </div>
                {
                    this.state.post.comments.map(item => {
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
                                            {(curr_hours < 10 ? "0" + curr_hours : curr_hours)
                                            + ":" + (curr_minutes < 10 ? "0" + curr_minutes : curr_minutes)
                                            + ":" + (curr_seconds < 10 ? "0" + curr_seconds : curr_seconds)
                                            + " " + (curr_date < 10 ? "0" + curr_date : curr_date)
                                            + "-" + (curr_month < 10 ? "0" + curr_month : curr_month)
                                            + "-" + curr_year}
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
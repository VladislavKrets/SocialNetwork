import NavBar from "../../components/NavBar/NavBar";
import {withRouter} from "react-router";
import React from "react";
import PostPhoto from "../../components/PostPhoto/PostPhoto";
import Button from "../../components/Button/Button";

class Group extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            group: null,
            currentPost: {
                group: this.props.match.params['id'],
                text: '',
                images: []
            }
        }
    }

    getGroup = () => {
        this.props.getGroup(this.props.match.params['id']).then((data) => {
            console.log(data.data)
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
    render() {
        return <NavBar
            user={this.props.user}
            logOut={this.props.logOut}
            links={this.props.links}>
            {this.state.group && <>
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
            </>
            }
        </NavBar>
    }
}

export default withRouter(Group)
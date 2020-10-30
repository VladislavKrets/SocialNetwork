import React from "react";

export default class Alert extends React.Component {
    componentDidMount() {
        document.body.style.overflow = 'hidden';
    }

    componentWillUnmount() {
        document.body.style.overflow = 'auto';
    }

    render() {
        const style = this.props.style ? this.props.style : {}
        return <div
            onClick={this.props.close}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0,0,0,0.1)',
            }}>
            <div style={{
                backgroundColor: '#d5dde6',
                boxShadow: '0px 0px 34px 8px rgba(0,0,0,0.75)',
                border: '1px solid #d5dde6',
                borderRadius: '7px', ...style
            }}
                 onClick={e => e.stopPropagation()}>
                {this.props.children}
            </div>
        </div>
    }
}
import React from "react";
import './PhotoViewer.css'

export default class PhotoViewer extends React.Component {

    render() {
        const date = new Date(this.props.photo.date)
        const curr_date = date.getDate();
        const curr_month = date.getMonth() + 1;
        const curr_year = date.getFullYear();
        const curr_hours = date.getHours()
        const curr_minutes = date.getMinutes()
        const curr_seconds = date.getSeconds()
        return <div style={{
            padding: '12px',
            width: '1000px',
            height: '600px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column'
        }}>
            <img className={'photo-viewer-img'} src={this.props.photo.image}/>
            <span style={{color: 'grey', paddingTop: '20px'}}>
                <span style={{paddingRight: '5px'}}>Загружено</span>
                {(curr_hours < 10 ? "0" + curr_hours : curr_hours)
                + ":" + (curr_minutes < 10 ? "0" + curr_minutes : curr_minutes)
                + ":" + (curr_seconds < 10 ? "0" + curr_seconds : curr_seconds)
                + " " + (curr_date < 10 ? "0" + curr_date : curr_date)
                + "-" + (curr_month < 10 ? "0" + curr_month : curr_month)
                + "-" + curr_year}
            </span>
        </div>
    }
}
import React from "react";

function SlideBarButton(props){
return(
    <>
    <div className="SlideBarButtonDiv">
        <button className="SlideBarButton">
        <div className="slidebaricon">{props.icon}</div>
        <div className="slidebarname">{props.name}</div>
        </button>
    </div>
    </>
)
}

export default SlideBarButton
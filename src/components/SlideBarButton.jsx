import React from "react";

function SlideBarButton(props){
return(
    <>
    <div className="SlideBarButtonDiv">
        <button className="SlideBarButton">
        {props.icon}
        {props.name}
        </button>
    </div>
    </>
)
}

export default SlideBarButton
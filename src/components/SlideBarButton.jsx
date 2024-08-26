import React from "react";

function SlideBarButton({ icon, name, isActive, onClick }) {
    return (
        <div className={`SlideBarButtonDiv ${isActive ? 'active' : ''}`}>
            <button className={`SlideBarButton ${isActive ? 'btn-active' : ''}`} onClick={onClick}>
                <div className="slidebaricon">{icon}</div>
                <div className="slidebarname">{name}</div>
            </button>
        </div>
    );
}

export default SlideBarButton;

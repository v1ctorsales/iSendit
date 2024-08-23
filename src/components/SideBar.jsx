import React from "react";
import SlideBarButton from "./SlideBarButton"
import { FaPaperPlane } from "react-icons/fa";
import { FaList } from "react-icons/fa";
import { IoMdSettings } from "react-icons/io";
import { PiWallFill } from "react-icons/pi";
import { IoCube } from "react-icons/io5";   

function SideBar(){
    return(
        <>
        <div className="navbar">
            <div className="navBarHeader">
                <div className="logo">
                    <img className="logoholder" src="https://cdn.pixabay.com/photo/2021/12/27/10/50/telegram-icon-6896828_960_720.png" alt="" />
                    <div className="logoText">iSendiT</div> 
                </div>
            </div>
            <div className="navBarBody">
                <SlideBarButton icon={<PiWallFill />}name="Enviar Regras de Firewall  "></SlideBarButton>
                <SlideBarButton icon={<IoCube />}name="Enviar Objetos"></SlideBarButton>
                <SlideBarButton icon={<FaList />} name="Ver envios"></SlideBarButton>
                <SlideBarButton icon={<IoMdSettings />} name="Configurações"></SlideBarButton>
            </div>
        </div>
        </>
    )
}

export default SideBar;
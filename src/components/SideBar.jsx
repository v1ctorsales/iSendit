import React from "react";
import SlideBarButton from "./SlideBarButton"
import { FaPaperPlane } from "react-icons/fa";
import { FaList } from "react-icons/fa";
import { IoMdSettings } from "react-icons/io";
import { PiWallFill } from "react-icons/pi";
import { IoCube } from "react-icons/io5";   
import { IoIosHelpCircle } from "react-icons/io";
import image from "../img/isendit.png"

function SideBar(){
    return(
        <>
        <div className="navbar">
            <div className="navBarHeader">
                <div className="logo">
                    <img className="logoholder" src={image} alt="" />
                    <div className="logoText"></div> 
                </div>
            </div>
            <div className="navBarBody">
                <SlideBarButton icon={<PiWallFill />}name="Enviar Regras de Firewall  "></SlideBarButton>
                <SlideBarButton icon={<IoCube />}name="Enviar Objetos"></SlideBarButton>
                <SlideBarButton icon={<FaList />} name="Ver envios"></SlideBarButton>
                <SlideBarButton icon={<IoMdSettings />} name="Configurações"></SlideBarButton>
                <SlideBarButton icon={<IoIosHelpCircle />} name="Ajuda"></SlideBarButton>
            </div>
        </div>
        </>
    )
}

export default SideBar;
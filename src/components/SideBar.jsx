import React, { useState } from "react";
import SlideBarButton from "./SlideBarButton";
import { FaPaperPlane, FaList } from "react-icons/fa";
import { IoMdSettings, IoIosHelpCircle } from "react-icons/io";
import { ImFire } from "react-icons/im";
import { IoCube } from "react-icons/io5";   
import image from "../img/isendit.png";
import { Link } from 'react-router-dom';

function SideBar() {
    const [activeButton, setActiveButton] = useState('firewall');

    return (
        <div className="navbar">
            <div className="navBarHeader">
                <div className="logo">
                    <img className="logoholder" src={image} alt="" />
                    <div className="logoText"></div> 
                </div>
            </div>
            <div className="navBarBody">
                <Link to="/firewall" onClick={() => setActiveButton('firewall')}>
                    <SlideBarButton 
                        icon={<ImFire />} 
                        name="Enviar Regras de Firewall" 
                        isActive={activeButton === 'firewall'}
                    />
                </Link>
                <Link to="/objetos" onClick={() => setActiveButton('objetos')}>
                    <SlideBarButton 
                        icon={<IoCube />} 
                        name="Enviar Objetos"
                        isActive={activeButton === 'objetos'}
                    />
                </Link>
                <Link to="/tarefas" onClick={() => setActiveButton('tarefas')}>
                    <SlideBarButton 
                        icon={<FaList />} 
                        name="Ver Tarefas"
                        isActive={activeButton === 'tarefas'}
                    />
                </Link>
                <Link to="/configuracoes" onClick={() => setActiveButton('configuracoes')}>
                    <SlideBarButton 
                        icon={<IoMdSettings />} 
                        name="Configurações"
                        isActive={activeButton === 'configuracoes'}
                    />
                </Link>
                <Link to="/ajuda" onClick={() => setActiveButton('ajuda')}>
                    <SlideBarButton 
                        icon={<IoIosHelpCircle />} 
                        name="Ajuda"
                        isActive={activeButton === 'ajuda'}
                    />
                </Link>
            </div>
        </div>
    );
}

export default SideBar;

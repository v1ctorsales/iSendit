import React, { useContext, useEffect, useState } from "react";
import SlideBarButton from "./SlideBarButton";
import { FaPaperPlane, FaList, FaCalendarTimes } from "react-icons/fa";
import { IoMdSettings, IoIosHelpCircle } from "react-icons/io";
import { ImFire } from "react-icons/im";
import { IoCube } from "react-icons/io5";   
import image from "../img/isendit.png";
import { Link, redirect } from 'react-router-dom';
import { AuthContext } from "../contexts/AuthContext";
import { ImExit } from "react-icons/im";

function SideBar() {
    const [activeButton, setActiveButton] = useState('tarefas');
    const { isAuthenticated, destinataria, empresaPai } = useContext(AuthContext); // Acessando a variável correta: empresaPai

    useEffect(() => {
        console.log('Valor de destinataria no SideBar:', destinataria);
        console.log('Valor de empresaPai no SideBar:', empresaPai); // Corrigido para empresaPai
    }, [destinataria, empresaPai]);

    return (
        <div className="navbar">
            <div>
            <div className="navBarHeader">
                <div className="logo">
                    <img className="logoholder" src={image} alt="" />
                    <div className="logoText"></div> 
                </div>
            </div>
            <div className="navBarBody">
                {destinataria === false && (
                    <>
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
                    </>
                )}
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
            <div className="navBarFooter">
            <Link to="/login" onClick={() => console.log('a')}>
                    <SlideBarButton 
                        icon={ <ImExit />} 
                        name="Sair"
                    />
                </Link>
            </div>
        </div>
    );
}

export default SideBar;

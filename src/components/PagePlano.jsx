import React from "react";
import { useNavigate } from 'react-router-dom';
import ShootingStars from "./ShootingStars";
import { BsCircleFill, BsArrowLeft } from 'react-icons/bs'; // Importa os ícones necessários

function PagePlano() {
    const navigate = useNavigate();

    const handleBackToLogin = () => {
        navigate('/login');
    }

    return (
        <>
            <div className="pagePlanoBg">
                <ShootingStars />
                <button className="btn-back" onClick={handleBackToLogin}>
                    <BsArrowLeft className="icon-back" /> Voltar para Login
                </button>
                <div className="plano-container">
                    <div className="card">
                        <h2>
                            <BsCircleFill className="icon-bronze" /> Bronze
                        </h2>
                        <p className="price">R$ 299/mês</p>
                        <ul className="ulCard">
                            <li>3 Empresas remetentes</li>
                            <li>30 Dias de Armazenamento</li>
                            <li>Cumprimento de SLA em 24h</li>
                            <li>Suporte em Horário Comercial</li>
                        </ul>
                        <button className="btn-plano">
                            <a className="a-btn-white" href="https://web.whatsapp.com/send?phone=553191173876&text=Olá, gostaria de saber mais sobre os planos disponíveis">
                                Converse com um Especialista
                            </a>
                        </button>
                    </div>
                    <div className="card">
                        <h2>
                            <BsCircleFill className="icon-prata" /> Prata
                        </h2>
                        <p className="price">R$ 499/mês</p>
                        <ul>
                            <li>10 Empresas Remetentes</li>
                            <li>30 Dias de Armazenamento</li>
                            <li>Cumprimento de SLA em 12h</li>
                            <li>Suporte em Horário Comercial</li>
                        </ul>
                        <button className="btn-plano" id="btn-planoMid">
                            <a className="a-btn-white" href="https://web.whatsapp.com/send?phone=553191173876&text=Olá, gostaria de saber mais sobre os planos disponíveis">
                                Converse com um Especialista
                            </a>
                        </button>
                    </div>
                    <div className="card">
                        <h2>
                            <BsCircleFill className="icon-ouro" /> Ouro
                        </h2>
                        <p className="price">R$ 699/mês</p>
                        <ul>
                            <li>20 Empresas Remetentes</li>
                            <li>60 Dias de Armazenamento</li>
                            <li>Cumprimento de SLA em 12h</li>
                            <li>Suporte em Horário Comercial</li>
                        </ul>
                        <button className="btn-plano">
                            <a className="a-btn-white" href="https://web.whatsapp.com/send?phone=553191173876&text=Olá, gostaria de saber mais sobre os planos disponíveis">
                                Converse com um Especialista
                            </a>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default PagePlano;

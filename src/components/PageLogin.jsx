import React, { useState, useContext } from "react";
import image from "../img/isendit.png";
import { FaSignInAlt } from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FaUserPlus } from "react-icons/fa6";
import { BsFillQuestionSquareFill } from "react-icons/bs";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext'; // Importa o AuthContext
import ShootingStars from "./ShootingStars";

function PageLogin({ setIsAuthenticated }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    
    // Usa o contexto de autenticação
    const { login, setUuid } = useContext(AuthContext); // Obtém a função login e o setter de uuid do AuthContext

    const notifySuccess = () => toast.success("Login realizado com sucesso!");
    const notifyError = (message) => toast.error(message);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Chama a função de login do AuthContext
            const result = await login(username, password);
            if (result.success) {
                notifySuccess();
                setIsAuthenticated(true);
                setUuid(result.uuid); // Armazena o UUID no contexto
                navigate('/firewall');
            } else {
                notifyError(result.message || 'Usuário ou senha incorretos');
            }
        } catch (error) {
            notifyError(error.message || 'Erro na autenticação');
            console.error("Erro na autenticação:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const isButtonDisabled = username.trim() === '' || password.trim() === '';

    return (
        <>
        <div className="pageloginBg">
        <ShootingStars /> 
            <div className="login-container">
                <form id="formLogin" onSubmit={handleSubmit}>
                    <div className="logo">
                        <img className="logoholder minilogo" src={image} alt="" />
                        <div className="logoText"></div> 
                    </div>
                    <h2 className="h2acesse">Digite suas credenciais</h2>
                    <div className="form-group">
                        <label className="responsiveLabel" htmlFor="username">E-mail</label>
                        <input
                            className="responsiveInput"
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="responsiveLabel" htmlFor="password">Senha</label>
                        <input
                            className="responsiveInput"
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button 
                        className="btn-submit2" 
                        type="submit" 
                        disabled={isButtonDisabled || isLoading}
                    >
                        <div className="btnSubmitItems">
                            {isLoading ? (
                                <>
                                    <AiOutlineLoading3Quarters className="loading-icon" />
                                    <div>Verificando Credenciais...</div>
                                </>
                            ) : (
                                <>
                                    <FaSignInAlt />
                                    <div>Acessar</div>
                                </>
                            )}
                        </div>
                    </button>
                    <div className="additional-options">
                        <a href="/forgot-password" className="adopt forgot-password"><BsFillQuestionSquareFill /> Esqueci minha senha</a>
                        <a href="/signup" className="adopt create-account"><FaUserPlus /> Criar uma conta</a>
                    </div>
                </form>
                <ToastContainer />
            </div>
        </div>
        </>
    );
}

export default PageLogin;

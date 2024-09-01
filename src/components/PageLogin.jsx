import React, { useState, useContext } from "react";
import image from "../img/isendit.png";
import { FaSignInAlt } from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FaUserPlus } from "react-icons/fa6";
import { BsFillQuestionSquareFill } from "react-icons/bs";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { UuidContext } from '../contexts/UuidContext'; // Importa o contexto

function PageLogin({ setIsAuthenticated }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { setUuid } = useContext(UuidContext); // Acessa o contexto

    const notifySuccess = () => toast.success("Login realizado com sucesso!");
    const notifyError = (message) => toast.error(message);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch('/api/verifyLogin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            console.log('Resposta do servidor:', response);

            if (!response.ok) {
                throw new Error('Falha na autenticação');
            }

            const data = await response.json();
            console.log('Dados retornados pelo servidor:', data);

            if (data.success) {
                notifySuccess();
                setIsAuthenticated(true);
                setUuid(data.uuid); // Armazena o UUID no contexto
                navigate('/ajuda');
            } else {
                notifyError(data.message || 'Usuário ou senha incorretos');
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
            <div className="login-container">
                <form id="formLogin" onSubmit={handleSubmit}>
                    <div className="logo">
                        <img className="logoholder minilogo" src={image} alt="" />
                        <div className="logoText"></div> 
                    </div>
                    <h3>Acesse sua conta</h3>
                    <div className="form-group">
                        <label htmlFor="username">E-mail</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Senha</label>
                        <input
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
        </>
    );
}

export default PageLogin;

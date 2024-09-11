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
import ShootingStars from "./ShootingStars";
import Swal from 'sweetalert2';

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
                navigate('/firewall');
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

    const handleForgotPassword = () => {
        Swal.fire({
            title: 'Esqueci minha senha',
            text: 'Por favor, insira seu e-mail:',
            input: 'email',
            inputPlaceholder: 'Digite seu e-mail',
            showCancelButton: true,
            confirmButtonText: 'Enviar',
            cancelButtonText: 'Cancelar',
            customClass: {
                popup: 'swal2-custom-modal', // Aplica a classe personalizada
                confirmButton: 'swal2-confirm',
                cancelButton: 'swal2-cancel'
            },
            preConfirm: (email) => {
                if (!email) {
                    Swal.showValidationMessage('O e-mail é obrigatório');
                }
                return email;
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const email = result.value;
    
                // Exibe o ícone de carregamento e mantém o modal aberto
                Swal.fire({
                    title: 'Enviando...',
                    html: 'Por favor, aguarde.',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading(); // Exibe o ícone de carregamento
                    }
                });
    
                // Faça a requisição para o backend com a string 'forgetPassword' e o e-mail fornecido
                fetch('/api/handleAccount', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ action: 'forgetPassword', email }), // Certifique-se de que o email e action são válidos
                })
                .then((response) => {
                    if (response.ok) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Sucesso!',
                            text: 'Instruções de recuperação foram enviadas para o e-mail fornecido.',
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Erro',
                            text: 'Não foi possível enviar as instruções de recuperação.',
                        });
                    }
                })
                .catch((error) => {
                    console.error('Erro:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Erro',
                        text: 'Ocorreu um erro ao enviar o e-mail de recuperação.',
                    });
                });
            }
        });
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
                        <a href="#!" onClick={handleForgotPassword} className="adopt forgot-password"><BsFillQuestionSquareFill /> Esqueci minha senha</a>
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
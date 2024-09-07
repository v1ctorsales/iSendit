import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isTokenValid, setIsTokenValid] = useState(true); // Estado para verificar se o token é válido
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const notifyError = (message) => toast.error(message);
    const notifySuccess = () => toast.success('Senha redefinida com sucesso!');

    const token = searchParams.get('token'); // Obtém o token da URL

    // Verifica se o token é válido assim que o componente carrega
    useEffect(() => {
        const validateToken = async () => {
            try {
                const response = await fetch('/api/handleAccount', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ action: 'validateToken', token }),
                });

                const data = await response.json();
                if (!response.ok || !data.valid) {
                    setIsTokenValid(false); // Token inválido
                }
            } catch (error) {
                console.error('Erro na verificação do token:', error);
                setIsTokenValid(false); // Se houver erro, considere o token como inválido
            }
        };

        if (token) {
            validateToken();
        } else {
            setIsTokenValid(false); // Se não houver token, considere inválido
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (password !== confirmPassword) {
            return notifyError('As senhas não coincidem.');
        }
    
        if (password.length < 6) {
            return notifyError('A senha deve ter pelo menos 6 caracteres.');
        }
    
        setIsSubmitting(true); // Desativa o botão ao iniciar o envio
    
        try {
            const response = await fetch('/api/handleAccount', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action: 'setNewPassword', token, newPassword: password }),
            });
    
            const data = await response.json();
    
            if (response.ok) {
                notifySuccess();
                setTimeout(() => navigate('/login'), 2000); // Redireciona após 2 segundos
            } else {
                notifyError(data.message || 'Erro ao redefinir a senha.');
                setIsSubmitting(false); // Reativa o botão em caso de erro
            }
        } catch (error) {
            console.error('Erro:', error);
            notifyError('Ocorreu um erro ao redefinir a senha.');
            setIsSubmitting(false); // Reativa o botão em caso de erro
        }
    };

    return (
        <div className={`reset-password-container ${!isTokenValid ? 'off' : ''}`}>
            <h2>Redefinir Senha</h2>
            {isTokenValid ? (
                <form onSubmit={handleSubmit}>
                    <div className="form-group2">
                        <label className='titlepwreset' htmlFor="password">Nova Senha</label>
                        <input
                            type="password"
                            id="password2"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group2">
                        <label className='titlepwreset' htmlFor="confirmPassword">Confirme a Senha</label>
                        <input
                            type="password"
                            id="confirmPassword2"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button className='btn-submit2' type="submit" disabled={isSubmitting || !isTokenValid}>
                        {isSubmitting ? 'Redefinindo...' : 'Redefinir Senha'}
                    </button>
                </form>
            ) : (
                <p>Token inválido ou expirado. Por favor, solicite um novo link de redefinição de senha.</p>
            )}
            <ToastContainer />
        </div>
    );
};

export default ResetPassword;

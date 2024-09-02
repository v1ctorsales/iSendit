import React, { useContext, useEffect, useState } from "react";
import { UuidContext } from '../contexts/UuidContext';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { IoEye } from "react-icons/io5";
import { BsFire } from 'react-icons/bs';
import { IoCube } from 'react-icons/io5';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify'; 
import rocket from '../img/rocket.gif';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

function PageSeeAllTasks() {
    const { uuid } = useContext(UuidContext);
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [loadingTaskId, setLoadingTaskId] = useState(null); // Estado para controle do carregamento

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await fetch('/api/getTasks', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ uuid }),
                });

                if (!response.ok) {
                    throw new Error('Erro ao buscar tarefas');
                }

                const data = await response.json();
                console.log('Tarefas recebidas do backend:', data.tasks);
                setTasks(data.tasks.slice(-10)); // Pegando as 10 últimas tarefas
            } catch (error) {
                console.error('Erro ao buscar tarefas:', error);
                toast.error("Erro ao buscar tarefas");
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        if (uuid) {
            fetchTasks();
        } else {
            console.log('UUID não está disponível');
            setIsLoading(false);
        }
    }, [uuid]);

    const handleViewDetails = async (task) => {
        setLoadingTaskId(task.id); // Definir o ID da tarefa para exibir o carregamento

        try {
            const response = await fetch('/api/getTasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ uuid, taskId: task.id }),  // Enviar taskId junto com uuid
            });
    
            if (!response.ok) {
                throw new Error('Erro ao buscar detalhes da tarefa');
            }
    
            const data = await response.json();
            console.log('Detalhes da tarefa recebidos do backend:', data.task);
    
            if (!data || !data.task) {
                throw new Error('Detalhes da tarefa não encontrados');
            }
    
            const taskDetails = data.task;
    
            // Remover os campos indesejados
            delete taskDetails.autor;
            delete taskDetails.empresa_origem_uuid;
    
            const formatKey = (key) => {
                key = key.replace(/_/g, ' '); // Substitui underscore por espaços
                if (key === 'created at') return 'Criado em';
                if (key === 'type') return 'Tipo';
                return key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();
            };
    
            const formatValue = (key, value) => {
                if (key === 'created_at') {
                    const date = new Date(value);
                    return date.toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    });
                }
                if (key === 'script') {
                    const uniqueId = `copy-button-${task.id}`;
                    return `
                    <div style="position: relative;">
                        <button id="${uniqueId}" class="btn-copy">Copiar</button>
                        <pre style="background-color: #282A36; color: #50FA7B; padding: 10px; margin-top: 10px;">${value}</pre>
                    </div>`;
                }
                return value;
            };
    
            const taskInfo = Object.entries(taskDetails)
                .filter(([key, value]) => value !== null && value !== '' && value !== undefined)
                .map(([key, value]) => {
                    const formattedKey = formatKey(key);
                    const formattedValue = formatValue(key, value);
                    return `<p style="text-align: left; margin: 0;"><strong>${formattedKey}:</strong> ${formattedValue}</p>`;
                })
                .join('');
    
            MySwal.fire({
                title: `<strong>Detalhes da Tarefa</strong>`,
                html: taskInfo,
                icon: 'info',
                confirmButtonText: 'Fechar',
                width: '600px',
                padding: '3em',
                background: '#fff',
                customClass: {
                    popup: 'swal-wide',
                    icon: 'swal-custom-icon', // Classe para o ícone e círculo
                    confirmButton: 'swal-custom-confirm-button', // Classe para o botão de fechar
                },
                didOpen: () => {
                    const swalIcon = document.querySelector('.swal2-icon');
                    if (swalIcon) {
                        swalIcon.style.marginTop = '0';
                    }
    
                    const swalContent = document.querySelector('.swal2-html-container');
                    if (swalContent) {
                        swalContent.style.textAlign = 'left';
                    }
    
                    // Adicionar evento de clique ao botão de copiar
                    const copyButton = document.getElementById(`copy-button-${task.id}`);
                    if (copyButton) {
                        copyButton.addEventListener('click', () => {
                            copyToClipboard(taskDetails.script);
                        });
                    }
                },
            });
        } catch (error) {
            console.error('Erro ao buscar detalhes da tarefa:', error);
            toast.error("Erro ao buscar detalhes da tarefa");
        } finally {
            setLoadingTaskId(null); // Redefinir após o carregamento
        }
    };
    
    // Função para copiar o texto para o clipboard sem HTML
    const copyToClipboard = (text) => {
        const tempElement = document.createElement('div');
        tempElement.innerHTML = text;
        const plainText = tempElement.textContent || tempElement.innerText || "";
    
        navigator.clipboard.writeText(plainText).then(() => {
            toast.info('Script copiado!');
        }).catch(err => {
            console.error('Erro ao copiar o script!:', err);
            toast.error('Erro ao copiar o script!');
        });
    };
    
    const mapTypeToLabel = (type) => {
        const typeMapping = {
            regrafw: { label: 'Regra de Firewall', icon: <BsFire style={{ color: '#bb0202' }} /> },
            ip: { label: 'Objeto IP', icon: <IoCube style={{ color: 'rgb(0 124 255)' }} /> },
            fqdn: { label: 'Objeto FQDN', icon: <IoCube style={{ color: 'rgb(0 124 255)' }} /> },
            addressGroup: { label: 'Objeto Address Group', icon: <IoCube style={{ color: 'rgb(0 124 255)' }} /> }
        };
        return typeMapping[type] || { label: type, icon: null }; 
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).replace(/\/\d{4}/, ''); 
    };

    return (
        <div>
            <div className="topForm">
                <div className="h2Obj">
                    <h2>Tarefas Recentes</h2>
                    <img className="rocketImg" src={rocket} alt="Cube" />
                </div>
            </div>
            {isLoading ? (
                <div className="centerTres"><AiOutlineLoading3Quarters className="loading-icon" /></div>
            ) : error ? (
                <div>Erro: {error}</div>
            ) : (
                <div className="tasks-table-container">
                    <table className="tasks-table">
                        <thead>
                            <tr>
                                <th className="col-created-at">Data de Criação</th>
                                <th className="col-type">Tipo de Tarefa</th>
                                <th className="col-name">Nome</th>
                                <th className="col-location">Localidade</th>
                                <th className="col-actions">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tasks.length > 0 ? (
                                tasks.map((task, index) => (
                                    <tr key={index}>
                                        <td className="row-created-at">{formatDate(task.created_at)}</td>
                                        <td className="row-type">
                                            {mapTypeToLabel(task.type).icon} {mapTypeToLabel(task.type).label}
                                        </td> 
                                        <td className="row-name">{task.nome}</td>
                                        <td className="row-location">{task.localidade}</td>
                                        <td className="row-actions">
                                            <button 
                                                className="btn-details"
                                                onClick={() => handleViewDetails(task)}
                                                disabled={loadingTaskId !== null} 
                                            >
                                                {loadingTaskId === task.id ? (
                                                    <AiOutlineLoading3Quarters className="loading-icon" />
                                                ) : (
                                                    <>
                                                        <IoEye />
                                                        Detalhes
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td className="row-empty" colSpan="5">Nenhuma tarefa encontrada.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
            <ToastContainer />
        </div>
    );
}

export default PageSeeAllTasks;

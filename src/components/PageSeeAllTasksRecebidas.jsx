import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from '../contexts/AuthContext';
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

function PageSeeAllTasksRecebidas() {
    const { uuid } = useContext(AuthContext); // UUID da empresa sendo recebida do contexto de autenticação
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [loadingTaskId, setLoadingTaskId] = useState(null); // Estado para controle do carregamento

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await fetch('/api/getTasksDestinataria', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ uuid }),
                });

                if (!response.ok) {
                    throw new Error('Erro ao buscar tarefas recebidas');
                }

                const data = await response.json();
                console.log('Tarefas recebidas pela empresa do backend:', data.tasks);
                setTasks(data.tasks.slice(-10)); // Pegando as 10 últimas tarefas recebidas
            } catch (error) {
                console.error('Erro ao buscar tarefas recebidas:', error);
                toast.error("Erro ao buscar tarefas recebidas");
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        if (uuid) {
            fetchTasks();
        } else {
            console.log('UUID da empresa não está disponível');
            setIsLoading(false);
        }
    }, [uuid]);

    const handleViewDetails = async (task) => {
        setLoadingTaskId(task.id); // Definir o ID da tarefa para exibir o carregamento

        try {
            const response = await fetch('/api/getTasksDestinataria', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ uuid, taskId: task.id }),  // Enviar taskId junto com uuid
            });
    
            if (!response.ok) {
                throw new Error('Erro ao buscar detalhes da tarefa recebida');
            }
    
            const data = await response.json();
            console.log('Detalhes da tarefa recebida do backend:', data.task);
    
            if (!data || !data.task) {
                throw new Error('Detalhes da tarefa não encontrados');
            }
    
            const taskDetails = data.task;
    
            // Remover os campos indesejados
            delete taskDetails.autor;
            delete taskDetails.empresa_origem_uuid;
    
            const formatKey = (key) => {
                if (key === 'script') return 'Script';
                key = key.replace(/_/g, ' ');
                if (key === 'created at') return 'Criado em';
                if (key === 'type') return 'Tipo';
                if (key === 'descricao') return 'Descrição';
                if (key === 'acao') return 'Ação';
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
                    const formattedScript = value
                        .trimStart()
                        .split('\n')
                        .map(line => line.trim())
                        .join('\n');
    
                    return `
            <div style="position: relative; display: flex; justify-content: space-between;">
                <pre style="background-color: #282A36; color: #50FA7B; padding: 10px; white-space: pre-wrap; word-wrap: break-word; flex-grow: 1; text-align: left;">${formattedScript}
                </pre>
                <button id="${uniqueId}" class="btn-copy"">Copiar</button>
            </div>`;
                }
    
                if (key === 'acao') {
                    return value ? 'Aceitar' : 'Recusar';
                }
    
                if (key === 'nat') {
                    return value === 'enable' ? 'Habilitar' : 'Desabilitar';
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
                title: `<strong>Detalhes da Tarefa Recebida</strong>`,
                html: taskInfo,
                icon: 'info',
                confirmButtonText: 'Fechar',
                width: '600px',
                padding: '1em 3em',
                background: '#fff',
                customClass: {
                    popup: 'swal-wide',
                    icon: 'swal-custom-icon',
                    confirmButton: 'swal-custom-confirm-button',
                },
                didOpen: () => {
                    const copyButton = document.getElementById(`copy-button-${task.id}`);
                    if (copyButton) {
                        copyButton.addEventListener('click', () => {
                            copyToClipboard(taskDetails.script);
                        });
                    }
                },
            });
    
        } catch (error) {
            console.error('Erro ao buscar detalhes da tarefa recebida:', error);
            toast.error("Erro ao buscar detalhes da tarefa recebida");
        } finally {
            setLoadingTaskId(null);
        }
    };

    const copyToClipboard = (text) => {
        const cleanText = text
            .replace(/<span[^>]*>/g, '')
            .replace(/<\/span>/g, '')
            .replace(/<br\s*\/?>/g, '\n')
            .replace(/\s{2,}/g, ' ')
            .replace(/&quot;/g, '"')
            .replace(/&nbsp;/g, ' ')
            .trim();
    
        navigator.clipboard.writeText(cleanText).then(() => {
            toast.info('Script copiado com sucesso!');
        }).catch(err => {
            console.error('Erro ao copiar o script:', err);
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
                    <h2>Tarefas Recebidas</h2>
                    <img className="rocketImg" src={rocket} alt="Rocket" />
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
                                    <td className="row-empty" colSpan="5">Nenhuma tarefa recebida encontrada.</td>
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

export default PageSeeAllTasksRecebidas;

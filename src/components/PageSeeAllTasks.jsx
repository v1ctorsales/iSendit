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
                if (key === 'script') return 'Script';  // Evitar modificações na chave 'script'
                key = key.replace(/_/g, ' '); // Substitui underscore por espaços
                if (key === 'created at') return 'Criado em';
                if (key === 'type') return 'Tipo';
                if (key === 'descricao') return 'Descrição';  // Mapeamento de 'Descricao'
                if (key === 'acao') return 'Ação';  // Mapeamento de 'Acao'
                return key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();
            };
            
            const formatValue = (key, value) => {
                console.log(`Formatando chave: ${key}, valor recebido:`, value);  // Log inicial para o valor recebido
            
                if (key === 'created_at') {
                    const date = new Date(value);
                    const formattedDate = date.toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    });
                    console.log(`Data formatada: ${formattedDate}`);  // Log para a data formatada
                    return formattedDate;
                }
            
                if (key === 'script') {
                    const uniqueId = `copy-button-${task.id}`;
                    console.log('Script original:', value);  // Log do script original recebido do backend
                    
                    // Remover espaços no início da primeira linha e ajustar o restante
                    const formattedScript = value
                        .trimStart() // Remove espaços no início da primeira linha
                        .split('\n') // Quebra em linhas
                        .map(line => line.trim()) // Remove espaços no início e no fim de cada linha
                        .join('\n'); // Junta as linhas novamente
            
                    console.log('Script formatado (sem espaços no início):', formattedScript);  // Log do script após a remoção de espaços
            
                    return `
            <div style="position: relative; display: flex; justify-content: space-between;">
                <pre style="background-color: #282A36; color: #50FA7B; padding: 10px; white-space: pre-wrap; word-wrap: break-word; flex-grow: 1; text-align: left;">${formattedScript}
                </pre>
                <button id="${uniqueId}" class="btn-copy"">Copiar</button>
            </div>`;
                }
            
                if (key === 'acao') {
                    const actionValue = value ? 'Aceitar' : 'Recusar';
                    console.log(`Valor de Ação: ${actionValue}`);  // Log para valores de ação
                    return actionValue;
                }
            
                if (key === 'nat') {
                    const natValue = value === 'enable' ? 'Habilitar' : (value ? 'Habilitar' : 'Desabilitar');
                    console.log(`Valor de NAT: ${natValue}`);  // Log para valores de NAT
                    return natValue;
                }
            
                console.log(`Valor final formatado para chave ${key}:`, value);  // Log para o valor final formatado de qualquer outra chave
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
                    padding: '1em 3em',
                    background: '#fff',
                    customClass: {
                        popup: 'swal-wide',
                        icon: 'swal-custom-icon', // Aplicando a classe customizada
                        confirmButton: 'swal-custom-confirm-button', // Classe para o botão de fechar
                    },
                    didOpen: () => {
                        const swalIcon = document.querySelector('.swal-custom-icon');
                        if (swalIcon) {
                            swalIcon.style.width = '48px';  // Ajuste da largura do ícone
                            swalIcon.style.height = '48px'; // Ajuste da altura do ícone
                            swalIcon.style.fontSize = '20px'; // Ajuste do tamanho da fonte
                            swalIcon.style.lineHeight = '48px'; // Centraliza o "i"
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
        // Substitui tags HTML e formata o texto corretamente para o terminal
        const cleanText = text
            .replace(/<span[^>]*>/g, '')  // Remove as tags <span>
            .replace(/<\/span>/g, '')     // Remove as tags </span>
            .replace(/<br\s*\/?>/g, '\n') // Substitui <br> por quebras de linha
            .replace(/\s{2,}/g, ' ')      // Substitui múltiplos espaços por um único espaço
            .replace(/&quot;/g, '"')      // Converte &quot; para aspas duplas
            .replace(/&nbsp;/g, ' ')      // Substitui &nbsp; por espaços normais
            .trim();                      // Remove espaços no início e fim
    
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

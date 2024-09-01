import React, { useContext, useEffect, useState } from "react";
import { UuidContext } from '../contexts/UuidContext';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { BsFire } from 'react-icons/bs';
import { IoCube } from 'react-icons/io5';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';
import rocket from '../img/rocket.gif';

function PageSeeAllTasks() {
    const { uuid } = useContext(UuidContext);
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                console.log('UUID from context:', uuid);

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

    const handleViewDetails = (task) => {
        console.log('Detalhes da tarefa:', task);
        toast.info(`Detalhes da tarefa: ${task.nome}`);
    };

    const mapTypeToLabel = (type) => {
        const typeMapping = {
            regrafw: { label: 'Regra de Firewall', icon: <BsFire style={{ color: '#bb0202' }} /> },
            ip: { label: 'Objeto IP', icon: <IoCube style={{ color: 'rgb(0 124 255)' }} /> },
            fqdn: { label: 'Objeto FQDN', icon: <IoCube style={{ color: 'rgb(0 124 255)' }} /> },
            address: { label: 'Objeto Address Group', icon: <IoCube style={{ color: 'rgb(0 124 255)' }} /> }
        };
        return typeMapping[type] || { label: type, icon: null }; // Retorna o valor mapeado ou o original se não encontrado
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        }).replace(/\/\d{4}/, ''); // Remove o ano do formato da data
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
                <div className="center"><AiOutlineLoading3Quarters className="loading-icon" /></div>
            ) : error ? (
                <div>Erro: {error}</div>
            ) : (
                <div className="tasks-table-container">
                    <table className="tasks-table">
                        <thead>
                            <tr>
                                <th className="col-created-at">Data de Criação</th>
                                <th className="col-type">Tipo de Regra</th>
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
                                            >
                                                Detalhes
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
        </div>
    );
}

export default PageSeeAllTasks;

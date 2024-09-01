import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { AiOutlineLoading3Quarters } from "react-icons/ai";

import { FaPlus } from "react-icons/fa";
import { BsPencilFill } from "react-icons/bs";
import { FaTrash } from "react-icons/fa";
import { FaCheck } from "react-icons/fa";
import { FaArrowRotateLeft } from "react-icons/fa6";

function EditableLocalidades() {
    const [localidades, setLocalidades] = useState([]);
    const [newLocalidade, setNewLocalidade] = useState(''); // Estado para nova localidade
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editIndex, setEditIndex] = useState(null); // Estado para gerenciar qual item está sendo editado
    const [editedName, setEditedName] = useState(''); // Estado para armazenar o novo nome da localidade
    const [isSaving, setIsSaving] = useState(false); // Estado para controlar a atividade de salvamento

    useEffect(() => {
        const fetchLocalidades = async () => {
            try {
                const response = await fetch('/api/getInterfaceOuLocalidade?type=localidades');
                if (!response.ok) {
                    throw new Error('Erro ao buscar localidades');
                }
                const data = await response.json();
                setLocalidades(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLocalidades();
    }, []);

    const MySwal = withReactContent(Swal);

    const handleDeleteClick = (index) => {
        const localidade = localidades[index];
        MySwal.fire({
            title: `Deseja excluir a localidade ${localidade.nome}?`,
            text: "As interfaces associadas também serão excluídas!",
            icon: 'warning',
            showCancelButton: true,
            reverseButtons: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#a6a6a6',
            cancelButtonText: 'Cancelar',
            confirmButtonText: 'Excluir'
        }).then((result) => {
            if (result.isConfirmed) {
                fetch('/api/deleteInterfaceOuLocalidade', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        type: 'localidades', // Indica que a exclusão é de uma localidade
                        nome: localidade.nome,
                        empresa: 'empresa_teste'
                    })
                })
                .then(response => {
                    if (!response.ok) {
                        return response.json().then(data => Promise.reject(data));
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.success) {
                        const updatedLocalidades = localidades.filter((_, i) => i !== index);
                        setLocalidades(updatedLocalidades);
                        toast.success(data.message);
                    } else {
                        toast.error(data.message || 'Erro ao excluir localidade.');
                    }
                })
                .catch(error => {
                    console.error('Erro ao excluir localidade:', error);
                    toast.error('Erro ao excluir localidade: ' + (error.message || 'Erro desconhecido'));
                });
            }
        });
    };
    
    const handleAddClick = async () => {
        if (!newLocalidade.trim()) {
            toast.error("Por favor, insira um nome para a nova localidade.");
            return;
        }
        
        setIsSaving(true);
        
        try {
            const response = await fetch('/api/sendNewLocalidade', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nome: newLocalidade,
                    empresa: 'empresa_teste',
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                toast.error(errorData.message || 'Erro ao adicionar localidade');
                throw new Error(errorData.message || 'Erro ao adicionar localidade');
            }

            const data = await response.json();
            toast.success('Localidade adicionada com sucesso!');
            setLocalidades([...localidades, { nome: newLocalidade }]);
            setNewLocalidade(''); // Limpa o campo de input após o sucesso
        } catch (err) {
            console.error('Erro ao adicionar localidade:', err);
            toast.error('Erro ao adicionar localidade: ' + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleEditClick = (index) => {
        setEditIndex(index);
        setEditedName(localidades[index].nome); // Armazena o nome atual para edição
    };

    const handleCancelClick = () => {
        setEditIndex(null);
        setEditedName(''); // Reseta o nome editado ao cancelar
        setIsSaving(false); // Garante que o estado de salvamento seja redefinido
    };

    const handleSaveClick = async (index) => {
        setIsSaving(true); // Ativa o estado de salvamento
        const oldName = localidades[index].nome; // Armazena o nome antigo para possíveis restaurações
        const newName = editedName;
    
        try {
            const response = await fetch('/api/updateLocalidade', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    oldName: oldName,
                    newName: newName,
                    empresa: 'empresa_teste',
                }),
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 409) {
                    toast.error(errorData.message);
                    setEditedName(oldName); // Restaura o nome original no input se houver conflito
                } else {
                    toast.error(errorData.message);
                    throw new Error(errorData.message || 'Erro desconhecido ao salvar a localidade');
                }
            } else {
                toast.success('Localidade salva com sucesso!');
                // Atualiza a lista de localidades com o novo nome
                const updatedLocalidades = [...localidades];
                updatedLocalidades[index].nome = newName;
                setLocalidades(updatedLocalidades);
                setEditIndex(null); // Fecha o modo de edição em caso de sucesso
                setEditedName('');
            }
        } catch (err) {
            toast.error('Erro ao salvar localidade: ' + err.message);
            setError(err.message);
        } finally {
            setIsSaving(false); // Desativa o estado de salvamento
        }
    };
    

    if (isLoading) {
        return <div className="center"><AiOutlineLoading3Quarters className="loading-icon" /></div>
    }

    if (error) {
        return <div>Erro: {error}</div>;
    }

    return (
        <>
            <ToastContainer />
            <h3>Localidades</h3>
            {localidades.map((localidade, index) => (
                <div key={index} className="EditableLocalidades">
                    <input
                        className={`editableText ${editIndex === index ? '' : 'blockedInput'}`}
                        type="text"
                        disabled={editIndex !== index}
                        value={editIndex === index ? editedName : localidade.nome}
                        onChange={(e) => setEditedName(e.target.value)} // Atualiza o nome enquanto edita
                    />
                    <div className="divDosBotoes">
                        <button
                            className={`btn-excluir ${editIndex === index ? 'off' : ''}`}
                            onClick={() => handleDeleteClick(index)}
                            disabled={isSaving}
                            title="Excluir" // Tooltip adicionado aqui
                        >
                            <FaTrash />
                        </button>
                        <button
                            className={`btn-editar ${editIndex === index ? 'off' : ''}`}
                            onClick={() => handleEditClick(index)}
                            disabled={isSaving}
                            title="Editar" // Tooltip adicionado aqui
                        >
                            <BsPencilFill />
                        </button>
                        <button
                            className={`btn-cancelar ${editIndex === index ? '' : 'off'}`}
                            onClick={handleCancelClick}
                            disabled={isSaving}
                            title="Cancelar" // Tooltip adicionado aqui
                        >
                            <FaArrowRotateLeft />
                        </button>
                        <button
                            className={`btn-salvar ${editIndex === index ? '' : 'off'}`}
                            onClick={() => handleSaveClick(index)}
                            disabled={isSaving}
                            title="Salvar" // Tooltip adicionado aqui
                        >
                            <FaCheck />
                        </button>
                    </div>
                </div>
            ))}
            <div className="EditableLocalidades">
                <input
                    className="editableText bigInput"
                    type="text"
                    placeholder="Nome da localidade"
                    value={newLocalidade}
                    onChange={(e) => setNewLocalidade(e.target.value)} // Atualiza o valor da nova localidade
                />
                <div className="divDosBotoes">
                    <button
                        className="btn-addLocalidade"
                        onClick={handleAddClick}
                        disabled={isSaving}
                        title="Adicionar Localidade"
                    >
                        <FaPlus />
                    </button>
                </div>
            </div>
        </>
    );
}

export default EditableLocalidades;

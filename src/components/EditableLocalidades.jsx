import React, { useState, useEffect, useContext } from "react";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { UuidContext } from '../contexts/UuidContext';

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
    const { uuid } = useContext(UuidContext); // Obtém o uuid da empresa a partir do contexto

    useEffect(() => {
        const fetchLocalidades = async () => {
            try {
                const response = await fetch(`/api/getInterfaceOuLocalidade?type=localidades&empresa=${uuid}`); // Inclui o uuid da empresa na query
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

        if (uuid) { // Garante que o uuid está disponível
            fetchLocalidades();
        }
    }, [uuid]);

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
                        type: 'localidades',
                        nome: localidade.nome,
                        empresa: uuid, // Inclui o uuid da empresa
                    })
                }).then(async (res) => {
                    if (res.ok) {
                        setLocalidades(localidades.filter((_, i) => i !== index));
                        toast.success("Localidade excluída com sucesso");
                    } else {
                        const error = await res.json();
                        toast.error(error.message || "Erro ao excluir localidade");
                    }
                }).catch(err => {
                    toast.error("Erro ao excluir localidade: " + err.message);
                });
            }
        });
    };

    const handleAddClick = async () => {
        if (!newLocalidade.trim()) {
            toast.error("Por favor, insira um nome para a nova localidade.");
            return;
        }

        if (!uuid) {
            toast.error("Erro ao obter o UUID da empresa.");
            return;
        }

        setIsSaving(true);

        try {
            const response = await fetch('/api/sendNewInterfaceOuLocalidade', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: 'localidades',
                    nome: newLocalidade.trim(),
                    empresa: uuid, // Inclui o uuid da empresa no corpo da requisição
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                toast.error(errorData.message || 'Erro ao adicionar localidade');
                throw new Error(errorData.message || 'Erro ao adicionar localidade');
            }

            const data = await response.json();
            toast.success('Localidade adicionada com sucesso!');
            setLocalidades([...localidades, { nome: newLocalidade.trim() }]);
            setNewLocalidade('');
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
        setIsSaving(true);
        const oldName = localidades[index].nome;
        const newName = editedName;

        try {
            const response = await fetch('/api/updateInterfaceOuLocalidade', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: 'localidades',
                    oldName: oldName,
                    newName: newName,
                    empresa: uuid, // Inclui o uuid da empresa
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                toast.error(errorData.message || 'Erro ao salvar localidade');
                return;
            }

            const updatedLocalidade = [...localidades];
            updatedLocalidade[index].nome = newName;
            setLocalidades(updatedLocalidade);
            setEditIndex(null);
            setEditedName('');
            toast.success('Localidade atualizada com sucesso!');
        } catch (err) {
            toast.error('Erro ao salvar localidade: ' + err.message);
        } finally {
            setIsSaving(false);
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

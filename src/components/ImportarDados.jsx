import React, { useState, useEffect, useContext } from "react";
import { AiOutlineUpload, AiOutlineLoading3Quarters } from "react-icons/ai";
import { BsPencilFill } from "react-icons/bs";
import { AuthContext } from "../contexts/AuthContext";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

function ImportarDados() {
    const [localidades, setLocalidades] = useState([]);
    const [loadingLocalidades, setLoadingLocalidades] = useState(true);
    const { uuid } = useContext(AuthContext);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchLocalidades = async () => {
            try {
                const response = await fetch(`/api/getInterfaceOuLocalidade?type=localidades&empresa=${uuid}`);
                if (!response.ok) {
                    throw new Error('Erro ao buscar localidades');
                }
                const data = await response.json();

                // Simulando dados de último upload (nome e data) para cada localidade
                const enrichedData = await Promise.all(
                    data.map(async (item) => {
                        try {
                            const resp = await fetch(`/api/getLastImportDate?empresa=${uuid}&localidade=${encodeURIComponent(item.nome)}`);
                            const result = await resp.json();
                
                            return {
                                ...item,
                                ultimoArquivo: result.lastImportDate
                                    ? { data: new Date(result.lastImportDate).toLocaleString() }
                                    : null,
                            };
                        } catch (error) {
                            console.error('Erro ao buscar última data para localidade:', item.nome, error);
                            return {
                                ...item,
                                ultimoArquivo: null,
                            };
                        }
                    })
                );
                
                setLocalidades(enrichedData);
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingLocalidades(false);
            }
        };

        if (uuid) {
            fetchLocalidades();
        }
    }, [uuid]);

    const handleEditClick = (index) => {
        const localidade = localidades[index];

        MySwal.fire({
            title: `Importar para: ${localidade.nome}`,
            html: (
                <div>
                    {localidade.ultimoArquivo ? (
                        <div style={{ marginBottom: '15px', textAlign: 'left' }}>
                            <strong>Data de upload:</strong> {localidade.ultimoArquivo.data}
                        </div>
                    ) : (
                        <p style={{ marginBottom: '15px' }}>Nenhum arquivo foi importado ainda para esta localidade.</p>
                    )}
                    <input type="file" id="fileInput" className="swal2-file" placeholder="Escolha"/>
                </div>
            ),
            showCancelButton: true,
            confirmButtonText: 'Importar',
            cancelButtonText: 'Cancelar',
            preConfirm: async () => {
                const fileInput = Swal.getPopup().querySelector('#fileInput');
                const file = fileInput.files[0];

                if (!file) {
                    Swal.showValidationMessage('Por favor, selecione um arquivo.');
                    return;
                }

                const formData = new FormData();
                formData.append('file', file);
                formData.append('localidade', localidade.nome);
                formData.append('empresa', uuid);  // <-- adicionando empresa


                setIsSaving(true);
                try {
                    const response = await fetch('/api/importarInterfaces.js', {
                        method: 'POST',
                        body: formData,
                    });

                    if (!response.ok) {
                        throw new Error('Falha ao importar');
                    }

                    // Simulando atualização local com a data atual
                    const now = new Date();
                    const formattedDate = now.toLocaleString();

                    setLocalidades((prev) => {
                        const newLocalidades = [...prev];
                        newLocalidades[index].ultimoArquivo = {
                            nome: file.name,
                            data: formattedDate,
                        };
                        return newLocalidades;
                    });

                    return 'success';
                } catch (err) {
                    Swal.showValidationMessage('Erro ao importar dados. Tente novamente.');
                    console.error(err);
                } finally {
                    setIsSaving(false);
                }
            },
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire('Sucesso!', 'Arquivo importado com sucesso.', 'success');
            }
        });
    };

    if (loadingLocalidades) {
        return (
            <div className="loading-icon-container center">
                <AiOutlineLoading3Quarters className="loading-icon" />
                <span>Carregando localidades...</span>
            </div>
        );
    }

    if (localidades.length === 0) {
        return <p>Não há localidades cadastradas para esta empresa.</p>;
    }

    return (
        <div className="formPai" id="form_importarDados">
            <h3><AiOutlineUpload /> Importar Dados por Localidade</h3>
            {localidades.map((localidade, index) => (
                <div key={index} className="formDiv" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div className="divson">{localidade.nome}</div>
                    <button
                        className={`btn-editar`}
                        onClick={() => handleEditClick(index)}
                        disabled={isSaving}
                        title="Editar"
                    >
                        <BsPencilFill />
                    </button>
                </div>
            ))}
        </div>
    );
}

export default ImportarDados;

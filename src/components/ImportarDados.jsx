import React, { useState, useEffect, useContext } from "react";
import { AiOutlineUpload, AiOutlineLoading3Quarters, AiOutlineQuestionCircle } from "react-icons/ai";
import { AuthContext } from "../contexts/AuthContext";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { toast } from 'react-toastify';  // ✅ Não precisa mais do ToastContainer aqui

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
            html: `
                <p>Importe um arquivo <strong>.txt</strong> com as configurações do firewall desta localidade</p>
                <label for="fileInput" class="custom-file-upload">
                    Selecionar arquivo .txt
                </label>
                <input type="file" id="fileInput" class="swal2-file" accept=".txt" style="display:none"/>
                <p id="file-name" style="margin-top: 10px; font-style: italic; color: grey;"></p>
            `,
            showCancelButton: true,
            confirmButtonText: 'Importar',
            cancelButtonText: 'Cancelar',
            didOpen: () => {
                const fileInput = Swal.getPopup().querySelector('#fileInput');
                const fileNameDisplay = Swal.getPopup().querySelector('#file-name');
                const confirmButton = Swal.getConfirmButton();

                confirmButton.disabled = true;

                fileInput.addEventListener('change', (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        fileNameDisplay.textContent = `Selecionado: ${file.name}`;
                        if (file.name.endsWith('.txt')) {
                            confirmButton.disabled = false;
                        } else {
                            confirmButton.disabled = true;
                            fileNameDisplay.textContent = 'Arquivo inválido. Selecione um arquivo .txt';
                        }
                    } else {
                        fileNameDisplay.textContent = '';
                        confirmButton.disabled = true;
                    }
                });
            },
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
                formData.append('empresa', uuid);
                formData.append('action', 'import');

                setIsSaving(true);
                try {
                    const response = await fetch('/api/getInterfaceOuLocalidade', {
                        method: 'POST',
                        body: formData,
                    });

                    if (!response.ok) {
                        throw new Error('Falha ao importar');
                    }

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

    const handleHelpClick = () => {
        const scriptText = `
config system console
set output standard
end

show system zone
show system interface
show firewall address
show firewall addrgrp
show firewall service custom
show firewall service group

config system console
set output more
end`.trim();

        const uniqueId = 'copy-help-script';

        MySwal.fire({
            title: 'Ajuda - Importação',
            html: `
                <p style="margin-bottom: 15px; text-align: left;">
                    Para gerar o arquivo de importação no Fortigate, execute o seguinte script no console:
                </p>
                <div style="position: relative; display: flex; justify-content: space-between;">
                    <pre style="background-color: #282A36; color: #50FA7B; padding: 10px; white-space: pre-wrap; word-wrap: break-word; flex-grow: 1; text-align: left; max-height: 400px; overflow-y: auto;">
        ${scriptText}
                    </pre>
                    <button id="${uniqueId}" class="btn-copy">Copiar</button>
                </div>
                <p style="margin-top: 15px; text-align: left;">
                    Depois, baixe o retorno e salve em um arquivo <strong>.txt</strong>.
                </p>
            `,
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
                const copyButton = document.getElementById(uniqueId);
                if (copyButton) {
                    copyButton.addEventListener('click', () => {
                        const pre = copyButton.parentElement.querySelector('pre');
                        if (pre) {
                            const textToCopy = pre.innerText;
                            copyPlainTextToClipboard(textToCopy); // ✅ chama a função de copiar
                        }
                    });
                }
            }
        });
        
    };

    const copyPlainTextToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            // ✅ FORÇA o toast com leve atraso para garantir que aparece mesmo dentro do Swal
            setTimeout(() => {
                toast.dismiss();
                toast.info('Script copiado com sucesso!', { autoClose: 2000 });
            }, 50);
        }).catch(err => {
            console.error('Erro ao copiar o script:', err);
            setTimeout(() => {
                toast.dismiss();
                toast.error('Erro ao copiar o script!', { autoClose: 2000 });
            }, 50);
        });
    };

    if (loadingLocalidades) {
        return (
            <div className="loading-icon-container center">
                <AiOutlineLoading3Quarters className="loading-icon" />
            </div>
        );
    }

    if (localidades.length === 0) {
        return <p>Não há localidades cadastradas para esta empresa.</p>;
    }

    return (
        <div className="formPai" id="form_importarDados">
            <div className="tituloComAjuda">
                <h3>Importar Dados por Localidade</h3>
                <button className="btn-ajuda" onClick={handleHelpClick} title="Ajuda">
                    <AiOutlineQuestionCircle />
                </button>
            </div>
            {localidades.map((localidade, index) => (
                <div key={index} className="EditableLocalidades">
                    <input
                        className="blockedInput"
                        type="text"
                        disabled
                        value={localidade.nome}
                    />
                    <div className="divDosBotoes">
                        <button
                            className="btn-editar"
                            onClick={() => handleEditClick(index)}
                            disabled={isSaving}
                            title="Importar dados"
                        >
                            <AiOutlineUpload />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default ImportarDados;

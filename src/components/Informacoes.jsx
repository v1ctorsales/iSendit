import React, { useState, useEffect, useContext } from "react";
import { BsPatchCheckFill } from "react-icons/bs";
import { AiOutlineLoading3Quarters } from "react-icons/ai"; // Importando o ícone de loading
import { AuthContext } from '../contexts/AuthContext';
import { FaBuilding } from "react-icons/fa";
import { FaHandshake } from "react-icons/fa";

function Informacoes() {
    const [empresa, setEmpresa] = useState('');
    const [email, setEmail] = useState('');
    const [paiNome, setPaiNome] = useState(''); // Alterado para paiNome
    const [paiEmail, setPaiEmail] = useState(''); // Alterado para paiEmail
    const [empresasFilhas, setEmpresasFilhas] = useState([]); // Para armazenar as empresas filhas
    const [isLoading, setIsLoading] = useState(true); // Estado para controle de loading
    const { uuid, destinataria } = useContext(AuthContext);

    useEffect(() => {
        const fetchEmpresaInfo = async () => {
            try {
                const response = await fetch('/api/getEmpresaInfo', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ uuid, destinataria }),
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('Dados da empresa:', data); // Log para verificar os dados recebidos

                    // Se destinataria === true, a empresa é Pai, exibe as empresas filhas
                    if (destinataria) {
                        setEmpresa(data.paiNome || 'Nome não disponível');
                        setEmail(data.paiEmail || 'Email não disponível');
                        setEmpresasFilhas(data.empresasFilhas || []);
                    } else {
                        // Se destinataria === false, a empresa é Filha, exibe a empresa Pai
                        setEmpresa(data.nome || 'Nome não disponível');
                        setEmail(data.email || 'Email não disponível');
                        setPaiNome(data.paiNome || 'Nome não disponível');
                        setPaiEmail(data.paiEmail || 'Email não disponível');
                    }
                } else {
                    console.error('Erro ao buscar informações da empresa');
                }
            } catch (error) {
                console.error('Erro ao conectar ao backend:', error);
            } finally {
                setIsLoading(false); // Desativa o loading após carregar os dados
            }
        };

        if (uuid) {
            fetchEmpresaInfo();  // Só faz a chamada se uuid estiver disponível
        } else {
            setIsLoading(false);  // Se não houver uuid, não tenta buscar e já desativa o loading
        }
    }, [uuid, destinataria]);  // Certifique-se de que o efeito depende do uuid e destinataria

    if (isLoading) {
        return (
            <div className="loading-icon-container center">
                <AiOutlineLoading3Quarters className="loading-icon" />
            </div>
        );
    }

    return (
        <> 
        {destinataria ? (
            <>
                <div className="formPai" id="form_ip">
                    <h3><FaBuilding /> Minha Empresa</h3>
                    <div className="formDiv">
                        <div className="divson">Nome</div>
                        <input
                            className="blockedInput" 
                            type="text" 
                            value={empresa} 
                            disabled
                        />
                    </div>
                    <div className="formDiv">
                        <div className="divson">Email</div>
                        <input
                            className="blockedInput" 
                            type="text" 
                            value={email} 
                            disabled
                        />
                    </div>
                </div>

                {/* Exibindo as empresas filhas com espaçamento adequado */}
                {empresasFilhas.length > 0 && (
                    <div className="formPai" id="form_empresasFilhas">
                        <h3><FaHandshake /> Empresa(s) Parceira(s)</h3>
                        {empresasFilhas.map((filha, index) => (
                            <div key={index} className="formFilha">
                                <div className="formDiv">
                                    <div className="divson">Nome</div>
                                    <input
                                        className="blockedInput"
                                        type="text"
                                        value={filha.nome || 'Nome não disponível'}
                                        disabled
                                    />
                                </div>
                                <div className="formDiv">
                                    <div className="divson">Email</div>
                                    <input
                                        className="blockedInput"
                                        type="text"
                                        value={filha.email || 'Email não disponível'}
                                        disabled
                                    />
                                </div>
                                <br></br> 
                            </div>
                        ))}
                    </div>
                )}
            </>
        ) : (
            <>
                {/* Se for empresa Filha (destinataria === false) */}
                <div className="formPai" id="form_ip">
                    <h3><FaBuilding /> Minha Empresa</h3>
                    <div className="formDiv">
                        <div className="divson">Nome</div>
                        <input
                            className="blockedInput" 
                            type="text" 
                            value={empresa} 
                            disabled
                        />
                    </div>
                    <div className="formDiv">
                        <div className="divson">Email</div>
                        <input
                            className="blockedInput" 
                            type="text" 
                            value={email} 
                            disabled
                        />
                    </div>
                </div>

                {/* Exibindo informações da empresa pai */}
                <div className="formPai" id="form_ip">
                    <h3><FaHandshake /> Empresa Parceira</h3>
                    <div className="formDiv">
                        <div className="divson">Nome</div>
                        <input
                            className="blockedInput" 
                            type="text" 
                            value={paiNome} 
                            disabled
                        />
                    </div>
                    <div className="formDiv">
                        <div className="divson">Email</div>
                        <input
                            className="blockedInput" 
                            type="text" 
                            value={paiEmail} 
                            disabled
                        />
                    </div>
                </div>
            </>
        )}
        </>
    );
}

export default Informacoes;

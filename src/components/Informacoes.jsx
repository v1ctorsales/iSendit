import React, { useState, useEffect } from "react";
import { BsPatchCheckFill } from "react-icons/bs";
import { AiOutlineLoading3Quarters } from "react-icons/ai"; // Importando o ícone de loading

function Informacoes() {
    const [empresa, setEmpresa] = useState('');
    const [email, setEmail] = useState('');
    const [parceiroNome, setParceiroNome] = useState('');
    const [parceiroEmail, setParceiroEmail] = useState('');
    const [isLoading, setIsLoading] = useState(true); // Estado para controle de loading

    useEffect(() => {
        const fetchEmpresaInfo = async () => {
            try {
                const response = await fetch('/api/getEmpresaInfo', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ uuid: '009eb4c9-8251-4ece-b665-d35f379a02e6' }),
                });

                if (response.ok) {
                    const data = await response.json();
                    setEmpresa(data.nome);
                    setEmail(data.email);
                    setParceiroNome(data.parceiroNome);
                    setParceiroEmail(data.parceiroEmail);
                } else {
                    console.error('Erro ao buscar informações da empresa');
                }
            } catch (error) {
                console.error('Erro ao conectar ao backend:', error);
            } finally {
                setIsLoading(false); // Desativa o loading após carregar os dados
            }
        };

        fetchEmpresaInfo();
    }, []);

    if (isLoading) {
        return (
            <div className="loading-icon-container center">
                <AiOutlineLoading3Quarters className="loading-icon" />
            </div>
        );
    }

    return (
        <> 
        <div className="formPai" id="form_ip">
            <div className="formDiv">
                <div className="divson">Empresa</div>
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
        <br></br>
        <div className="formPai" id="form_ip">
            <div className="formDiv">
                <div className="divson">Parceiro</div>
                <input
                    className="blockedInput" 
                    type="text" 
                    value={parceiroNome || 'opcional'} 
                    disabled
                />
            </div>
            <div className="formDiv">
                <div className="divson">Email</div>
                <input
                    className="blockedInput" 
                    type="text" 
                    value={parceiroEmail || 'opcional'} 
                    disabled
                />
            </div>
        </div>
        </>
    )
}

export default Informacoes;
